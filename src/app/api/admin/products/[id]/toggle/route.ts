import { NextRequest, NextResponse } from 'next/server';
import { eq, not } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { isUUID } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth/admin';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    if (!isUUID(id)) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const [row] = await db
      .update(products)
      .set({ isAvailable: not(products.isAvailable) })
      .where(eq(products.id, id))
      .returning({ id: products.id, isAvailable: products.isAvailable });

    if (!row) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
