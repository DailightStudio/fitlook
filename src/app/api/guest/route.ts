import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { isUUID } from '@/lib/validation';
import { getSessionUser } from '@/lib/auth/session';

const COOKIE = 'fitlook_uid';

export async function POST() {
  try {
    const session = await getSessionUser();
    // If they have a valid JWT session (not guest), just return that user
    if (session && session.provider !== 'guest') {
      return NextResponse.json({ userId: session.id });
    }

    const jar = await cookies();
    const existing = jar.get(COOKIE)?.value;
    if (existing && isUUID(existing)) {
      const u = await db.query.users.findFirst({ where: eq(users.id, existing) });
      if (u) return NextResponse.json({ userId: u.id });
    }
    const [user] = await db.insert(users)
      .values({
        email: `guest-${crypto.randomUUID()}@guest.fitlook.local`,
        name: '게스트',
        provider: 'guest',
      })
      .returning();
    const res = NextResponse.json({ userId: user.id });
    res.cookies.set(COOKIE, user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
