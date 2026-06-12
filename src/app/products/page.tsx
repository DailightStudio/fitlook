import { getCategories, getProducts } from '@/lib/queries';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryTabs } from '@/components/products/CategoryTabs';
import { SearchBar } from '@/components/products/SearchBar';
import { Pagination } from '@/components/products/Pagination';

export const dynamic = 'force-dynamic';
export const metadata = { title: '상품 | fitlook' };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}) {
  const { category, search, page } = await searchParams;
  const [cats, result] = await Promise.all([
    getCategories(),
    getProducts({
      category,
      search,
      page: Number(page) || 1,
      limit: 12,
    }),
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <CategoryTabs cats={cats} current={category} />
        <SearchBar defaultValue={search} />
        {result.data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink/70">상품을 찾을 수 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {result.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination
              total={result.total}
              page={result.page}
              limit={result.limit}
              basePath="/products"
              search={search}
              category={category}
            />
          </>
        )}
      </div>
    </div>
  );
}
