import { useEffect, useReducer } from 'react';
import {
  calculateAutoSize,
  calculateSlotEntries,
  type LayoutItem,
  type LayoutMode,
  type SlotEntry,
  type SlotLayoutBase,
  type SlotLayoutInput,
  type SlotLayoutState,
} from './layout';

export interface SlotLayoutController extends SlotLayoutState {
  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
  setMode: (mode: LayoutMode) => void;
  setAutoSize: (autoSize: boolean) => void;
  setHideEnabled: (hideEnabled: boolean) => void;
  moveItem: (itemIndex: number, position: number) => void;
  setItemHidden: (key: string, hidden: boolean) => void;
  applyLayout: (layout: SlotLayoutInput) => void;
  resetLayout: () => void;
}

type LayoutAction =
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
  current: SlotEntry[],
  hiddenKeys: string[],
  hideEnabled: boolean,
): SlotEntry[] {
  return calculateSlotEntries(items, mode, current, hiddenKeys, hideEnabled);
}

function createState(
  initial: SlotLayoutBase,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  const hiddenKeys = initial.hiddenKeys ?? [];
  const hideEnabled = initial.hideEnabled ?? hiddenKeys.length > 0;
  const autoSize = initial.autoSize ?? true;
  const entries = makeEntries(items, initial.mode, [], hiddenKeys, hideEnabled);

  return applyAutoSize(
    { ...initial, hiddenKeys, hideEnabled, autoSize, entries },
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
  const entries = makeEntries(
    items,
    mode,
    state.entries,
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

  const entries = makeEntries(
    items,
    layout.mode,
    layout.entries,
    hiddenKeys,
    hideEnabled,
  );
  return applyAutoSize(
    { ...layout, hiddenKeys, hideEnabled, autoSize, entries },
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

  if (state.mode === 'manual') {
    const entries = applyHiddenFlags(
      state.entries,
      items,
      hiddenKeys,
      state.hideEnabled,
    );
    return applyAutoSize({ ...state, hiddenKeys, entries }, maxCols);
  }

  const entries = makeEntries(
    items,
    state.mode,
    state.entries,
    hiddenKeys,
    state.hideEnabled,
  );
  return applyAutoSize({ ...state, hiddenKeys, entries }, maxCols);
}

function changeHideEnabled(
  state: SlotLayoutState,
  hideEnabled: boolean,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  const entries =
    state.mode === 'manual'
      ? applyHiddenFlags(state.entries, items, state.hiddenKeys, hideEnabled)
      : makeEntries(items, state.mode, state.entries, state.hiddenKeys, hideEnabled);
  return applyAutoSize({ ...state, hideEnabled, entries }, maxCols);
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

  const order = state.entries
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
  const entries = state.entries.map((entry, index) => ({
    ...entry,
    index: positionByItem.get(index) ?? index,
    visible: true,
  }));

  return applyAutoSize({ ...state, entries }, maxCols);
}

function syncState(
  state: SlotLayoutState,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  if (state.mode === 'manual') {
    if (state.entries.length === items.length) return state;

    const entries = makeEntries(
      items,
      state.mode,
      state.entries,
      state.hiddenKeys,
      state.hideEnabled,
    );
    return applyAutoSize({ ...state, entries }, maxCols);
  }

  const entries = makeEntries(
    items,
    state.mode,
    state.entries,
    state.hiddenKeys,
    state.hideEnabled,
  );
  return applyAutoSize({ ...state, entries }, maxCols);
}

function reduceLayout(
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

export function useSlotLayout<T extends LayoutItem>(
  items: T[],
  initial: SlotLayoutBase,
  maxCols: number,
): SlotLayoutController {
  const [state, dispatch] = useReducer(
    (previous: SlotLayoutState, action: LayoutAction) =>
      reduceLayout(previous, action, items, maxCols),
    initial,
    (base) => createState(base, items, maxCols),
  );

  useEffect(() => {
    dispatch({ type: 'sync' });
  }, [items, maxCols]);

  return {
    ...state,
    setRows: (rows) => dispatch({ type: 'setRows', rows }),
    setCols: (cols) => dispatch({ type: 'setCols', cols }),
    setMode: (mode) => dispatch({ type: 'setMode', mode }),
    setAutoSize: (autoSize) => dispatch({ type: 'setAutoSize', autoSize }),
    setHideEnabled: (hideEnabled) =>
      dispatch({ type: 'setHideEnabled', hideEnabled }),
    moveItem: (itemIndex, position) =>
      dispatch({ type: 'moveItem', itemIndex, position }),
    setItemHidden: (key, hidden) => dispatch({ type: 'setItemHidden', key, hidden }),
    applyLayout: (layout) => dispatch({ type: 'apply', layout }),
    resetLayout: () => dispatch({ type: 'reset', initial }),
  };
}
