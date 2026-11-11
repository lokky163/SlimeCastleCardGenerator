import type { ProfileDragState } from './profileDragTypes';

const GHOST_SCALE = 1.03;
const SCROLL_EDGE_PX = 40;

function ghostTransform(
  x: number,
  y: number,
  offsetX: number,
  offsetY: number,
): string {
  return `translate3d(${x - offsetX}px, ${y - offsetY}px, 0) scale(${GHOST_SCALE})`;
}

export function placeProfileGhost(
  ghost: HTMLElement,
  drag: ProfileDragState,
): void {
  ghost.style.transform = `translate3d(${drag.startLeft}px, ${
    drag.startTop
  }px, 0) scale(${GHOST_SCALE})`;
}

export function moveProfileGhost(
  ghost: HTMLElement,
  drag: ProfileDragState,
  x: number,
  y: number,
): void {
  ghost.style.transform = ghostTransform(x, y, drag.offsetX, drag.offsetY);
}

/**
 * The target position is the first row whose middle the pointer has crossed.
 * Positions are read with `offsetTop` so the running FLIP transform does not
 * affect the calculation.
 */
export function findProfileTarget(
  list: HTMLElement,
  y: number,
): number | null {
  const rows = list.querySelectorAll<HTMLElement>('[data-profile-position]');
  if (rows.length === 0) return null;

  const pointer = y - list.getBoundingClientRect().top + list.scrollTop;

  for (let position = 0; position < rows.length; position += 1) {
    const row = rows[position];
    if (pointer < row.offsetTop + row.offsetHeight / 2) return position;
  }

  return rows.length - 1;
}

/** Keeps the list scrolling when the pointer is held near its edges. */
export function autoScrollProfileList(list: HTMLElement, y: number): void {
  const rect = list.getBoundingClientRect();

  if (y < rect.top + SCROLL_EDGE_PX) {
    list.scrollTop -= Math.ceil((rect.top + SCROLL_EDGE_PX - y) / 4);
  } else if (y > rect.bottom - SCROLL_EDGE_PX) {
    list.scrollTop += Math.ceil((y - (rect.bottom - SCROLL_EDGE_PX)) / 4);
  }
}

export function moveProfileTo(
  drag: ProfileDragState,
  target: number,
): ProfileDragState {
  const order = [...drag.order];
  const [moved] = order.splice(drag.position, 1);
  order.splice(target, 0, moved);
  return { ...drag, order, position: target };
}
