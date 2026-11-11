import {
  useEffect,
  useRef,
  type DragEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type RefObject,
} from 'react';
import type { CardDragHandlers, DragState } from './cardDragTypes';

export interface LongPressEvent {
  x: number;
  y: number;
  itemIndex: number;
}

interface UseCardPressHandlersOptions {
  enabled: boolean;
  dragRef: RefObject<DragState | null>;
  onLongPress: (event: LongPressEvent) => void;
}

interface PressState {
  x: number;
  y: number;
  itemIndex: number;
}

const LONG_PRESS_MS = 180;
const MOVE_TOLERANCE_PX = 10;
const INTERACTIVE_SELECTOR =
  'button, input, select, textarea, label, a, [data-no-drag]';

export function useCardPressHandlers({
  enabled,
  dragRef,
  onLongPress,
}: UseCardPressHandlersOptions): CardDragHandlers {
  const pressRef = useRef<PressState | null>(null);
  const timerRef = useRef<number | null>(null);
  const justDraggedRef = useRef(false);
  const onLongPressRef = useRef(onLongPress);
  onLongPressRef.current = onLongPress;

  const clearTimer = () => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const endPress = () => {
    clearTimer();
    pressRef.current = null;
  };

  useEffect(() => () => clearTimer(), []);

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!enabled || event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest(INTERACTIVE_SELECTOR)) return;

    const card = target.closest<HTMLElement>('[data-item-index]');
    if (!card) return;

    const itemIndex = Number(card.dataset.itemIndex);
    if (!Number.isFinite(itemIndex)) return;

    const press: PressState = {
      x: event.clientX,
      y: event.clientY,
      itemIndex,
    };

    justDraggedRef.current = false;
    pressRef.current = press;
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (pressRef.current !== press) return;
      justDraggedRef.current = true;
      onLongPressRef.current({ ...press });
    }, LONG_PRESS_MS);
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    const press = pressRef.current;
    if (!press || dragRef.current) return;

    const distance = Math.hypot(
      event.clientX - press.x,
      event.clientY - press.y,
    );
    if (distance > MOVE_TOLERANCE_PX) endPress();
  };

  const onPointerLeave: PointerEventHandler<HTMLDivElement> = () => {
    if (!dragRef.current) endPress();
  };

  const onClickCapture: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!justDraggedRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    justDraggedRef.current = false;
  };

  const onContextMenu: MouseEventHandler<HTMLDivElement> = (event) => {
    if (dragRef.current) event.preventDefault();
  };

  const onDragStart: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endPress,
    onPointerCancel: endPress,
    onPointerLeave,
    onClickCapture,
    onContextMenu,
    onDragStart,
  };
}
