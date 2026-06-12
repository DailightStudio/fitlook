import type { Slot } from './slots';

export type DraftProduct = {
  id: string; name: string; brand: string; price: number;
  imageUrl: string; thumbnailUrl: string | null; slot: Slot;
};
export type Draft = Partial<Record<Slot, DraftProduct>>;

const KEY = 'fitlook:outfit-draft';

export function readDraft(): Draft {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; }
}
export function writeDraft(draft: Draft) {
  localStorage.setItem(KEY, JSON.stringify(draft));
  window.dispatchEvent(new Event('fitlook:draft-changed'));
}
export function addToDraft(slot: Slot, product: Omit<DraftProduct, 'slot'>) {
  writeDraft({ ...readDraft(), [slot]: { ...product, slot } });
}
export function clearDraft() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event('fitlook:draft-changed'));
}
