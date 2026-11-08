import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { cx } from '../../../utils/classNames';
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

  useLayoutEffect(() => {
    if (!open || !menuRef.current) return;

    const menu = menuRef.current;
    const selected = menu.querySelector<HTMLElement>('[data-selected="true"]');
    if (!selected) return;

    menu.scrollTop = selected.offsetTop - menu.clientHeight / 2 + selected.clientHeight / 2;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

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
