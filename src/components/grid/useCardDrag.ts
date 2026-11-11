import { useRef, useState, type RefObject } from 'react';
import type { CardDragController, DragState } from './cardDragTypes';
import { readDragCells, type DragCell } from './dragCells';
import { createDragGhost, type DragGhost } from './dragGhost';
import {
  useCardPressHandlers,
  type LongPressEvent,
} from './useCardPressHandlers';
import { useDragSession } from './useDragSession';

interface UseCardDragOptions {
  gridRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  order: number[];
  moveItem: (itemIndex: number, position: number) => void;
}

interface StartContext {
  gridRef: RefObject<HTMLDivElement | null>;
  order: number[];
  dragRef: RefObject<DragState | null>;
  ghostRef: RefObject<DragGhost | null>;
  cellsRef: RefObject<DragCell[]>;
  setDrag: (state: DragState | null) => void;
}

function startCardDrag(press: LongPressEvent, context: StartContext): void {
  const grid = context.gridRef.current;
  if (!grid) return;

  const row = grid.querySelector<HTMLElement>(
    `[data-item-index="${press.itemIndex}"]`,
  );
  const position = context.order.indexOf(press.itemIndex);
  if (!row || position < 0) return;

  context.ghostRef.current = createDragGhost(row, press.x, press.y);
  context.cellsRef.current = readDragCells(grid);

  const next: DragState = {
    itemIndex: press.itemIndex,
    position,
    order: context.order,
  };
  context.dragRef.current = next;
  context.setDrag(next);
}

export function useCardDrag({
  gridRef,
  enabled,
  order,
  moveItem,
}: UseCardDragOptions): CardDragController {
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const ghostRef = useRef<DragGhost | null>(null);
  const cellsRef = useRef<DragCell[]>([]);
  const orderRef = useRef(order);
  orderRef.current = order;
  const commitRef = useRef(moveItem);
  commitRef.current = moveItem;

  const onLongPress = (press: LongPressEvent) => {
    startCardDrag(press, {
      gridRef,
      order: orderRef.current,
      dragRef,
      ghostRef,
      cellsRef,
      setDrag,
    });
  };

  const handlers = useCardPressHandlers({ enabled, dragRef, onLongPress });
  useDragSession({
    active: drag !== null,
    gridRef,
    dragRef,
    ghostRef,
    cellsRef,
    setDrag,
    commitRef,
  });

  return {
    order: drag?.order ?? order,
    draggingItemIndex: drag?.itemIndex ?? null,
    handlers,
  };
}
