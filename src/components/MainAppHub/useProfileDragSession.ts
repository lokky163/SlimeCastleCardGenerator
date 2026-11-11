import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import {
  autoScrollProfileList,
  findProfileTarget,
  moveProfileGhost,
  moveProfileTo,
} from './profileDrag';
import type { ProfileDragState, ProfilePress } from './profileDragTypes';

interface UseProfileDragSessionOptions {
  drag: ProfileDragState | null;
  listRef: RefObject<HTMLDivElement | null>;
  dragRef: RefObject<ProfileDragState | null>;
  ghostRef: RefObject<HTMLDivElement | null>;
  pressRef: RefObject<ProfilePress | null>;
  setDrag: (state: ProfileDragState | null) => void;
  onReorder: (from: number, to: number) => void;
}

/** FLIP: move the rows back to their previous places, then release them. */
function flipRows(
  list: HTMLElement,
  previousTops: Map<string, number>,
  active: boolean,
): Map<string, number> {
  const nextTops = new Map<string, number>();

  list.querySelectorAll<HTMLElement>('[data-profile-uid]').forEach((row) => {
    const uid = row.dataset.profileUid;
    if (!uid) return;

    // offsetTop ignores the animation transform applied below.
    const top = row.offsetTop;
    nextTops.set(uid, top);

    const previous = previousTops.get(uid);
    if (!active || previous === undefined) return;

    const deltaY = previous - top;
    if (Math.abs(deltaY) < 1) return;

    row.style.transition = 'none';
    row.style.transform = `translateY(${deltaY}px)`;
    void row.offsetHeight;
    row.style.transition = '';
    row.style.transform = '';
  });

  return nextTops;
}

export function useProfileDragSession({
  drag,
  listRef,
  dragRef,
  ghostRef,
  pressRef,
  setDrag,
  onReorder,
}: UseProfileDragSessionOptions): void {
  const previousTopsRef = useRef<Map<string, number>>(new Map());

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    previousTopsRef.current = flipRows(
      list,
      previousTopsRef.current,
      dragRef.current !== null,
    );
  });

  useEffect(() => {
    if (!drag) return;

    const handleMove = (event: PointerEvent) => {
      const current = dragRef.current;
      const ghost = ghostRef.current;
      const list = listRef.current;
      if (!current || !ghost || !list) return;

      moveProfileGhost(ghost, current, event.clientX, event.clientY);
      autoScrollProfileList(list, event.clientY);

      const target = findProfileTarget(list, event.clientY);
      if (target === null || target === current.position) return;

      const next = moveProfileTo(current, target);
      dragRef.current = next;
      setDrag(next);
    };

    const finish = (commit: boolean) => {
      const current = dragRef.current;
      dragRef.current = null;
      pressRef.current = null;
      setDrag(null);
      if (!commit || !current) return;

      const from = current.order[current.position];
      if (from !== current.position) onReorder(from, current.position);
    };

    const handleUp = () => finish(true);
    const handleCancel = () => finish(false);
    const blockScroll = (event: TouchEvent) => event.preventDefault();

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);
    window.addEventListener('touchmove', blockScroll, { passive: false });

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('touchmove', blockScroll);
    };
  }, [drag, listRef, dragRef, ghostRef, pressRef, setDrag, onReorder]);
}
