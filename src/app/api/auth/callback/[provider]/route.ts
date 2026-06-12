import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, wishlists, outfits } from '@/lib/schema';
import { exchangeCode, fetchProfile, type OAuthProvider } from '@/lib/auth/oauth';
import { signSession, SESSION_COOKIE } from '@/lib/auth/session';
import { isUUID } from '@/lib/validation';

const VALID_PROVIDERS = ['kakao', 'google'] as const;
const BASE = process.env.APP_URL ?? 'http://localhost:3000';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!VALID_PROVIDERS.includes(provider as OAuthProvider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const jar = await cookies();
  const savedState = jar.get('fitlook_oauth_state')?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  try {
    const accessToken = await exchangeCode(provider as OAuthProvider, code);
    const profile = await fetchProfile(provider as OAuthProvider, accessToken);

    // Look for existing OAuth user
    const [existing] = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerId, profile.providerId)));

    // Get guest user from cookie
    const guestUid = jar.get('fitlook_uid')?.value;
    const hasGuest = guestUid && isUUID(guestUid);
    let guestUser: typeof users.$inferSelect | undefined;
    if (hasGuest) {
      const [g] = await db.select().from(users).where(and(eq(users.id, guestUid), eq(users.provider, 'guest')));
      guestUser = g;
    }

    let userId: string;

    if (existing) {
      userId = existing.id;
      // Optionally update name/avatar
      if (profile.name || profile.avatarUrl) {
        await db.update(users).set({
          name: profile.name ?? existing.name,
          avatarUrl: profile.avatarUrl ?? existing.avatarUrl,
          email: existing.email ?? profile.email ?? null,
        }).where(eq(users.id, existing.id));
      }
      if (guestUser) {
        // Merge guest into existing: move wishlists, outfits, then delete guest
        // Step a: remove duplicate wishlists
        const existingWishlists = await db.select({ productId: wishlists.productId }).from(wishlists).where(eq(wishlists.userId, existing.id));
        const existingProductIds = existingWishlists.map(w => w.productId);
        if (existingProductIds.length > 0) {
          await db.delete(wishlists).where(and(eq(wishlists.userId, guestUser.id), inArray(wishlists.productId, existingProductIds)));
        }
        // Step b: migrate remaining wishlists
        await db.update(wishlists).set({ userId: existing.id }).where(eq(wishlists.userId, guestUser.id));
        // Step c: migrate outfits
        await db.update(outfits).set({ userId: existing.id }).where(eq(outfits.userId, guestUser.id));
        // Step d: delete guest user
        await db.delete(users).where(eq(users.id, guestUser.id));
      }
    } else if (guestUser) {
      // Upgrade guest in place (single UPDATE)
      try {
        await db.update(users).set({
          provider,
          providerId: profile.providerId,
          email: profile.email ?? null,
          name: profile.name ?? guestUser.name,
          avatarUrl: profile.avatarUrl ?? guestUser.avatarUrl,
        }).where(eq(users.id, guestUser.id));
      } catch (e: unknown) {
        // email unique conflict: retry with email=null
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('unique') || msg.includes('duplicate')) {
          await db.update(users).set({
            provider,
            providerId: profile.providerId,
            email: null,
            name: profile.name ?? guestUser.name,
            avatarUrl: profile.avatarUrl ?? guestUser.avatarUrl,
          }).where(eq(users.id, guestUser.id));
        } else throw e;
      }
      userId = guestUser.id;
    } else {
      // New user — insert
      let newUser: typeof users.$inferSelect;
      try {
        const [inserted] = await db.insert(users).values({
          provider,
          providerId: profile.providerId,
          email: profile.email ?? null,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        }).returning();
        newUser = inserted;
      } catch (e: unknown) {
        // email unique conflict: retry with email=null
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('unique') || msg.includes('duplicate')) {
          const [inserted] = await db.insert(users).values({
            provider,
            providerId: profile.providerId,
            email: null,
            name: profile.name,
            avatarUrl: profile.avatarUrl,
          }).returning();
          newUser = inserted;
        } else throw e;
      }
      userId = newUser.id;
    }

    // Sign session token
    const sessionToken = await signSession({ sub: userId, provider, name: profile.name });

    const res = NextResponse.redirect(new URL('/', BASE));
    res.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    // Clear state and legacy guest cookies
    res.cookies.delete('fitlook_oauth_state');
    res.cookies.delete('fitlook_uid');
    return res;
  } catch (e) {
    console.error('OAuth callback error:', e);
    const res = NextResponse.redirect(new URL('/?auth_error=1', BASE));
    res.cookies.delete('fitlook_oauth_state');
    return res;
  }
}
