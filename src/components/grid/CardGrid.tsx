import { cx } from '../../utils/classNames';
import styles from './CardGrid.module.css';

export type CardGridVariant = 'relic' | 'slime' | 'equipment' | 'artifact' | 'buff';

interface CardGridProps {
  variant: CardGridVariant;
  className?: string;
  children: React.ReactNode;
}

export const CardGrid: React.FC<CardGridProps> = ({ variant, className, children }) => (
  <div className={cx(styles.grid, styles[variant], className)}>{children}</div>
);

interface CardGridItemProps {
  active?: boolean;
  className?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const CardGridItem: React.FC<CardGridItemProps> = ({
  active = false,
  className,
  footer,
  children,
}) => (
  <div className={cx(styles.item, active && styles.active, className)}>
    <div className={styles.card}>{children}</div>
    {footer && <div className={styles.footer}>{footer}</div>}
  </div>
);
