import type {
  DragEventHandler,
  MouseEventHandler,
  PointerEventHandler,
} from 'react';

export interface DragState {
  itemIndex: number;
  /** Position of the dragged card in the current display order. */
  position: number;
  order: number[];
}

export interface CardDragHandlers {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
  onPointerLeave: PointerEventHandler<HTMLDivElement>;
  onClickCapture: MouseEventHandler<HTMLDivElement>;
  onContextMenu: MouseEventHandler<HTMLDivElement>;
  onDragStart: DragEventHandler<HTMLDivElement>;
}

export interface CardDragController {
  order: number[];
  draggingItemIndex: number | null;
  handlers: CardDragHandlers;
}
