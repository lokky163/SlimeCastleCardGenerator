import { cx } from '../../utils/classNames';
import styles from './CardGrid.module.css';

export type CardGridVariant = 'relic' | 'slime' | 'equipment' | 'artifact' | 'buff';

interface CardGridProps {
  variant: CardGridVariant;
  columns?: number;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  children: React.ReactNode;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onPointerMove?: React.PointerEventHandler<HTMLDivElement>;
  onPointerUp?: React.PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: React.PointerEventHandler<HTMLDivElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLDivElement>;
  onClickCapture?: React.MouseEventHandler<HTMLDivElement>;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
}

export const CardGrid: React.FC<CardGridProps> = ({
  variant,
  columns,
  gridRef,
  className,
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  onClickCapture,
  onContextMenu,
  onDragStart,
}) => (
  <div
    ref={gridRef}
    className={cx(styles.grid, styles[variant], className)}
    style={
      columns
        ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
        : undefined
    }
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerCancel}
    onPointerLeave={onPointerLeave}
    onClickCapture={onClickCapture}
    onContextMenu={onContextMenu}
    onDragStart={onDragStart}
  >
    {children}
  </div>
);

interface CardGridItemProps {
  active?: boolean;
  dimmed?: boolean;
  className?: string;
  footer?: React.ReactNode;
  slotIndex?: number;
  itemIndex?: number;
  dragging?: boolean;
  dropTarget?: boolean;
  children: React.ReactNode;
}

export const CardGridItem: React.FC<CardGridItemProps> = ({
  active = false,
  dimmed = false,
  className,
  footer,
  slotIndex,
  itemIndex,
  dragging = false,
  dropTarget = false,
  children,
}) => (
  <div
    className={cx(
      styles.item,
      active && styles.active,
      dragging && styles.dragging,
      dropTarget && styles.dropTarget,
      className,
    )}
    data-slot-index={slotIndex}
    data-item-index={itemIndex}
  >
    <div className={cx(styles.card, dimmed && styles.dimmed)}>{children}</div>
    {footer && <div className={styles.footer}>{footer}</div>}
  </div>
);
