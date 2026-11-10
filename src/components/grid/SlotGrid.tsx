import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { CardGrid, CardGridItem, type CardGridVariant } from './CardGrid';
import { EDITOR_GRID_CONFIG } from './editorGridConfig';
import { ScaledCard } from './ScaledCard';
import { useEditorGrid } from './useEditorGrid';
import { VisibilityToggle } from './VisibilityToggle';
import type { LayoutItem } from './layout';
import type { SlotLayoutController } from './useSlotLayout';
import styles from './SlotGrid.module.css';

interface SlotGridProps<T extends LayoutItem> {
  items: T[];
  layout: SlotLayoutController;
  variant: CardGridVariant;
  renderCard: (item: T, itemIndex: number, baseWidth: number) => React.ReactNode;
}

interface SlotIndexInputProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

interface DragState {
  fromItem: number;
  overItem: number | null;
}

const LONG_PRESS_MS = 400;
const MOVE_TOLERANCE_PX = 10;
const INTERACTIVE_SELECTOR =
  'button, input, select, textarea, label, a, [data-no-drag]';

const SlotIndexInput: React.FC<SlotIndexInputProps> = ({ value, max, onChange }) => {
  const { t } = useI18n();

  return (
    <div className={styles.manualInput}>
      <span>{t('Slot:')}</span>
      <input
        type="number"
        min={-1}
        max={max}
        value={value}
        className={styles.indexInput}
        onChange={(event) => {
          const parsed = parseInt(event.target.value, 10);
          onChange(Number.isNaN(parsed) ? -1 : parsed);
        }}
      />
    </div>
  );
};

export function SlotGrid<T extends LayoutItem>({
  items,
  layout,
  variant,
  renderCard,
}: SlotGridProps<T>) {
  const { entries, mode, hiddenKeys, hideEnabled, rows, cols } = layout;
  const slotCount = rows * cols;
  const config = EDITOR_GRID_CONFIG[variant];
  const { gridRef, columns, cardWidth } = useEditorGrid(variant, items.length);

  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const pressRef = useRef<{ x: number; y: number; itemIndex: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const justDraggedRef = useRef(false);
  const swapRef = useRef(layout.swapItemSlots);
  swapRef.current = layout.swapItemSlots;

  const clearPressTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => clearPressTimer(), []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest(INTERACTIVE_SELECTOR)) return;

    const itemElement = target.closest<HTMLElement>('[data-item-index]');
    if (!itemElement) return;

    const itemIndex = Number(itemElement.dataset.itemIndex);
    const slotIndex = Number(itemElement.dataset.slotIndex);
    if (
      !Number.isFinite(itemIndex) ||
      !Number.isFinite(slotIndex) ||
      slotIndex < 0
    ) {
      return;
    }

    justDraggedRef.current = false;
    pressRef.current = { x: event.clientX, y: event.clientY, itemIndex };
    clearPressTimer();

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const press = pressRef.current;
      if (!press) return;

      justDraggedRef.current = true;
      const next = { fromItem: press.itemIndex, overItem: null };
      dragRef.current = next;
      setDrag(next);
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (!press || dragRef.current) return;

    const dx = event.clientX - press.x;
    const dy = event.clientY - press.y;
    if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) {
      clearPressTimer();
      pressRef.current = null;
    }
  };

  const endPress = () => {
    clearPressTimer();
    pressRef.current = null;
  };

  const isDragging = drag !== null;

  useEffect(() => {
    if (!isDragging) return;

    const updateTarget = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y);
      const itemElement = element?.closest<HTMLElement>('[data-item-index]');
      if (!itemElement) return;

      const itemIndex = Number(itemElement.dataset.itemIndex);
      const slotIndex = Number(itemElement.dataset.slotIndex);
      const current = dragRef.current;
      if (
        !current ||
        !Number.isFinite(itemIndex) ||
        !Number.isFinite(slotIndex) ||
        slotIndex < 0
      ) {
        return;
      }

      const overItem = itemIndex === current.fromItem ? null : itemIndex;
      if (overItem === current.overItem) return;

      const next = { ...current, overItem };
      dragRef.current = next;
      setDrag(next);
    };

    const finish = (apply: boolean) => {
      const current = dragRef.current;
      dragRef.current = null;
      pressRef.current = null;
      setDrag(null);

      if (
        apply &&
        current &&
        current.overItem !== null &&
        current.overItem !== current.fromItem
      ) {
        swapRef.current(current.fromItem, current.overItem);
      }

      window.setTimeout(() => {
        justDraggedRef.current = false;
      }, 0);
    };

    const handleMove = (event: PointerEvent) => {
      updateTarget(event.clientX, event.clientY);
    };
    const handleUp = () => finish(true);
    const handleCancel = () => finish(false);
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

  return (
    <CardGrid
      variant={variant}
      columns={columns}
      gridRef={gridRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onPointerLeave={() => {
        if (!dragRef.current) endPress();
      }}
      onClickCapture={(event) => {
        if (!justDraggedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        justDraggedRef.current = false;
      }}
      onContextMenu={(event) => {
        if (dragRef.current) event.preventDefault();
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      {items.map((item, itemIndex) => {
        const entry = entries[itemIndex] ?? { index: -1, visible: false, hidden: false };
        const isHidden = hiddenKeys.includes(item.key);

        return (
          <CardGridItem
            key={item.key}
            active={entry.visible && !entry.hidden && entry.index >= 0}
            dimmed={entry.hidden}
            slotIndex={entry.index}
            itemIndex={itemIndex}
            dragging={drag?.fromItem === itemIndex}
            dropTarget={drag?.overItem === itemIndex}
            footer={
              mode === 'manual' ? (
                <SlotIndexInput
                  value={entry.index}
                  max={slotCount - 1}
                  onChange={(slotIndex) => layout.setSlotIndex(itemIndex, slotIndex)}
                />
              ) : hideEnabled ? (
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
