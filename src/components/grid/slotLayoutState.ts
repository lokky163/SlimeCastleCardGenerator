import {
  calculateAutoSize,
  calculateSlotEntries,
  normalizeCustomEntries,
  type LayoutItem,
  type LayoutMode,
  type SlotEntry,
  type SlotLayoutBase,
  type SlotLayoutInput,
  type SlotLayoutState,
} from './layout';

export type LayoutAction =
  | { type: 'setRows'; rows: number }
  | { type: 'setCols'; cols: number }
  | { type: 'setMode'; mode: LayoutMode }
  | { type: 'setAutoSize'; autoSize: boolean }
  | { type: 'setHideEnabled'; hideEnabled: boolean }
  | { type: 'moveItem'; itemIndex: number; position: number }
  | { type: 'setItemHidden'; key: string; hidden: boolean }
  | { type: 'apply'; layout: SlotLayoutInput }
  | { type: 'reset'; initial: SlotLayoutBase }
  | { type: 'sync' };

function applyAutoSize(state: SlotLayoutState, maxCols: number): SlotLayoutState {
  if (!state.autoSize) return state;

  const { rows, cols } = calculateAutoSize(state.entries, maxCols);
  if (state.rows === rows && state.cols === cols) return state;
  return { ...state, rows, cols };
}

function makeEntries(
  items: LayoutItem[],
  mode: LayoutMode,
  customEntries: SlotEntry[],
  hiddenKeys: string[],
  hideEnabled: boolean,
): SlotEntry[] {
  return calculateSlotEntries(items, mode, customEntries, hiddenKeys, hideEnabled);
}

function makeCustomEntries(
  items: LayoutItem[],
  saved: SlotEntry[] | undefined,
  hiddenKeys: string[],
  hideEnabled: boolean,
): SlotEntry[] {
  return normalizeCustomEntries(items, saved ?? [], new Set(hideEnabled ? hiddenKeys : []));
}

export function createState(
  initial: SlotLayoutBase,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  const hiddenKeys = initial.hiddenKeys ?? [];
  const hideEnabled = initial.hideEnabled ?? hiddenKeys.length > 0;
  const autoSize = initial.autoSize ?? true;
  const customEntries = makeCustomEntries(
    items,
    initial.customEntries,
    hiddenKeys,
    hideEnabled,
  );
  const entries = makeEntries(
    items,
    initial.mode,
    customEntries,
    hiddenKeys,
    hideEnabled,
  );

  return applyAutoSize(
    { ...initial, hiddenKeys, hideEnabled, autoSize, customEntries, entries },
    maxCols,
  );
}

function applyHiddenFlags(
  entries: SlotEntry[],
  items: LayoutItem[],
  hiddenKeys: string[],
  hideEnabled: boolean,
): SlotEntry[] {
  const hiddenSet = new Set(hideEnabled ? hiddenKeys : []);

  return entries.map((entry, index) => ({
    ...entry,
    hidden: hiddenSet.has(items[index]?.key ?? ''),
  }));
}

function changeMode(
  state: SlotLayoutState,
  mode: LayoutMode,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  // Switching modes never touches the saved custom order: it is only applied
  // again when the user returns to the custom mode.
  const entries = makeEntries(
    items,
    mode,
    state.customEntries,
    state.hiddenKeys,
    state.hideEnabled,
  );
  return applyAutoSize({ ...state, mode, entries }, maxCols);
}

function applyState(
  layout: SlotLayoutInput,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  const hiddenKeys = layout.hiddenKeys ?? [];
  const hideEnabled = layout.hideEnabled ?? hiddenKeys.length > 0;
  const autoSize = layout.autoSize ?? true;

  // Files written before the custom order was stored separately kept it in
  // `entries`, and only while the manual mode was active.
  const savedCustom =
    layout.customEntries ??
    (layout.mode === 'manual' ? layout.entries : []);
  const customEntries = makeCustomEntries(
    items,
    savedCustom,
    hiddenKeys,
    hideEnabled,
  );
  const entries = makeEntries(
    items,
    layout.mode,
    customEntries,
    hiddenKeys,
    hideEnabled,
  );

  return applyAutoSize(
    { ...layout, hiddenKeys, hideEnabled, autoSize, customEntries, entries },
    maxCols,
  );
}

