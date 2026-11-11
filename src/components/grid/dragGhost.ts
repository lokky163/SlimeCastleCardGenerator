import styles from './SlotGrid.module.css';

const GHOST_SCALE = 1.03;

export interface DragGhost {
  element: HTMLElement;
  width: number;
  height: number;
  /** Grab point inside the card, in pixels. */
  offsetX: number;
  offsetY: number;
}

function applyGhostStyle(ghost: HTMLElement, width: number, height: number): void {
  ghost.classList.add(styles.dragGhost);
  ghost.removeAttribute('data-item-index');
  ghost.style.position = 'fixed';
  ghost.style.top = '0';
  ghost.style.left = '0';
  ghost.style.width = `${width}px`;
  ghost.style.height = `${height}px`;
  ghost.style.margin = '0';
  ghost.style.boxSizing = 'border-box';
  // The cloned card keeps `.item`'s transform transition, which would make the
  // ghost lag behind the pointer. Move it without smoothing.
  ghost.style.transition = 'none';
  ghost.style.zIndex = '1200';
  ghost.style.pointerEvents = 'none';
  ghost.style.transformOrigin = 'center';
  ghost.style.willChange = 'transform';
}

export function createDragGhost(
  row: HTMLElement,
  x: number,
  y: number,
): DragGhost {
  const rect = row.getBoundingClientRect();
  const element = row.cloneNode(true) as HTMLElement;

  applyGhostStyle(element, rect.width, rect.height);
  element.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0) scale(${GHOST_SCALE})`;
  document.body.appendChild(element);

  return {
    element,
    width: rect.width,
    height: rect.height,
    offsetX: x - rect.left,
    offsetY: y - rect.top,
  };
}

export function moveDragGhost(
  ghost: DragGhost,
  x: number,
  y: number,
): void {
  ghost.element.style.transform = `translate3d(${x - ghost.offsetX}px, ${
    y - ghost.offsetY
  }px, 0) scale(${GHOST_SCALE})`;
}
