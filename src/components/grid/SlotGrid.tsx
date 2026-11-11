import { useMemo } from 'react';
import { CardGrid, CardGridItem, type CardGridVariant } from './CardGrid';
import { EDITOR_GRID_CONFIG } from './editorGridConfig';
import { ScaledCard } from './ScaledCard';
import { useCardDrag } from './useCardDrag';
import { useEditorGrid } from './useEditorGrid';
import { VisibilityToggle } from './VisibilityToggle';
import type { LayoutItem, SlotEntry } from './layout';
import type { SlotLayoutController } from './useSlotLayout';

interface SlotGridProps<T extends LayoutItem> {
  items: T[];
  layout: SlotLayoutController;
  variant: CardGridVariant;
  renderCard: (item: T, itemIndex: number, baseWidth: number) => React.ReactNode;
  /** Equipment always shows every card and has no layout controls. */
  fixed?: boolean;
}

const EMPTY_ENTRY: SlotEntry = { index: -1, visible: false, hidden: false };

function resolveBaseOrder<T extends LayoutItem>(
  items: T[],
  entries: SlotEntry[],
  reorderable: boolean,
): number[] {
  const order = items.map((_, index) => index);
  if (!reorderable) return order;

  return order.sort((left, right) => {
    const leftIndex = entries[left]?.index ?? left;
    const rightIndex = entries[right]?.index ?? right;
    return leftIndex - rightIndex || left - right;
  });
}

export function SlotGrid<T extends LayoutItem>({
  items,
  layout,
  variant,
  renderCard,
  fixed = false,
}: SlotGridProps<T>) {
  const { entries, mode, hiddenKeys, hideEnabled } = layout;
  const config = EDITOR_GRID_CONFIG[variant];
  const { gridRef, columns, cardWidth } = useEditorGrid(variant, items.length);

  const reorderable = !fixed && mode === 'manual';
  const baseOrder = useMemo(
    () => resolveBaseOrder(items, entries, reorderable),
    [items, entries, reorderable],
  );

  const drag = useCardDrag({
    gridRef,
    enabled: reorderable,
    order: baseOrder,
    moveItem: layout.moveItem,
  });

  return (
    <CardGrid
      variant={variant}
      columns={columns}
      gridRef={gridRef}
      {...(reorderable ? drag.handlers : {})}
    >
      {drag.order.map((itemIndex, position) => {
        const item = items[itemIndex];
        if (!item) return null;

        const entry = fixed
          ? { index: itemIndex, visible: true, hidden: false }
          : (entries[itemIndex] ?? EMPTY_ENTRY);
        const isHidden = !fixed && hiddenKeys.includes(item.key);
        const showToggle = !fixed && hideEnabled;

        return (
          <CardGridItem
            key={item.key}
            active={fixed || (entry.visible && !entry.hidden && entry.index >= 0)}
            dimmed={!fixed && entry.hidden}
            itemIndex={itemIndex}
            position={position}
            dragging={fixed ? false : drag.draggingItemIndex === itemIndex}
            footer={
              showToggle ? (
                <VisibilityToggle
                  hidden={isHidden}
                  onToggle={() => layout.setItemHidden(item.key, !isHidden)}
                />
              ) : undefined
            }
          >
            <ScaledCard width={cardWidth} baseWidth={config.baseWidth}>
              {renderCard(item, itemIndex, config.baseWidth)}
            </ScaledCard>
          </CardGridItem>
        );
      })}
    </CardGrid>
  );
}
