import Link from 'next/link';
import { and, count, desc, eq, ilike, SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, products } from '@/lib/schema';
import AvailabilityToggle from '@/components/admin/AvailabilityToggle';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const { search, category, page } = await searchParams;

  const currentPage = Math.max(1, Number.parseInt(page ?? '1', 10) || 1);
  const categoryId = Number.parseInt(category ?? '', 10);

  const conditions: SQL[] = [];
  if (search) conditions.push(ilike(products.name, `%${search}%`));
  if (Number.isInteger(categoryId) && categoryId > 0) {
    conditions.push(eq(products.categoryId, categoryId));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [categoryList, rows, [total]] = await Promise.all([
    db.select().from(categories).orderBy(categories.id),
    db
      .select({
        id: products.id,
        name: products.name,
        brand: products.brand,
        price: products.price,
        thumbnailUrl: products.thumbnailUrl,
        imageUrl: products.imageUrl,
        isAvailable: products.isAvailable,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(desc(products.createdAt), products.id)
      .limit(PAGE_SIZE)
      .offset((currentPage - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(products).where(where),
  ]);

  const totalPages = Math.max(1, Math.ceil(total.value / PAGE_SIZE));

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    params.set('page', String(p));
    return `/admin/products?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">상품 목록</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
        >
          상품 등록
        </Link>
      </div>

      <form method="get" className="flex gap-2 mb-6">
        <input
          type="text"
          name="search"
          defaultValue={search ?? ''}
          placeholder="상품명 검색"
          className="px-3 py-2 border rounded-lg text-sm bg-white"
        />
        <select
          name="category"
          defaultValue={category ?? ''}
          className="px-3 py-2 border rounded-lg text-sm bg-white"
        >
          <option value="">전체 카테고리</option>
          {categoryList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition"
        >
          검색
        </button>
      </form>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="px-4 py-3 font-medium">썸네일</th>
              <th className="px-4 py-3 font-medium">상품명</th>
              <th className="px-4 py-3 font-medium">브랜드</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">가격</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">등록일</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  상품이 없습니다
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.thumbnailUrl ?? row.imageUrl}
                      alt={row.name}
                      width={40}
                      height={50}
                      className="rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-800">{row.name}</td>
                  <td className="px-4 py-2 text-gray-600">{row.brand}</td>
                  <td className="px-4 py-2 text-gray-600">{row.categoryName ?? '-'}</td>
                  <td className="px-4 py-2 text-gray-800">{row.price.toLocaleString()}원</td>
                  <td className="px-4 py-2">
                    <AvailabilityToggle productId={row.id} isAvailable={row.isAvailable} />
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {row.createdAt.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6 text-sm">
        {currentPage > 1 ? (
          <Link href={buildPageHref(currentPage - 1)} className="px-3 py-1 border rounded-lg bg-white hover:bg-gray-50">
            이전
          </Link>
        ) : (
          <span className="px-3 py-1 border rounded-lg text-gray-300">이전</span>
        )}
        <span className="text-gray-600">
          {currentPage} / {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link href={buildPageHref(currentPage + 1)} className="px-3 py-1 border rounded-lg bg-white hover:bg-gray-50">
            다음
          </Link>
        ) : (
          <span className="px-3 py-1 border rounded-lg text-gray-300">다음</span>
        )}
      </div>
    </div>
  );
}
