import type { CardGridVariant } from './CardGrid';

export interface EditorGridConfig {
  /** Target card width used to choose the number of columns. */
  averageWidth: number;
  /** Natural card width that is scaled up to fill the row. */
  baseWidth: number;
  minPerRow: number;
  maxPerRow?: number;
}

export const EDITOR_GRID_CONFIG: Record<CardGridVariant, EditorGridConfig> = {
  equipment: { averageWidth: 220, baseWidth: 150, minPerRow: 2, maxPerRow: 4 },
  slime: { averageWidth: 200, baseWidth: 130, minPerRow: 2 },
  relic: { averageWidth: 200, baseWidth: 130, minPerRow: 2 },
  artifact: { averageWidth: 210, baseWidth: 160, minPerRow: 1 },
  buff: { averageWidth: 160, baseWidth: 160, minPerRow: 1 },
};

export const EDITOR_GRID_GAP = 16;
export const EDITOR_CELL_HORIZONTAL_PADDING = 24;

export interface EditorGridMetrics {
  columns: number;
  cardWidth: number;
}

function getColumnLimit(config: EditorGridConfig, itemCount: number): number {
  const maxPerRow = config.maxPerRow ?? itemCount;
  return Math.max(1, Math.min(maxPerRow, itemCount));
}

export function calculateEditorGrid(
  availableWidth: number,
  config: EditorGridConfig,
  itemCount: number,
): EditorGridMetrics {
  const columnLimit = getColumnLimit(config, itemCount);
  const minColumns = Math.min(config.minPerRow, columnLimit);
  const fittedColumns = Math.floor(
    (availableWidth + EDITOR_GRID_GAP) /
      (config.averageWidth + EDITOR_CELL_HORIZONTAL_PADDING + EDITOR_GRID_GAP),
  );
  const columns = Math.min(columnLimit, Math.max(minColumns, fittedColumns));
  const cardWidth =
    availableWidth > 0
      ? Math.max(
          0,
          (availableWidth - EDITOR_GRID_GAP * (columns - 1)) / columns -
            EDITOR_CELL_HORIZONTAL_PADDING,
        )
      : 0;

  return { columns, cardWidth };
}
