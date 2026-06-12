import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/auth/session';

export async function POST() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  return NextResponse.redirect(new URL('/admin/login', process.env.APP_URL ?? 'http://localhost:3000'), 303);
}
