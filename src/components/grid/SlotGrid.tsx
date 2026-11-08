import { CardGrid, CardGridItem, type CardGridVariant } from './CardGrid';
import { VisibilityToggle } from './VisibilityToggle';
import type { LayoutItem } from './layout';
import type { SlotLayoutController } from './useSlotLayout';
import styles from './SlotGrid.module.css';

interface SlotGridProps<T extends LayoutItem> {
  items: T[];
  layout: SlotLayoutController;
  variant: CardGridVariant;
  renderCard: (item: T, itemIndex: number) => React.ReactNode;
}

interface SlotIndexInputProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

const SlotIndexInput: React.FC<SlotIndexInputProps> = ({ value, max, onChange }) => (
  <div className={styles.manualInput}>
    <span>Слот:</span>
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

export function SlotGrid<T extends LayoutItem>({
  items,
  layout,
  variant,
  renderCard,
}: SlotGridProps<T>) {
  const { entries, mode, hiddenKeys, hideEnabled, rows, cols } = layout;
  const slotCount = rows * cols;

  return (
    <CardGrid variant={variant}>
      {items.map((item, itemIndex) => {
        const entry = entries[itemIndex] ?? { index: -1, visible: false, hidden: false };
        const isHidden = hiddenKeys.includes(item.key);

        return (
          <CardGridItem
            key={item.key}
            active={entry.visible && !entry.hidden && entry.index >= 0}
            dimmed={entry.hidden}
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
            {renderCard(item, itemIndex)}
          </CardGridItem>
        );
      })}
    </CardGrid>
  );
}
