import type { Slot } from '@/lib/slots';
import type { Draft } from '@/lib/outfit-draft';
import { SlotCard } from './SlotCard';

export function OutfitCanvas({
  draft,
  onRemove,
  onEmptySlotClick,
}: {
  draft: Draft;
  onRemove?: (slot: Slot) => void;
  onEmptySlotClick?: (slot: Slot) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Row 1: outer, top */}
      <div className="grid grid-cols-2 gap-3">
        <SlotCard
          slot="outer"
          label="아우터"
          product={draft.outer}
          onRemove={onRemove ? () => onRemove('outer') : undefined}
          onEmptyClick={onEmptySlotClick ? () => onEmptySlotClick('outer') : undefined}
        />
        <SlotCard
          slot="top"
          label="상의"
          product={draft.top}
          onRemove={onRemove ? () => onRemove('top') : undefined}
          onEmptyClick={onEmptySlotClick ? () => onEmptySlotClick('top') : undefined}
        />
      </div>

      {/* Row 2: bottom (centered, 60% width) */}
      <div className="flex justify-center">
        <div className="w-3/5">
          <SlotCard
            slot="bottom"
            label="하의"
            product={draft.bottom}
            onRemove={onRemove ? () => onRemove('bottom') : undefined}
            onEmptyClick={onEmptySlotClick ? () => onEmptySlotClick('bottom') : undefined}
          />
        </div>
      </div>

      {/* Row 3: shoes, accessory, bag */}
      <div className="grid grid-cols-3 gap-3">
        <SlotCard
          slot="shoes"
          label="신발"
          product={draft.shoes}
          onRemove={onRemove ? () => onRemove('shoes') : undefined}
          onEmptyClick={onEmptySlotClick ? () => onEmptySlotClick('shoes') : undefined}
        />
        <SlotCard
          slot="accessory"
          label="액세서리"
          product={draft.accessory}
          onRemove={onRemove ? () => onRemove('accessory') : undefined}
          onEmptyClick={onEmptySlotClick ? () => onEmptySlotClick('accessory') : undefined}
        />
        <SlotCard
          slot="bag"
          label="가방"
          product={draft.bag}
          onRemove={onRemove ? () => onRemove('bag') : undefined}
          onEmptyClick={onEmptySlotClick ? () => onEmptySlotClick('bag') : undefined}
        />
      </div>
    </div>
  );
}
