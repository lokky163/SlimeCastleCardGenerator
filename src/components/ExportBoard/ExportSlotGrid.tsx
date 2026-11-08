import { cx } from '../../utils/classNames';
import { fillSlots, type LayoutItem, type SlotLayoutState } from '../grid/layout';
import styles from './ExportBoard.module.css';

interface ExportSlotGridProps<T extends LayoutItem> {
  items: T[];
  layout: SlotLayoutState;
  cellWidth: number;
  cellHeight: number;
  cellClassName: string;
  renderItem: (item: T) => React.ReactNode;
}

export function ExportSlotGrid<T extends LayoutItem>({
  items,
  layout,
  cellWidth,
  cellHeight,
  cellClassName,
  renderItem,
}: ExportSlotGridProps<T>) {
  const rows = Math.max(1, layout.rows);
  const cols = Math.max(1, layout.cols);
  const slots = fillSlots(items, layout.entries, rows * cols);

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellWidth}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellHeight}px)`,
      }}
    >
      {slots.map((slot, index) =>
        slot ? (
          <div key={`export-${slot.item.key}`} className={cellClassName}>
            {renderItem(slot.item)}
          </div>
        ) : (
          <div
            key={`export-empty-${index}`}
            className={cx(cellClassName, styles.emptyCell)}
          />
        ),
      )}
    </div>
  );
}
