import type { CardGridVariant } from './CardGrid';

/**
 * All editor-only card sizing lives here. Sizes are CSS pixels.
 *
 * Proportions are taken from the original card content; width and height
 * always scale together. Pixel limits are hard, while minPerRow/maxPerRow are
 * preferences: the column count can leave their range to keep cards inside
 * the pixel limits.
 */
export interface EditorGridConfig {
  /** Target card width used to pick the starting column count. */
  averageWidth: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  /** Preferred column limits; pixel limits take priority. */
  minPerRow: number;
  maxPerRow: number;
  /** Natural card width at scale 1 (also used by the editor card wrapper). */
  baseWidth: number;
  /** Card height divided by card width, taken from the original card. */
  heightRatio: number;
}

export const EDITOR_GRID_CONFIG: Record<CardGridVariant, EditorGridConfig> = {
  equipment: {
    averageWidth: 220,
    minWidth: 120,
    maxWidth: 360,
    minHeight: 130,
    maxHeight: 390,
    minPerRow: 2,
    maxPerRow: 4,
    baseWidth: 150,
    heightRatio: 209 / 195,
  },
  slime: {
    averageWidth: 200,
    minWidth: 100,
    maxWidth: 320,
    minHeight: 85,
    maxHeight: 270,
    minPerRow: 2,
    maxPerRow: 8,
    baseWidth: 130,
    heightRatio: 276 / 333,
  },
  relic: {
    averageWidth: 200,
    minWidth: 100,
    maxWidth: 320,
    minHeight: 150,
    maxHeight: 500,
    minPerRow: 2,
    maxPerRow: 8,
    baseWidth: 130,
    heightRatio: 349 / 228,
  },
  artifact: {
    averageWidth: 210,
    minWidth: 120,
    maxWidth: 360,
    minHeight: 160,
    maxHeight: 480,
    minPerRow: 1,
    maxPerRow: 8,
    baseWidth: 160,
    heightRatio: 212 / 160,
  },
  buff: {
    averageWidth: 160,
    minWidth: 110,
    maxWidth: 280,
    minHeight: 115,
    maxHeight: 300,
    minPerRow: 1,
    maxPerRow: 10,
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

function getPreferredColumns(
  availableWidth: number,
  config: EditorGridConfig,
  itemCount: number,
): number {
  const itemLimit = Math.max(1, itemCount);
  const columnLimit = Math.max(1, Math.min(config.maxPerRow, itemLimit));
  const minColumns = Math.min(config.minPerRow, columnLimit);
  const fittedColumns = Math.floor(
    (availableWidth + EDITOR_GRID_GAP) /
      (config.averageWidth + EDITOR_CELL_HORIZONTAL_PADDING + EDITOR_GRID_GAP),
  );

  return Math.min(columnLimit, Math.max(minColumns, fittedColumns));
}

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

function getColumnRangeWithinWidth(
  availableWidth: number,
  itemLimit: number,
  bounds: { min: number; max: number },
): { min: number; max: number } | null {
  let first = -1;
  let last = -1;

  for (let columns = 1; columns <= itemLimit; columns++) {
    const width = getRowCardWidth(availableWidth, columns);
    if (width < bounds.min || width > bounds.max) continue;

    if (first === -1) first = columns;
    last = columns;
  }

  return first === -1 ? null : { min: first, max: last };
}

export function calculateEditorGrid(
  availableWidth: number,
  config: EditorGridConfig,
  itemCount: number,
): EditorGridMetrics {
  const itemLimit = Math.max(1, itemCount);
  const preferredColumns = getPreferredColumns(availableWidth, config, itemCount);
  if (availableWidth <= 0) return { columns: preferredColumns, cardWidth: 0 };

  const bounds = getWidthBounds(config);
  const columnRange = getColumnRangeWithinWidth(availableWidth, itemLimit, bounds);

  if (columnRange) {
    const columns = clamp(preferredColumns, columnRange.min, columnRange.max);
    return { columns, cardWidth: getRowCardWidth(availableWidth, columns) };
  }

  const oneColumnWidth = getRowCardWidth(availableWidth, 1);
  if (oneColumnWidth < bounds.min) {
    // Even a single card is narrower than minWidth: keep the row inside the grid.
    return { columns: 1, cardWidth: oneColumnWidth };
  }

  // All cards are wider than maxWidth even at the maximum column count.
  return {
    columns: itemLimit,
    cardWidth: Math.min(bounds.max, getRowCardWidth(availableWidth, itemLimit)),
  };
}
