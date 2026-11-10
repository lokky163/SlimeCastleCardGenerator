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
  setSlotIndex: (itemIndex: number, slotIndex: number) => void;
  setSlotVisible: (itemIndex: number, visible: boolean) => void;
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
  | { type: 'setSlotIndex'; itemIndex: number; slotIndex: number }
  | { type: 'setSlotVisible'; itemIndex: number; visible: boolean }
  | { type: 'setItemHidden'; key: string; hidden: boolean }
  | { type: 'apply'; layout: SlotLayoutInput }
  | { type: 'reset'; initial: SlotLayoutBase }
  | { type: 'sync' };

function applyAutoSize(state: SlotLayoutState, maxCols: number): SlotLayoutState {
  if (!state.autoSize || state.mode === 'manual') return state;

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
  const autoSize = initial.mode === 'manual' ? false : (initial.autoSize ?? true);
  const entries = makeEntries(items, initial.mode, [], hiddenKeys, hideEnabled);

  return applyAutoSize(
    { ...initial, hiddenKeys, hideEnabled, autoSize, entries },
    maxCols,
  );
}

function updateEntry(
  state: SlotLayoutState,
  itemIndex: number,
  changes: Partial<SlotEntry>,
): SlotLayoutState {
  return {
    ...state,
    entries: state.entries.map((entry, index) =>
      index === itemIndex ? { ...entry, ...changes } : entry,
    ),
  };
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
  if (mode === 'manual') {
    const entries = applyHiddenFlags(
      state.entries,
      items,
      state.hiddenKeys,
      state.hideEnabled,
    );
    return { ...state, mode, autoSize: false, entries };
  }

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
  const autoSize = layout.mode === 'manual' ? false : (layout.autoSize ?? true);

  if (layout.mode === 'manual') {
    const entries = applyHiddenFlags(
      layout.entries,
      items,
      hiddenKeys,
      hideEnabled,
    );
    return applyAutoSize(
      { ...layout, hiddenKeys, hideEnabled, autoSize, entries },
      maxCols,
    );
  }

  const entries = makeEntries(items, layout.mode, layout.entries, hiddenKeys, hideEnabled);
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
    return { ...state, hiddenKeys, entries };
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
  if (state.mode === 'manual') return { ...state, autoSize: false };
  return applyAutoSize({ ...state, autoSize }, maxCols);
}

function syncState(
  state: SlotLayoutState,
  items: LayoutItem[],
  maxCols: number,
): SlotLayoutState {
  if (state.mode === 'manual') return state;

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
    case 'setSlotIndex':
      return updateEntry(state, action.itemIndex, {
        index: action.slotIndex,
        visible: action.slotIndex >= 0,
      });
    case 'setSlotVisible':
      return updateEntry(state, action.itemIndex, { visible: action.visible });
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
    setSlotIndex: (itemIndex, slotIndex) =>
      dispatch({ type: 'setSlotIndex', itemIndex, slotIndex }),
    setSlotVisible: (itemIndex, visible) =>
      dispatch({ type: 'setSlotVisible', itemIndex, visible }),
    setItemHidden: (key, hidden) => dispatch({ type: 'setItemHidden', key, hidden }),
    applyLayout: (layout) => dispatch({ type: 'apply', layout }),
    resetLayout: () => dispatch({ type: 'reset', initial }),
  };
}
