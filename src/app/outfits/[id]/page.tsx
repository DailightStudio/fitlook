import { notFound } from 'next/navigation';
import { getOutfit } from '@/lib/queries';
import { isSlot } from '@/lib/slots';
import { formatPrice } from '@/lib/format';
import { OutfitCanvas } from '@/components/outfits/OutfitCanvas';
import { CopyOutfitButton } from '@/components/outfits/CopyOutfitButton';
import type { Draft } from '@/lib/outfit-draft';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const outfit = await getOutfit(id);
  return { title: outfit?.title ?? 'Not Found' };
}

export default async function OutfitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const outfit = await getOutfit(id);

  if (!outfit) notFound();

  // Convert items to Draft
  const draft: Draft = {};
  outfit.items.forEach((item) => {
    const slot = isSlot(item.slot) ? item.slot : null;
    if (slot) {
      draft[slot] = {
        id: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.price,
        imageUrl: item.product.imageUrl,
        thumbnailUrl: item.product.thumbnailUrl,
        slot,
      };
    }
  });

  const total = outfit.items.reduce((sum, item) => sum + item.product.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{outfit.title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">{formatPrice(total)}</span>
            <CopyOutfitButton items={outfit.items} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Canvas */}
          <div className="bg-white rounded-lg p-6">
            <OutfitCanvas draft={draft} />
          </div>

          {/* Product List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">포함된 상품</h2>
            <div className="space-y-3">
              {outfit.items.map((item, idx) => (
                <a
                  key={idx}
                  href={item.product.shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 border rounded-lg p-3 hover:shadow-md transition"
                >
                  <img
                    src={item.product.thumbnailUrl || item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">{item.product.brand}</p>
                    <p className="font-semibold text-sm line-clamp-2">{item.product.name}</p>
                    <p className="text-sm font-bold text-blue-600">
                      {formatPrice(item.product.price)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.product.shopName}에서 구매 →
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
