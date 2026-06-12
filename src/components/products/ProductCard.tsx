import { formatPrice, discountRate } from '@/lib/format';
import { AddToOutfitButton } from './AddToOutfitButton';
import type { products as productsType } from '@/lib/schema';

type Product = typeof productsType.$inferSelect & { category: { slug: string; name: string } | null };

export function ProductCard({ product }: { product: Product }) {
  const discount = discountRate(product.price, product.originalPrice);

  return (
    <a href={`/products/${product.id}`}>
      <div className="rounded-2xl overflow-hidden bg-white border border-surface hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer">
        {/* 이미지 */}
        <div className="relative aspect-[3/4] bg-surface overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          {/* 할인 뱃지 */}
          {discount && (
            <div className="absolute top-3 right-3 bg-accent-deep text-white px-3 py-1 rounded-full text-sm font-semibold">
              -{discount}%
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="p-4">
          {product.category && (
            <p className="text-xs text-ink font-semibold mb-1">{product.category.name}</p>
          )}
          <p className="text-xs text-ink/70 mb-1">{product.brand}</p>
          <h3 className="font-semibold text-ink line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-ink/50 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <AddToOutfitButton product={product} slot={product.category?.slug} />
        </div>
      </div>
    </a>
  );
}
