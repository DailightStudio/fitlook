import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { isUUID } from '@/lib/validation';

export const SESSION_COOKIE = 'fitlook_session';
export const ADMIN_COOKIE = 'fitlook_admin';

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET is not set');
}

function getSecret() {
  const s = SESSION_SECRET ?? 'dev-fallback-secret-not-for-production';
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  sub: string;
  provider: string;
  name?: string;
}

export async function signSession(payload: SessionPayload, expiresIn = '30d'): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch (e) {
    // Expected for expired/invalid tokens; log unexpected errors
    if (e instanceof Error && !e.message.includes('expired') && !e.message.includes('invalid')) {
      console.error('JWT verify error:', e.message);
    }
    return null;
  }
}

export async function getSessionUser(): Promise<{ id: string; provider: string; name?: string } | null> {
  const jar = await cookies();
  const tok = jar.get(SESSION_COOKIE)?.value;
  if (tok) {
    const p = await verifyToken(tok);
    if (p?.sub) return { id: p.sub, provider: p.provider, name: p.name };
  }
  // Legacy guest cookie — must verify the row exists and is actually a guest
  const uid = jar.get('fitlook_uid')?.value;
  if (uid && isUUID(uid)) {
    const [row] = await db
      .select({ id: users.id, provider: users.provider, name: users.name })
      .from(users)
      .where(and(eq(users.id, uid), eq(users.provider, 'guest')));
    if (row) return { id: row.id, provider: 'guest', name: row.name ?? undefined };
  }
  return null;
}
