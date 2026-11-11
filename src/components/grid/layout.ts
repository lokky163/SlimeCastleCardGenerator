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

export interface LayoutModeOption {
  value: LayoutMode;
  /** Full name shown in the expanded list. */
  label: string;
  /** Short name shown in the closed dropdown. */
  shortLabel: string;
}

export const LAYOUT_MODES: LayoutModeOption[] = [
  { value: 'default', label: 'Missing in place', shortLabel: 'In place' },
  { value: 'to-end', label: 'Missing to end', shortLabel: 'To end' },
  { value: 'hidden', label: 'Hide missing', shortLabel: 'Hide' },
  { value: 'manual', label: 'Custom order', shortLabel: 'Custom' },
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

/**
 * Custom order stores one grid position per card. Old saved layouts may contain
 * gaps, duplicate indexes or -1, so the entries are rebuilt as a dense sequence
 * while preserving their relative order. Cards without an index go to the end.
 */
export function normalizeCustomEntries<T extends LayoutItem>(
  items: T[],
  current: SlotEntry[],
  hiddenKeys: Set<string>,
): SlotEntry[] {
  const order = items
    .map((_, index) => index)
    .sort((left, right) => {
      const leftIndex = current[left]?.index ?? -1;
      const rightIndex = current[right]?.index ?? -1;
      const leftOrder = leftIndex >= 0 ? leftIndex : Number.MAX_SAFE_INTEGER;
      const rightOrder = rightIndex >= 0 ? rightIndex : Number.MAX_SAFE_INTEGER;

      return leftOrder - rightOrder || left - right;
    });

  const entries = new Array<SlotEntry>(items.length);
  order.forEach((itemIndex, position) => {
    entries[itemIndex] = {
      index: position,
      visible: true,
      hidden: hiddenKeys.has(items[itemIndex].key),
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
  const hiddenSet = new Set(hideEnabled ? hiddenKeys : []);

  if (mode === 'manual') {
    return normalizeCustomEntries(items, current, hiddenSet);
  }

  const ordered = orderItems(items, mode, hiddenSet);
  return buildEntries(items, ordered, mode, hiddenSet);
}

export function calculateAutoSize(
  entries: SlotEntry[],
  maxCols: number,
): { rows: number; cols: number } {
  const lastShownSlot = entries.reduce(
    (last, entry) =>
      entry.visible && !entry.hidden && entry.index >= 0
        ? Math.max(last, entry.index)
        : last,
    -1,
  );
  const total = Math.max(1, lastShownSlot + 1);
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
