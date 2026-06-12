import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ user: null });
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      provider: users.provider,
      email: users.email,
    }).from(users).where(eq(users.id, session.id));
    return NextResponse.json({ user: user ?? null });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ user: null });
  }
}
