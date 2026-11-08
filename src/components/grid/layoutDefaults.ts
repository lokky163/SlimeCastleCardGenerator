import type { SlotLayoutBase } from './layout';

export const DEFAULT_LAYOUTS = {
  equipment: { rows: 2, cols: 4, mode: 'default' },
  slimes: { rows: 5, cols: 6, mode: 'to-end' },
  relics: { rows: 3, cols: 6, mode: 'to-end' },
  artifacts: { rows: 3, cols: 4, mode: 'default' },
  buffs: { rows: 3, cols: 7, mode: 'default' },
} satisfies Record<string, SlotLayoutBase>;

export type LayoutModuleKey = keyof typeof DEFAULT_LAYOUTS;
