import type { ReactNode } from 'react';
import { cx } from '../../../utils/classNames';
import styles from './Tooltip.module.css';

type TooltipPlacement = 'top' | 'bottom';

interface TooltipProps {
  label: string;
  children: ReactNode;
  placement?: TooltipPlacement;
  className?: string;
}

/**
 * Стилизованная подсказка вместо нативного `title`.
 * Показывается при наведении и при фокусе на вложенном элементе.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  label,
  children,
  placement = 'top',
  className,
}) => (
  <span className={cx(styles.wrap, styles[placement], className)}>
    {children}
    <span className={styles.bubble} role="tooltip">
      {label}
    </span>
  </span>
);
