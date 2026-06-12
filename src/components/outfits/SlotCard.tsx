import { formatPrice } from '@/lib/format';
import type { DraftProduct } from '@/lib/outfit-draft';

export function SlotCard({
  slot,
  label,
  product,
  onRemove,
  onEmptyClick,
}: {
  slot: string;
  label: string;
  product?: DraftProduct | null;
  onRemove?: () => void;
  onEmptyClick?: () => void;
}) {
  if (!product) {
    return (
      <button
        onClick={onEmptyClick}
        className="aspect-[3/4] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-600 transition"
      >
        <span className="text-2xl mb-2">+</span>
        <span className="text-xs">{label}</span>
      </button>
    );
  }

  return (
    <div className="aspect-[3/4] border rounded-xl overflow-hidden bg-gray-50 relative group">
      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
        >
          ×
        </button>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
        <p className="text-xs font-semibold truncate">{product.brand}</p>
        <p className="text-xs text-gray-200">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}
