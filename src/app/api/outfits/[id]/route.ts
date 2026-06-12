import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { outfits } from '@/lib/schema';
import { isUUID } from '@/lib/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isUUID(id)) return NextResponse.json({ error: 'Outfit not found' }, { status: 404 });
    const outfit = await db.query.outfits.findFirst({
      where: eq(outfits.id, id),
      with: { items: { with: { product: true } } },
    });

    if (!outfit) {
      return NextResponse.json({ error: 'Outfit not found' }, { status: 404 });
    }
    return NextResponse.json(outfit);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
