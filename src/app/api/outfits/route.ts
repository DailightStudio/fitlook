import { NextRequest, NextResponse } from 'next/server';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { outfitItems, outfits, products } from '@/lib/schema';
import { isUUID } from '@/lib/validation';
import { getSessionUser } from '@/lib/auth/session';

export async function GET() {
  try {
    const rows = await db.query.outfits.findMany({
      where: eq(outfits.isPublic, true),
      orderBy: desc(outfits.createdAt),
      limit: 20,
      with: { items: { with: { product: true } } },
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

    const body = await request.json();
    const { title, description, isPublic, items } = body;

    if (!title || !Array.isArray(items)) {
      return NextResponse.json({ error: 'title, items are required' }, { status: 400 });
    }

    const itemList = items as { productId: string; slot?: string }[];
    const productIds = [...new Set(itemList.map((i) => i.productId))];

    if (productIds.some((id) => !isUUID(id))) {
      return NextResponse.json({ error: 'Invalid productId in items' }, { status: 400 });
    }

    if (productIds.length > 0) {
      const existing = await db
        .select({ id: products.id })
        .from(products)
        .where(inArray(products.id, productIds));
      if (existing.length !== productIds.length) {
        return NextResponse.json({ error: 'One or more products not found' }, { status: 400 });
      }
    }

    const [outfit] = await db
      .insert(outfits)
      .values({ userId, title, description: description ?? null, isPublic: isPublic ?? false })
      .returning();

    let insertedItems: (typeof outfitItems.$inferSelect)[] = [];
    if (itemList.length > 0) {
      try {
        insertedItems = await db
          .insert(outfitItems)
          .values(itemList.map((item) => ({ outfitId: outfit.id, productId: item.productId, slot: item.slot ?? null })))
          .returning();
      } catch (e) {
        await db.delete(outfits).where(eq(outfits.id, outfit.id));
        throw e;
      }
    }

    return NextResponse.json({ ...outfit, items: insertedItems }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
