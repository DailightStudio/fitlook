import 'server-only';
import { and, desc, eq, ilike, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, outfits, products } from '@/lib/schema';

export async function getProducts(opts: {
  category?: string; search?: string; page?: number; limit?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(24, Math.max(1, opts.limit ?? 12));
  const conds = [eq(products.isAvailable, true)];
  if (opts.category) {
    const cat = await db.query.categories.findFirst({ where: eq(categories.slug, opts.category) });
    if (!cat) return { data: [], total: 0, page, limit };
    conds.push(eq(products.categoryId, cat.id));
  }
  if (opts.search) conds.push(ilike(products.name, `%${opts.search}%`));
  const where = and(...conds);
  const [data, [{ total }]] = await Promise.all([
    db.query.products.findMany({
      where, with: { category: true },
      orderBy: [desc(products.createdAt)],
      limit, offset: (page - 1) * limit,
    }),
    db.select({ total: sql<number>`count(*)::int` }).from(products).where(where),
  ]);
  return { data, total, page, limit };
}

export const getCategories = () => db.select().from(categories).orderBy(categories.id);

export const getPublicOutfits = () =>
  db.query.outfits.findMany({
    where: eq(outfits.isPublic, true),
    orderBy: [desc(outfits.createdAt)],
    limit: 30,
    with: { items: { with: { product: true } } },
  });

export const getOutfit = (id: string) =>
  db.query.outfits.findFirst({
    where: eq(outfits.id, id),
    with: { items: { with: { product: true } } },
  });
