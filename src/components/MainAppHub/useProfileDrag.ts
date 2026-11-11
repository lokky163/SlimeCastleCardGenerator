import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEventHandler,
  type RefObject,
} from 'react';
import type { SccProfile } from '../../services/ProfilesSchema';
import { placeProfileGhost } from './profileDrag';
import type {
  ProfileDragState,
  ProfileDrawerHandlers,
  ProfilePress,
  ProfileRowHandlers,
} from './profileDragTypes';
import { useProfileDragSession } from './useProfileDragSession';

interface UseProfileDragOptions {
  profiles: SccProfile[];
  listRef: RefObject<HTMLDivElement | null>;
  onReorderProfile: (from: number, to: number) => void;
}

const LONG_PRESS_MS = 180;
const MOVE_TOLERANCE_PX = 10;
const NO_DRAG_SELECTOR = '[data-no-drag]';

export function useProfileDrag({
  profiles,
  listRef,
  onReorderProfile,
}: UseProfileDragOptions) {
  const [drag, setDrag] = useState<ProfileDragState | null>(null);
  const dragRef = useRef<ProfileDragState | null>(null);
  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;
  const ghostRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<ProfilePress | null>(null);
  const timerRef = useRef<number | null>(null);
  const justDraggedRef = useRef(false);

  const clearPressTimer = () => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const endPress = () => {
    clearPressTimer();
    pressRef.current = null;
  };

  useEffect(() => () => clearPressTimer(), []);

  // The ghost position is updated imperatively on pointer move, so it must be
  // placed once on mount instead of being reset by every re-render.
  useLayoutEffect(() => {
    if (!drag) return;

    const ghost = ghostRef.current;
    const current = dragRef.current;
    if (!ghost || !current) return;

    placeProfileGhost(ghost, current);
  }, [drag]);

  const startDrag = (press: ProfilePress) => {
    const rect = press.row.getBoundingClientRect();
    const next: ProfileDragState = {
      order: profilesRef.current.map((_, index) => index),
      position: press.index,
      width: rect.width,
      height: rect.height,
      offsetX: press.x - rect.left,
      offsetY: press.y - rect.top,
      startLeft: rect.left,
      startTop: rect.top,
    };

    justDraggedRef.current = true;
    dragRef.current = next;
    setDrag(next);
  };

  const onPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest(NO_DRAG_SELECTOR)) return;

    justDraggedRef.current = false;
    const press: ProfilePress = {
      x: event.clientX,
      y: event.clientY,
      index,
      row: event.currentTarget,
    };
    pressRef.current = press;
    clearPressTimer();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (pressRef.current === press) startDrag(press);
    }, LONG_PRESS_MS);
  };

  const onPointerMove: PointerEventHandler<HTMLElement> = (event) => {
    const press = pressRef.current;
    if (!press || dragRef.current) return;

    const distance = Math.hypot(
      event.clientX - press.x,
      event.clientY - press.y,
    );
    if (distance <= MOVE_TOLERANCE_PX) return;

    // A moving finger is most likely scrolling, so it cancels the press.
    if (event.pointerType === 'touch') {
      endPress();
      return;
    }

    // A mouse or pen usually starts moving right away: pick the row up as soon
    // as the drag starts instead of waiting for the rest of the long press.
    clearPressTimer();
    startDrag(press);
  };

  useProfileDragSession({
    drag,
    listRef,
    dragRef,
    ghostRef,
    pressRef,
    setDrag,
    onReorder: onReorderProfile,
  });

  const rowHandlers: ProfileRowHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endPress,
    onPointerCancel: endPress,
    onPointerLeave: () => {
      if (!dragRef.current) endPress();
    },
  };

  const drawerHandlers: ProfileDrawerHandlers = {
    onPointerDownCapture: () => {
      justDraggedRef.current = false;
    },
    onClickCapture: (event) => {
      if (!justDraggedRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      justDraggedRef.current = false;
    },
    onContextMenu: (event) => {
      if (dragRef.current) event.preventDefault();
    },
  };

  return {
    drag,
    ghostRef,
    isDragging: drag !== null,
    rowHandlers,
    drawerHandlers,
  };
}

export type { ProfileDragState } from './profileDragTypes';
