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
  entries: SlotEntry[];
  hiddenKeys: string[];
}

export type SlotLayoutBase = Omit<SlotLayoutState, 'entries' | 'hiddenKeys'> & {
  hiddenKeys?: string[];
};

export type SlotLayoutInput = SlotLayoutBase & { entries: SlotEntry[] };

export const LAYOUT_MODES: Array<{ value: LayoutMode; label: string }> = [
  { value: 'to-end', label: 'В конец' },
  { value: 'default', label: 'На месте' },
  { value: 'hidden', label: 'Не показывать' },
  { value: 'manual', label: 'Ручные индексы' },
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
    const visible = mode !== 'hidden' || (!item.isAbsent && !hidden);
    entries[items.indexOf(item)] = {
      index: visible ? slot++ : -1,
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
): SlotEntry[] {
  if (mode === 'manual' && current.length === items.length) return current;

  const hiddenSet = new Set(hiddenKeys);
  const ordered = orderItems(items, mode, hiddenSet);
  return buildEntries(items, ordered, mode, hiddenSet);
}

export function fillSlots<T>(
  items: T[],
  entries: SlotEntry[],
  slotCount: number,
): Array<T | null> {
  const slots = new Array<T | null>(slotCount).fill(null);

  items.forEach((item, itemIndex) => {
    const entry = entries[itemIndex];
    if (!entry?.visible) return;
    if (entry.index < 0 || entry.index >= slotCount) return;
    slots[entry.index] = item;
  });

  return slots;
}
