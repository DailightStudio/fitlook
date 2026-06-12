import Link from 'next/link';
import { count, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, products } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [[productCount], [categoryCount], [unavailableCount]] = await Promise.all([
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(categories),
    db.select({ value: count() }).from(products).where(eq(products.isAvailable, false)),
  ]);

  const stats = [
    { label: '전체 상품', value: productCount.value },
    { label: '카테고리 수', value: categoryCount.value },
    { label: '비활성 상품', value: unavailableCount.value },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-800">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <Link
        href="/admin/products"
        className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
      >
        상품 목록 바로가기
      </Link>
    </div>
  );
}
