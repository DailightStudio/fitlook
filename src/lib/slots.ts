export const SLOTS = [
  { key: 'outer', label: '아우터' },
  { key: 'top', label: '상의' },
  { key: 'bottom', label: '하의' },
  { key: 'shoes', label: '신발' },
  { key: 'accessory', label: '액세서리' },
  { key: 'bag', label: '가방' },
] as const;

export type Slot = (typeof SLOTS)[number]['key'];

export function isSlot(v: string | null | undefined): v is Slot {
  return SLOTS.some((s) => s.key === v);
}
