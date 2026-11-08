import { CardGrid, CardGridItem, type CardGridVariant } from './CardGrid';
import { VisibilityToggle } from './VisibilityToggle';
import type { LayoutItem, LayoutMode, SlotEntry } from './layout';
import styles from './SlotGrid.module.css';

interface SlotGridProps<T extends LayoutItem> {
  items: T[];
  entries: SlotEntry[];
  mode: LayoutMode;
  variant: CardGridVariant;
  renderCard: (item: T, itemIndex: number) => React.ReactNode;
  onSlotIndexChange: (itemIndex: number, slotIndex: number) => void;
  onToggleHidden: (key: string) => void;
  hiddenKeys: string[];
  slotCount: number;
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
  entries,
  mode,
  variant,
  renderCard,
  onSlotIndexChange,
  onToggleHidden,
  hiddenKeys,
  slotCount,
}: SlotGridProps<T>) {
  return (
    <CardGrid variant={variant}>
      {items.map((item, itemIndex) => {
        const entry = entries[itemIndex] ?? { index: -1, visible: false, hidden: false };
        const isHidden = hiddenKeys.includes(item.key);

        return (
          <CardGridItem
            key={item.key}
            active={entry.visible && entry.index >= 0}
            dimmed={mode !== 'manual' && isHidden}
            footer={
              mode === 'manual' ? (
                <SlotIndexInput
                  value={entry.index}
                  max={slotCount - 1}
                  onChange={(slotIndex) => onSlotIndexChange(itemIndex, slotIndex)}
                />
              ) : (
                <VisibilityToggle
                  hidden={isHidden}
                  onToggle={() => onToggleHidden(item.key)}
                />
              )
            }
          >
            {renderCard(item, itemIndex)}
          </CardGridItem>
        );
      })}
    </CardGrid>
  );
}
