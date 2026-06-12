import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { wishlists } from '@/lib/schema';
import { isUUID } from '@/lib/validation';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    if (!isUUID(userId)) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });

    const rows = await db.query.wishlists.findMany({
      where: eq(wishlists.userId, userId),
      with: { product: true },
    });
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.id;

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }
    if (!isUUID(productId)) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }

    const [inserted] = await db
      .insert(wishlists)
      .values({ userId, productId })
      .onConflictDoNothing()
      .returning();

    if (inserted) return NextResponse.json({ action: 'added' });

    await db.delete(wishlists).where(
      and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)),
    );
    return NextResponse.json({ action: 'removed' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
