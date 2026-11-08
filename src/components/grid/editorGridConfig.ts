import type { CardGridVariant } from './CardGrid';

/**
 * All editor-only card sizing lives here. Sizes are CSS pixels.
 *
 * The number of columns starts at maxPerRow and is reduced down to minPerRow
 * only when a cell would squeeze the card below its minimum size. The cell
 * itself always fills the row; the card inside is clamped by the pixel limits
 * and centered when the cell is larger.
 */
export interface EditorGridConfig {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  minPerRow: number;
  maxPerRow: number;
  /** Natural card width at scale 1 (also used by the editor card wrapper). */
  baseWidth: number;
  /** Card height divided by card width, taken from the original card. */
  heightRatio: number;
}

export const EDITOR_GRID_CONFIG: Record<CardGridVariant, EditorGridConfig> = {
  equipment: {
    minWidth: 120,
    maxWidth: 230,
    minHeight: 130,
    maxHeight: 230,
    minPerRow: 2,
    maxPerRow: 4,
    baseWidth: 150,
    heightRatio: 209 / 207,
  },
  slime: {
    minWidth: 100,
    maxWidth: 320,
    minHeight: 85,
    maxHeight: 270,
    minPerRow: 2,
    maxPerRow: 6,
    baseWidth: 130,
    heightRatio: 276 / 333,
  },
  relic: {
    minWidth: 100,
    maxWidth: 320,
    minHeight: 150,
    maxHeight: 500,
    minPerRow: 2,
    maxPerRow: 5,
    baseWidth: 130,
    heightRatio: 349 / 228,
  },
  artifact: {
    minWidth: 120,
    maxWidth: 360,
    minHeight: 160,
    maxHeight: 480,
    minPerRow: 1,
    maxPerRow: 5,
    baseWidth: 160,
    heightRatio: 212 / 160,
  },
  buff: {
    minWidth: 110,
    maxWidth: 280,
    minHeight: 115,
    maxHeight: 300,
    minPerRow: 1,
    maxPerRow: 6,
    baseWidth: 160,
    heightRatio: 167 / 160,
  },
};

export const EDITOR_GRID_GAP = 16;
export const EDITOR_CELL_HORIZONTAL_PADDING = 24;

export interface EditorGridMetrics {
  columns: number;
  cardWidth: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function getRowCardWidth(availableWidth: number, columns: number): number {
  if (availableWidth <= 0) return 0;

  return Math.max(
    0,
    (availableWidth - EDITOR_GRID_GAP * (columns - 1)) / columns -
      EDITOR_CELL_HORIZONTAL_PADDING,
  );
}

function getWidthBounds(config: EditorGridConfig): { min: number; max: number } {
  const heightRatio = config.heightRatio > 0 ? config.heightRatio : 1;
  const minFromHeight = config.minHeight / heightRatio;
  const maxFromHeight = config.maxHeight / heightRatio;
  const min = Math.max(config.minWidth, minFromHeight);
  const max = Math.min(config.maxWidth, maxFromHeight);

  if (min <= max) return { min, max };

  // Contradictory limits: keep width bounds, since width drives the scale.
  return {
    min: Math.min(config.minWidth, config.maxWidth),
    max: Math.max(config.minWidth, config.maxWidth),
  };
}

function getColumnCount(
  availableWidth: number,
  config: EditorGridConfig,
  itemCount: number,
  minCardWidth: number,
): number {
  const itemLimit = Math.max(1, itemCount);
  const maxColumns = Math.max(1, Math.min(config.maxPerRow, itemLimit));
  const minColumns = Math.min(config.minPerRow, maxColumns);
  let columns = maxColumns;

  while (columns > minColumns) {
    if (getRowCardWidth(availableWidth, columns) >= minCardWidth) break;
    columns--;
  }

  return columns;
}

export function calculateEditorGrid(
  availableWidth: number,
  config: EditorGridConfig,
  itemCount: number,
): EditorGridMetrics {
  const itemLimit = Math.max(1, itemCount);
  const maxColumns = Math.max(1, Math.min(config.maxPerRow, itemLimit));
  if (availableWidth <= 0) return { columns: maxColumns, cardWidth: 0 };

  const bounds = getWidthBounds(config);
  const columns = getColumnCount(
    availableWidth,
    config,
    itemCount,
    bounds.min,
  );
  const cellWidth = getRowCardWidth(availableWidth, columns);

  return { columns, cardWidth: clamp(cellWidth, bounds.min, bounds.max) };
}
