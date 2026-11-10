import type { ReactNode } from 'react';
import { cx } from '../../../utils/classNames';
import styles from './Tooltip.module.css';

type TooltipPlacement = 'top' | 'bottom';
type TooltipAlign = 'center' | 'start' | 'end';

interface TooltipProps {
  label: string;
  children: ReactNode;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
  className?: string;
}

const ALIGN_CLASS: Record<TooltipAlign, string> = {
  center: styles.alignCenter,
  start: styles.alignStart,
  end: styles.alignEnd,
};

/**
 * Стилизованная подсказка вместо нативного `title`.
 * Показывается при наведении и при фокусе на вложенном элементе.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  label,
  children,
  placement = 'top',
  align = 'center',
  className,
}) => (
  <span className={cx(styles.wrap, styles[placement], ALIGN_CLASS[align], className)}>
    {children}
    <span className={styles.bubble} role="tooltip">
      {label}
    </span>
  </span>
);
