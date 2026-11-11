export interface DragCell {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface CardPosition {
  left: number;
  top: number;
}

/** Distance from the pointer to a cell that still counts as a hit. */
const GAP_REACH_PX = 48;

/**
 * Reads the layout boxes of the cards in display order. `offsetLeft`/`offsetTop`
 * are used instead of `getBoundingClientRect` because the cards are animated
 * with transforms during a drag and hit testing must ignore that animation.
 */
export function readDragCells(grid: HTMLElement): DragCell[] {
  const gridRect = grid.getBoundingClientRect();

  return Array.from(
    grid.querySelectorAll<HTMLElement>('[data-item-index]'),
  ).map((card) => {
    const left = gridRect.left + card.offsetLeft;
    const top = gridRect.top + card.offsetTop;

    return {
      left,
      top,
      right: left + card.offsetWidth,
      bottom: top + card.offsetHeight,
    };
  });
}

export function measureCards(grid: HTMLElement): Map<number, CardPosition> {
  const positions = new Map<number, CardPosition>();

  grid.querySelectorAll<HTMLElement>('[data-item-index]').forEach((card) => {
    const itemIndex = Number(card.dataset.itemIndex);
    if (!Number.isFinite(itemIndex)) return;
    positions.set(itemIndex, { left: card.offsetLeft, top: card.offsetTop });
  });

  return positions;
}

function distanceToCell(cell: DragCell, x: number, y: number): number {
  const dx = Math.max(cell.left - x, 0, x - cell.right);
  const dy = Math.max(cell.top - y, 0, y - cell.bottom);
  return Math.hypot(dx, dy);
}

/** Returns the display position under the point, or the closest one near it. */
export function findCellIndex(
  cells: DragCell[],
  x: number,
  y: number,
): number | null {
  let nearest = -1;
  let nearestDistance = GAP_REACH_PX;

  for (let index = 0; index < cells.length; index += 1) {
    const distance = distanceToCell(cells[index], x, y);
    if (distance === 0) return index;
    if (distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  }

  return nearest >= 0 ? nearest : null;
}
