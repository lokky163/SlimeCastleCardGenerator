import type { SlotLayoutBase } from './layout';

export const DEFAULT_LAYOUTS = {
  equipment: {
    rows: 3,
    cols: 4,
    mode: 'default',
    autoSize: true,
    hideEnabled: false,
  },
  slimes: {
    rows: 5,
    cols: 6,
    mode: 'to-end',
    autoSize: true,
    hideEnabled: false,
  },
  relics: {
    rows: 3,
    cols: 6,
    mode: 'to-end',
    autoSize: true,
    hideEnabled: false,
  },
  artifacts: {
    rows: 3,
    cols: 4,
    mode: 'default',
    autoSize: true,
    hideEnabled: false,
  },
  buffs: {
    rows: 3,
    cols: 7,
    mode: 'default',
    autoSize: true,
    hideEnabled: false,
  },
} satisfies Record<string, SlotLayoutBase>;

export type LayoutModuleKey = keyof typeof DEFAULT_LAYOUTS;

export const MAX_AUTO_COLS: Record<LayoutModuleKey, number> = {
  equipment: 4,
  slimes: 6,
  relics: 6,
  artifacts: 4,
  buffs: 6,
};
