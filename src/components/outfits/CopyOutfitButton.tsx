'use client';
import { useRouter } from 'next/navigation';
import { writeDraft, type Draft } from '@/lib/outfit-draft';
import { isSlot } from '@/lib/slots';

type OutfitItem = {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    thumbnailUrl: string | null;
  };
  slot: string | null;
};

export function CopyOutfitButton({ items }: { items: OutfitItem[] }) {
  const router = useRouter();

  const handleCopy = () => {
    const draft: Draft = {};
    items.forEach((item) => {
      const slot = isSlot(item.slot) ? item.slot : item.product.imageUrl.includes('outer') ? 'outer' : 'top';
      if (isSlot(slot)) {
        draft[slot] = {
          ...item.product,
          slot,
        };
      }
    });
    writeDraft(draft);
    router.push('/outfits/new');
  };

  return (
    <button
      onClick={handleCopy}
      className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
    >
      코디 따라하기
    </button>
  );
}
