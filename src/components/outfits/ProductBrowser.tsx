'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SLOTS, type Slot } from '@/lib/slots';
import { formatPrice } from '@/lib/format';
import type { DraftProduct, Draft } from '@/lib/outfit-draft';

type Product = {
  id: string; name: string; brand: string; price: number;
  imageUrl: string; thumbnailUrl: string | null;
  model3dUrl?: string | null;
  category: { slug: string } | null;
};

export function ProductBrowser({
  activeSlot,
  onSlotChange,
  draft,
  onSelect,
}: {
  activeSlot: Slot;
  onSlotChange: (slot: Slot) => void;
  draft: Draft;
  onSelect: (slot: Slot, product: DraftProduct) => void;
}) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tabFlash, setTabFlash] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const mountedRef = useRef(false);

  const totalPages = Math.max(1, Math.ceil(total / 12));

  // Find category slug from SLOTS
  const categorySlug = useMemo(() => {
    const slot = SLOTS.find((s) => s.key === activeSlot);
    return slot?.key ?? activeSlot;
  }, [activeSlot]);

  useEffect(() => {
    setPage(1);
  }, [activeSlot, search]);

  // Visual feedback when activeSlot changes (e.g. "+" clicked on canvas)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    // Scroll product list to top + bring active tab into view
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    activeTabRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    // 0.3s flash on the active tab
    setTabFlash(true);
    const t = setTimeout(() => setTabFlash(false), 300);
    return () => clearTimeout(t);
  }, [activeSlot]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('category', categorySlug);
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '12');

      try {
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        setProducts(data.data ?? []);
        setTotal(data.total ?? 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeSlot, search, page, categorySlug]);

  const handleProductClick = (product: Product) => {
    const draftProduct: DraftProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      imageUrl: product.imageUrl,
      thumbnailUrl: product.thumbnailUrl,
      model3dUrl: product.model3dUrl ?? null,
      slot: activeSlot,
    };
    onSelect(activeSlot, draftProduct);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-1 border-b p-2 overflow-x-auto">
        {SLOTS.map((slot) => (
          <button
            key={slot.key}
            ref={activeSlot === slot.key ? activeTabRef : undefined}
            onClick={() => onSlotChange(slot.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
              activeSlot === slot.key
                ? tabFlash
                  ? 'bg-blue-500 text-white'
                  : 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="border-b p-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="상품 검색..."
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Products Grid */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 py-4">로딩 중...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-4">상품이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {products.map((product) => {
              const isSelected = draft[activeSlot]?.id === product.id;
              return (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`rounded-lg overflow-hidden text-left transition ${
                    isSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/30'
                  }`}
                >
                  <div className="aspect-[3/4] bg-gray-100 relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-xs font-semibold truncate">{product.brand}</p>
                    <p className="text-xs text-gray-600 truncate">{product.name}</p>
                    <p className="text-xs font-bold">{formatPrice(product.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="text-xs text-gray-500">
              페이지 {page}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
