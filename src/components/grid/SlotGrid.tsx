import { CardGrid, CardGridItem, type CardGridVariant } from './CardGrid';
import type { LayoutItem, LayoutMode, SlotEntry } from './layout';
import styles from './SlotGrid.module.css';

interface SlotGridProps<T extends LayoutItem> {
  items: T[];
  entries: SlotEntry[];
  mode: LayoutMode;
  variant: CardGridVariant;
  getKey: (item: T) => React.Key;
  renderCard: (item: T, itemIndex: number) => React.ReactNode;
  onSlotIndexChange: (itemIndex: number, slotIndex: number) => void;
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
      max={max - 1}
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
  entries,
  mode,
  variant,
  getKey,
  renderCard,
  onSlotIndexChange,
}: SlotGridProps<T>) {
  return (
    <CardGrid variant={variant}>
      {items.map((item, itemIndex) => {
        const entry = entries[itemIndex] ?? { index: -1, visible: false };

        return (
          <CardGridItem
            key={getKey(item)}
            active={entry.visible}
            footer={
              mode === 'manual' ? (
                <SlotIndexInput
                  value={entry.index}
                  max={999}
                  onChange={(slotIndex) => onSlotIndexChange(itemIndex, slotIndex)}
                />
              ) : null
            }
          >
            {renderCard(item, itemIndex)}
          </CardGridItem>
        );
      })}
    </CardGrid>
  );
}
