import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth/session';

export async function POST() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete('fitlook_uid');
  return NextResponse.redirect(new URL('/', process.env.APP_URL ?? 'http://localhost:3000'), 303);
}
