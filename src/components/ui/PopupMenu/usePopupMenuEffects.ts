import { useEffect, useLayoutEffect, type RefObject } from 'react';

export function useAutoScrollToSelected(
  menuRef: RefObject<HTMLElement | null>,
  open: boolean,
): void {
  useLayoutEffect(() => {
    if (!open || !menuRef.current) return;

    const menu = menuRef.current;
    const selected = menu.querySelector<HTMLElement>('[data-selected="true"]');
    if (!selected) return;

    menu.scrollTop =
      selected.offsetTop - menu.clientHeight / 2 + selected.clientHeight / 2;
  }, [menuRef, open]);
}

export function useDismissOnOutside(
  open: boolean,
  onClose: () => void,
  menuRef: RefObject<HTMLElement | null>,
  anchorRef?: RefObject<HTMLElement | null>,
): void {
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
  }, [open, onClose, menuRef, anchorRef]);
}
