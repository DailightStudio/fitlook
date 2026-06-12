import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import type { outfits as outfitsType } from '@/lib/schema';

type Outfit = typeof outfitsType.$inferSelect & {
  items: Array<{ product: { imageUrl: string; price: number } }>;
};

export function OutfitGalleryCard({ outfit }: { outfit: Outfit }) {
  const totalPrice = outfit.items.reduce((sum, item) => sum + item.product.price, 0);
  const thumbnails = outfit.items.slice(0, 4);

  return (
    <Link href={`/outfits/${outfit.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
        {/* 2x2 Thumbnail Grid */}
        <div className="aspect-square bg-gray-100 grid grid-cols-2 gap-0.5 p-0.5">
          {thumbnails.map((item, i) => (
            <div key={i} className="bg-gray-200 overflow-hidden">
              <img
                src={item.product.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {thumbnails.length < 4 &&
            Array.from({ length: 4 - thumbnails.length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-100" />
            ))}
        </div>
        {/* Info */}
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-1">{outfit.title}</h3>
          <div className="flex justify-between items-baseline">
            <p className="text-xs font-bold">{formatPrice(totalPrice)}</p>
            <p className="text-xs text-gray-500">{outfit.items.length}개</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