function changeHidden(
  state: SlotLayoutState,
  key: string,
  hidden: boolean,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  const hiddenKeys = hidden
    ? [...new Set([...state.hiddenKeys, key])]
    : state.hiddenKeys.filter((itemKey) => itemKey !== key);
  const customEntries = applyHiddenFlags(
    state.customEntries,
    items,
    hiddenKeys,
    state.hideEnabled,
  );
  const entries =
    state.mode === 'manual'
      ? customEntries
      : makeEntries(
          items,
          state.mode,
          customEntries,
          hiddenKeys,
          state.hideEnabled,
        );

  return applyAutoSize(
    { ...state, hiddenKeys, customEntries, entries },
    maxCols,
  );
}

function changeHideEnabled(
  state: SlotLayoutState,
  hideEnabled: boolean,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  const customEntries = applyHiddenFlags(
    state.customEntries,
    items,
    state.hiddenKeys,
    hideEnabled,
  );
  const entries =
    state.mode === 'manual'
      ? customEntries
      : makeEntries(items, state.mode, customEntries, state.hiddenKeys, hideEnabled);

  return applyAutoSize(
    { ...state, hideEnabled, customEntries, entries },
    maxCols,
  );
}

function changeAutoSize(
  state: SlotLayoutState,
  autoSize: boolean,
  maxCols: number,
): SlotLayoutState {
  return applyAutoSize({ ...state, autoSize }, maxCols);
}

function moveItem(
  state: SlotLayoutState,
  itemIndex: number,
  position: number,
  maxCols: number,
): SlotLayoutState {
  if (state.mode !== 'manual') return state;

  const order = state.customEntries
    .map((entry, index) => ({ index, position: entry.index }))
    .sort((left, right) => left.position - right.position || left.index - right.index)
    .map((item) => item.index);

  const from = order.indexOf(itemIndex);
  if (from < 0) return state;

  const target = Math.max(0, Math.min(position, order.length - 1));
  if (from === target) return state;

  const [moved] = order.splice(from, 1);
  order.splice(target, 0, moved);

  const positionByItem = new Map(order.map((index, orderIndex) => [index, orderIndex]));
  const customEntries = state.customEntries.map((entry, index) => ({
    ...entry,
    index: positionByItem.get(index) ?? index,
    visible: true,
  }));

  return applyAutoSize(
    { ...state, customEntries, entries: customEntries },
    maxCols,
  );
}

function syncState(
  state: SlotLayoutState,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  const customEntries =
    state.customEntries.length === items.length
      ? state.customEntries
      : makeCustomEntries(
          items,
          state.customEntries,
          state.hiddenKeys,
          state.hideEnabled,
        );
  const entries = makeEntries(
    items,
    state.mode,
    customEntries,
    state.hiddenKeys,
    state.hideEnabled,
  );
  return applyAutoSize({ ...state, customEntries, entries }, maxCols);
}

export function reduceLayout(
  state: SlotLayoutState,
  action: LayoutAction,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  switch (action.type) {
    case 'setRows':
      return { ...state, rows: action.rows };
    case 'setCols':
      return { ...state, cols: action.cols };
    case 'setAutoSize':
      return changeAutoSize(state, action.autoSize, maxCols);
    case 'setHideEnabled':
      return changeHideEnabled(state, action.hideEnabled, items, maxCols);
    case 'setMode':
      return changeMode(state, action.mode, items, maxCols);
    case 'moveItem':
      return moveItem(state, action.itemIndex, action.position, maxCols);
    case 'setItemHidden':
      return changeHidden(state, action.key, action.hidden, items, maxCols);
    case 'apply':
      return applyState(action.layout, items, maxCols);
    case 'reset':
      return createState(action.initial, items, maxCols);
    case 'sync':
      return syncState(state, items, maxCols);
  }
}
