import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../../utils/classNames';
import styles from './MenuOption.module.css';

interface MenuOptionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  selected?: boolean;
  align?: 'center' | 'start';
  children: ReactNode;
}

export const MenuOption: React.FC<MenuOptionProps> = ({
  selected = false,
  align = 'center',
  className,
  children,
  onClick,
  ...rest
}) => (
  <button
    type="button"
    data-selected={selected || undefined}
    className={cx(styles.option, styles[align], selected && styles.selected, className)}
    onClick={(event) => {
      event.stopPropagation();
      onClick?.(event);
    }}
    {...rest}
  >
    {children}
  </button>
);
