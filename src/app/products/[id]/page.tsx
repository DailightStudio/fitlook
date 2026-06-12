import { notFound } from 'next/navigation';
import { getOutfit, getProducts, getPublicOutfits } from '@/lib/queries';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { formatPrice, discountRate } from '@/lib/format';
import { AddToOutfitButton } from '@/components/products/AddToOutfitButton';
import { ModelViewer } from '@/components/products/ModelViewer';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { category: true }
  });

  if (!product) notFound();

  const discount = product.originalPrice ? discountRate(product.price, product.originalPrice) : null;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 네비게이션 */}
        <a href="/products" className="text-primary hover:underline mb-6 inline-block">
          ← 상품 목록으로
        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 좌측: 이미지/3D 뷰어 */}
          <div className="space-y-4">
            {product.model3dUrl ? (
              <ModelViewer modelUrl={product.model3dUrl} productName={product.name} />
            ) : (
              <div className="aspect-[3/4] bg-white rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {product.thumbnailUrl && (
              <img
                src={product.thumbnailUrl}
                alt={`${product.name} 썸네일`}
                className="w-full rounded-2xl"
              />
            )}
          </div>

          {/* 우측: 상품 정보 */}
          <div className="space-y-6">
            {product.category && (
              <p className="text-sm text-primary font-semibold">{product.category.name}</p>
            )}

            <div>
              <h1 className="text-3xl font-bold text-ink mb-2">{product.name}</h1>
              <p className="text-lg text-ink/70">{product.brand}</p>
            </div>

            {/* 가격 */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
                {discount && (
                  <span className="bg-accent-deep text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{discount}%
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-lg text-ink/50 line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="space-y-3 bg-white p-4 rounded-2xl">
              {product.color && (
                <div className="flex justify-between">
                  <span className="text-ink/70">색상</span>
                  <span className="font-semibold text-ink">{product.color}</span>
                </div>
              )}
              {product.sizeOptions && product.sizeOptions.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink/70">사이즈</span>
                  <span className="font-semibold text-ink">{product.sizeOptions.join(', ')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink/70">매장</span>
                <span className="font-semibold text-ink">{product.shopName}</span>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              <a
                href={product.shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl text-center transition"
              >
                매장에서 구매하기
              </a>
              <AddToOutfitButton product={product} slot={product.category?.slug} />
            </div>

            {/* 태그 */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-ink/70">태그</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="bg-surface border border-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
