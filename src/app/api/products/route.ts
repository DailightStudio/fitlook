import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, ilike, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, products } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));

    const conditions = [eq(products.isAvailable, true)];

    if (category) {
      const [cat] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, category));
      if (!cat) {
        return NextResponse.json({ data: [], total: 0, page, limit });
      }
      conditions.push(eq(products.categoryId, cat.id));
    }

    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }

    const where = and(...conditions);

    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(products)
        .where(where)
        .orderBy(desc(products.createdAt), products.id)
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(products)
        .where(where),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, brand, price, imageUrl, shopUrl, shopName } = body;

    if (!name || !brand || typeof price !== 'number' || !imageUrl || !shopUrl || !shopName) {
      return NextResponse.json(
        { error: 'name, brand, price, imageUrl, shopUrl, shopName are required' },
        { status: 400 },
      );
    }

    const [row] = await db
      .insert(products)
      .values({
        name,
        brand,
        price,
        originalPrice: body.originalPrice ?? null,
        imageUrl,
        thumbnailUrl: body.thumbnailUrl ?? null,
        categoryId: body.categoryId ?? null,
        shopUrl,
        shopName,
        color: body.color ?? null,
        sizeOptions: body.sizeOptions ?? null,
        tags: body.tags ?? null,
        isAvailable: body.isAvailable ?? true,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
