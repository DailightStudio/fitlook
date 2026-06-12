import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizeUrl, type OAuthProvider } from '@/lib/auth/oauth';

const VALID_PROVIDERS = ['kakao', 'google'] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!VALID_PROVIDERS.includes(provider as OAuthProvider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  try {
    const state = crypto.randomUUID();
    const url = buildAuthorizeUrl(provider as OAuthProvider, state);
    const res = NextResponse.redirect(url);
    res.cookies.set('fitlook_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'OAuth not configured' }, { status: 503 });
  }
}
