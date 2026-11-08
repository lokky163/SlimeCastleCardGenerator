import { useRef, type ReactNode, type RefObject } from 'react';
import { cx } from '../../../utils/classNames';
import { useAutoScrollToSelected, useDismissOnOutside } from './usePopupMenuEffects';
import styles from './PopupMenu.module.css';

export type PopupPlacement = 'card' | 'dropdown';

interface PopupMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef?: RefObject<HTMLElement | null>;
  placement?: PopupPlacement;
  className?: string;
  children: ReactNode;
}

export const PopupMenu: React.FC<PopupMenuProps> = ({
  open,
  onClose,
  anchorRef,
  placement = 'card',
  className,
  children,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useAutoScrollToSelected(menuRef, open);
  useDismissOnOutside(open, onClose, menuRef, anchorRef);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className={cx(styles.menu, styles[placement], className)}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={styles.list}>{children}</div>
    </div>
  );
};
