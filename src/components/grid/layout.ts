export type LayoutMode = 'default' | 'to-end' | 'hidden' | 'manual';

export interface LayoutItem {
  order: number;
  state: string;
}

export interface SlotEntry {
  index: number;
  visible: boolean;
}

export interface SlotLayoutState {
  rows: number;
  cols: number;
  mode: LayoutMode;
  entries: SlotEntry[];
}

export const LAYOUT_MODES: Array<{ value: LayoutMode; label: string }> = [
  { value: 'to-end', label: 'В конец' },
  { value: 'default', label: 'На месте' },
  { value: 'hidden', label: 'Не показывать' },
  { value: 'manual', label: 'Ручные индексы' },
];

function buildEntries<T extends LayoutItem>(
  items: T[],
  ordered: T[],
  isVisible: (item: T) => boolean,
): SlotEntry[] {
  const entries = new Array<SlotEntry>(items.length);
  let slot = 0;

  ordered.forEach((item) => {
    const itemIndex = items.indexOf(item);
    const visible = isVisible(item);
    entries[itemIndex] = { index: visible ? slot++ : -1, visible };
  });

  return entries;
}

export function calculateSlotEntries<T extends LayoutItem>(
  items: T[],
  mode: LayoutMode,
  current: SlotEntry[],
): SlotEntry[] {
  if (mode === 'manual' && current.length === items.length) return current;

  const ordered = [...items].sort((a, b) => a.order - b.order);

  if (mode === 'hidden') {
    return buildEntries(items, ordered, (item) => item.state !== 'no');
  }

  if (mode === 'to-end') {
    const present = ordered.filter((item) => item.state !== 'no');
    const absent = ordered.filter((item) => item.state === 'no');
    return buildEntries(items, [...present, ...absent], () => true);
  }

  return buildEntries(items, ordered, () => true);
}

export function entriesToIndices(entries: SlotEntry[]): number[] {
  return entries.map((entry) => (entry.visible ? entry.index : -1));
}

export function indicesToEntries(indices: number[]): SlotEntry[] {
  return indices.map((index) => ({ index, visible: index >= 0 }));
}
