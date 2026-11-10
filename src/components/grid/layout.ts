export type LayoutMode = 'default' | 'to-end' | 'hidden' | 'manual';

export interface LayoutItem {
  key: string;
  order: number;
  isAbsent: boolean;
}

export interface SlotEntry {
  index: number;
  visible: boolean;
  hidden: boolean;
}

export interface SlotLayoutState {
  rows: number;
  cols: number;
  mode: LayoutMode;
  autoSize: boolean;
  hideEnabled: boolean;
  entries: SlotEntry[];
  hiddenKeys: string[];
}

export type SlotLayoutBase = Omit<SlotLayoutState, 'entries' | 'hiddenKeys'> & {
  hiddenKeys?: string[];
};

export type SlotLayoutInput = SlotLayoutBase & { entries: SlotEntry[] };

export const LAYOUT_MODES: Array<{ value: LayoutMode; label: string }> = [
  { value: 'default', label: 'Keep in place' },
  { value: 'to-end', label: 'Move to end' },
  { value: 'hidden', label: 'Hide missing' },
  { value: 'manual', label: 'Manual indexes' },
];

function buildEntries<T extends LayoutItem>(
  items: T[],
  ordered: T[],
  mode: LayoutMode,
  hiddenKeys: Set<string>,
): SlotEntry[] {
  const entries = new Array<SlotEntry>(items.length);
  let slot = 0;

  ordered.forEach((item) => {
    const hidden = hiddenKeys.has(item.key);
    const visible = mode !== 'hidden' || !item.isAbsent;
    const occupiesSlot = (visible && !hidden) || mode === 'default';

    entries[items.indexOf(item)] = {
      index: occupiesSlot ? slot++ : -1,
      visible,
      hidden,
    };
  });

  return entries;
}

function orderItems<T extends LayoutItem>(
  items: T[],
  mode: LayoutMode,
  hiddenKeys: Set<string>,
): T[] {
  const ordered = [...items].sort((a, b) => a.order - b.order);

  if (mode === 'to-end') {
    const front = ordered.filter((item) => !item.isAbsent && !hiddenKeys.has(item.key));
    const end = ordered.filter((item) => item.isAbsent || hiddenKeys.has(item.key));
    return [...front, ...end];
  }

  return ordered;
}

export function calculateSlotEntries<T extends LayoutItem>(
  items: T[],
  mode: LayoutMode,
  current: SlotEntry[],
  hiddenKeys: string[] = [],
  hideEnabled = true,
): SlotEntry[] {
  if (mode === 'manual' && current.length === items.length) return current;

  const hiddenSet = new Set(hideEnabled ? hiddenKeys : []);
  const ordered = orderItems(items, mode, hiddenSet);
  return buildEntries(items, ordered, mode, hiddenSet);
}

export function calculateAutoSize(
  entries: SlotEntry[],
  maxCols: number,
): { rows: number; cols: number } {
  const occupied = entries.filter((entry) => entry.index >= 0).length;
  const total = Math.max(1, occupied);
  const cols = Math.min(Math.max(1, maxCols), total);
  return { rows: Math.ceil(total / cols), cols };
}

export interface FilledSlot<T> {
  item: T;
}

export function fillSlots<T>(
  items: T[],
  entries: SlotEntry[],
  slotCount: number,
): Array<FilledSlot<T> | null> {
  const slots = new Array<FilledSlot<T> | null>(slotCount).fill(null);

  items.forEach((item, itemIndex) => {
    const entry = entries[itemIndex];
    if (!entry?.visible || entry.hidden) return;
    if (entry.index < 0 || entry.index >= slotCount) return;
    slots[entry.index] = { item };
  });

  return slots;
}
