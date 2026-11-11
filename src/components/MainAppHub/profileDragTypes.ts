import type {
  MouseEventHandler,
  PointerEvent as ReactPointerEvent,
  PointerEventHandler,
} from 'react';

export interface ProfileDragState {
  /** Original profile indexes in the order they are shown while dragging. */
  order: number[];
  /** Position of the dragged profile inside `order`. */
  position: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  startLeft: number;
  startTop: number;
}

export interface ProfilePress {
  x: number;
  y: number;
  index: number;
  row: HTMLDivElement;
}

export interface ProfileRowHandlers {
  onPointerDown: (
    event: ReactPointerEvent<HTMLDivElement>,
    index: number,
  ) => void;
  onPointerMove: PointerEventHandler<HTMLElement>;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onPointerLeave: () => void;
}

export interface ProfileDrawerHandlers {
  onPointerDownCapture: () => void;
  onClickCapture: MouseEventHandler<HTMLElement>;
  onContextMenu: MouseEventHandler<HTMLElement>;
}
