import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import type { DragState } from './cardDragTypes';
import {
  findCellIndex,
  measureCards,
  type CardPosition,
  type DragCell,
} from './dragCells';
import { moveDragGhost, type DragGhost } from './dragGhost';

interface UseDragSessionOptions {
  active: boolean;
  gridRef: RefObject<HTMLDivElement | null>;
  dragRef: RefObject<DragState | null>;
  ghostRef: RefObject<DragGhost | null>;
  cellsRef: RefObject<DragCell[]>;
  setDrag: (state: DragState | null) => void;
  commitRef: RefObject<(itemIndex: number, position: number) => void>;
}

interface SessionContext {
  dragRef: RefObject<DragState | null>;
  ghostRef: RefObject<DragGhost | null>;
  cellsRef: RefObject<DragCell[]>;
  setDrag: (state: DragState | null) => void;
  commitRef: RefObject<(itemIndex: number, position: number) => void>;
}

function reorderAround(drag: DragState, target: number): DragState {
  const order = [...drag.order];
  const [moved] = order.splice(drag.position, 1);
  order.splice(target, 0, moved);
  return { ...drag, order, position: target };
}

/** FLIP: move cards back to their previous cells, then release them. */
function flipCards(
  grid: HTMLElement,
  previousPositions: Map<number, CardPosition>,
): void {
  grid.querySelectorAll<HTMLElement>('[data-item-index]').forEach((card) => {
    const itemIndex = Number(card.dataset.itemIndex);
    const previous = previousPositions.get(itemIndex);
    if (!previous) return;

    const dx = previous.left - card.offsetLeft;
    const dy = previous.top - card.offsetTop;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

    card.style.transition = 'none';
    card.style.transform = `translate(${dx}px, ${dy}px)`;
    void card.offsetHeight;
    card.style.transition = '';
    card.style.transform = '';
  });
}

function updateDrag(context: SessionContext, event: PointerEvent): void {
  const ghost = context.ghostRef.current;
  const current = context.dragRef.current;
  if (!ghost || !current) return;

  moveDragGhost(ghost, event.clientX, event.clientY);

  const centerX = event.clientX - ghost.offsetX + ghost.width / 2;
  const centerY = event.clientY - ghost.offsetY + ghost.height / 2;
  const target = findCellIndex(context.cellsRef.current, centerX, centerY);
  if (target === null || target === current.position) return;

  const next = reorderAround(current, target);
  context.dragRef.current = next;
  context.setDrag(next);
}

function finishDrag(context: SessionContext, commit: boolean): void {
  const current = context.dragRef.current;
  context.dragRef.current = null;
  context.setDrag(null);
  context.ghostRef.current?.element.remove();
  context.ghostRef.current = null;

  if (commit && current) {
    context.commitRef.current(current.itemIndex, current.position);
  }
}

export function useDragSession({
  active,
  gridRef,
  dragRef,
  ghostRef,
  cellsRef,
  setDrag,
  commitRef,
}: UseDragSessionOptions): void {
  const previousPositionsRef = useRef<Map<number, CardPosition>>(new Map());

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (dragRef.current) flipCards(grid, previousPositionsRef.current);
    previousPositionsRef.current = measureCards(grid);
  });

  useDragListeners(active, dragRef, ghostRef, cellsRef, setDrag, commitRef);
}

function useDragListeners(
  active: boolean,
  dragRef: RefObject<DragState | null>,
  ghostRef: RefObject<DragGhost | null>,
  cellsRef: RefObject<DragCell[]>,
  setDrag: (state: DragState | null) => void,
  commitRef: RefObject<(itemIndex: number, position: number) => void>,
): void {
  useEffect(() => {
    if (!active) return;

    const context: SessionContext = {
      dragRef,
      ghostRef,
      cellsRef,
      setDrag,
      commitRef,
    };
    const handleMove = (event: PointerEvent) => updateDrag(context, event);
    const handleUp = () => finishDrag(context, true);
    const handleCancel = () => finishDrag(context, false);
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
  }, [active, dragRef, ghostRef, cellsRef, setDrag, commitRef]);
}
