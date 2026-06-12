'use client';
import { useState } from 'react';
import Link from 'next/link';
import { addToDraft, type DraftProduct } from '@/lib/outfit-draft';
import { isSlot } from '@/lib/slots';
import type { products } from '@/lib/schema';

type Product = typeof products.$inferSelect;

export function AddToOutfitButton({
  product,
  slot,
}: {
  product: Product;
  slot?: string;
}) {
  const [added, setAdded] = useState(false);

  if (!slot || !isSlot(slot)) {
    return (
      <button
        disabled
        className="w-full py-2 bg-surface border border-primary/20 text-ink/70 rounded-lg text-sm font-medium cursor-not-allowed"
      >
        카테고리 없음
      </button>
    );
  }

  const handleClick = () => {
    const draftProduct: Omit<DraftProduct, 'slot'> = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      imageUrl: product.imageUrl,
      thumbnailUrl: product.thumbnailUrl,
    };
    addToDraft(slot, draftProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (added) {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled
          className="flex-1 py-2 bg-mint-soft text-ink rounded-lg text-sm font-medium"
        >
          추가됨 ✓
        </button>
        <Link
          href="/outfits/new"
          className="text-xs text-primary underline hover:text-accent"
        >
          보기
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full py-2 bg-gradient-to-r from-primary to-accent-deep text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
    >
      코디에 추가
    </button>
  );
}
