import { cx } from '../../utils/classNames';
import styles from './CardGrid.module.css';

export type CardGridVariant = 'relic' | 'slime' | 'equipment' | 'artifact' | 'buff';

interface CardGridProps {
  variant: CardGridVariant;
  columns?: number;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  children: React.ReactNode;
}

export const CardGrid: React.FC<CardGridProps> = ({
  variant,
  columns,
  gridRef,
  className,
  children,
}) => (
  <div
    ref={gridRef}
    className={cx(styles.grid, styles[variant], className)}
    style={
      columns
        ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
        : undefined
    }
  >
    {children}
  </div>
);

interface CardGridItemProps {
  active?: boolean;
  dimmed?: boolean;
  className?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const CardGridItem: React.FC<CardGridItemProps> = ({
  active = false,
  dimmed = false,
  className,
  footer,
  children,
}) => (
  <div className={cx(styles.item, active && styles.active, className)}>
    <div className={cx(styles.card, dimmed && styles.dimmed)}>{children}</div>
    {footer && <div className={styles.footer}>{footer}</div>}
  </div>
);
