'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SLOTS, type Slot } from '@/lib/slots';
import { readDraft, writeDraft, clearDraft, type Draft, type DraftProduct } from '@/lib/outfit-draft';
import { formatPrice } from '@/lib/format';
import { ProductBrowser } from './ProductBrowser';
import { OutfitCanvas } from './OutfitCanvas';

export function OutfitBuilder() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>({});
  const [activeSlot, setActiveSlot] = useState<Slot>('top');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate draft on mount
  useEffect(() => {
    setDraft(readDraft());
    setMounted(true);
  }, []);

  // Listen for draft changes from other tabs/components
  useEffect(() => {
    const handleDraftChange = () => {
      setDraft(readDraft());
    };
    window.addEventListener('fitlook:draft-changed', handleDraftChange);
    window.addEventListener('storage', handleDraftChange);
    return () => {
      window.removeEventListener('fitlook:draft-changed', handleDraftChange);
      window.removeEventListener('storage', handleDraftChange);
    };
  }, []);

  const setSlot = (slot: Slot, product: DraftProduct | null) => {
    const next = { ...draft };
    if (product) {
      next[slot] = product;
    } else {
      delete next[slot];
    }
    setDraft(next);
    writeDraft(next);
  };

  const total = useMemo(
    () => Object.values(draft).reduce((sum, p) => sum + (p?.price ?? 0), 0),
    [draft]
  );
  const itemCount = Object.keys(draft).length;

  const handleSave = async () => {
    if (!title.trim() || itemCount === 0 || saving) return;
    setSaving(true);
    try {
      // Ensure a user exists (creates guest cookie if needed); backend derives userId from cookie
      await fetch('/api/guest', { method: 'POST' });

      const items = Object.entries(draft).map(([slot, p]) => ({
        productId: p.id,
        slot,
      }));

      const outfitRes = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          isPublic: true,
          items,
        }),
      });

      if (!outfitRes.ok) throw new Error('Save failed');
      const outfit = await outfitRes.json();
      clearDraft();
      router.push(`/outfits/${outfit.id}`);
    } catch (e) {
      console.error(e);
      alert('코디 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Left: ProductBrowser */}
      <div className="flex-1 border-r overflow-hidden">
        <ProductBrowser
          activeSlot={activeSlot}
          onSlotChange={setActiveSlot}
          draft={draft}
          onSelect={(slot, p) => setSlot(slot, p)}
        />
      </div>

      {/* Right: Canvas + SaveBar */}
      <div className="w-[420px] flex flex-col overflow-hidden bg-gray-50">
        <div className="flex-1 overflow-y-auto p-4">
          <OutfitCanvas
            draft={draft}
            onRemove={(slot) => setSlot(slot, null)}
            onEmptySlotClick={setActiveSlot}
          />
        </div>

        {/* SaveBar */}
        <div className="border-t bg-white p-4 space-y-3">
          <div className="text-lg font-bold text-right">
            {formatPrice(total)}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="코디 제목을 입력하세요"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleSave}
            disabled={!title.trim() || itemCount === 0 || saving}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold disabled:opacity-40 hover:bg-gray-800 transition"
          >
            {saving ? '저장 중...' : `코디 저장하기 (${itemCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
