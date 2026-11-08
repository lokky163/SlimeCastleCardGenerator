import { useEffect, useReducer } from 'react';
import {
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
  | { type: 'setSlotIndex'; itemIndex: number; slotIndex: number }
  | { type: 'setSlotVisible'; itemIndex: number; visible: boolean }
  | { type: 'setItemHidden'; key: string; hidden: boolean }
  | { type: 'apply'; layout: SlotLayoutInput }
  | { type: 'reset'; initial: SlotLayoutBase }
  | { type: 'sync' };

function createState(initial: SlotLayoutBase, items: LayoutItem[]): SlotLayoutState {
  const hiddenKeys = initial.hiddenKeys ?? [];
  return {
    ...initial,
    hiddenKeys,
    entries: calculateSlotEntries(items, initial.mode, [], hiddenKeys),
  };
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

function changeMode(
  state: SlotLayoutState,
  mode: LayoutMode,
  items: LayoutItem[],
): SlotLayoutState {
  if (mode === 'manual') {
    const entries = state.entries.map((entry) => ({ ...entry, hidden: false }));
    return { ...state, mode, entries };
  }

  return {
    ...state,
    mode,
    entries: calculateSlotEntries(items, mode, state.entries, state.hiddenKeys),
  };
}

function applyState(layout: SlotLayoutInput, items: LayoutItem[]): SlotLayoutState {
  const hiddenKeys = layout.hiddenKeys ?? [];

  if (layout.mode === 'manual') {
    const entries = layout.entries.map((entry) => ({ ...entry, hidden: false }));
    return { ...layout, hiddenKeys, entries };
  }

  return {
    ...layout,
    hiddenKeys,
    entries: calculateSlotEntries(items, layout.mode, layout.entries, hiddenKeys),
  };
}

function changeHidden(
  state: SlotLayoutState,
  key: string,
  hidden: boolean,
  items: LayoutItem[],
): SlotLayoutState {
  const hiddenKeys = hidden
    ? [...new Set([...state.hiddenKeys, key])]
    : state.hiddenKeys.filter((itemKey) => itemKey !== key);

  if (state.mode === 'manual') return { ...state, hiddenKeys };

  return {
    ...state,
    hiddenKeys,
    entries: calculateSlotEntries(items, state.mode, state.entries, hiddenKeys),
  };
}

function reduceLayout(
  state: SlotLayoutState,
  action: LayoutAction,
  items: LayoutItem[],
): SlotLayoutState {
  switch (action.type) {
    case 'setRows':
      return { ...state, rows: action.rows };
    case 'setCols':
      return { ...state, cols: action.cols };
    case 'setMode':
      return changeMode(state, action.mode, items);
    case 'setSlotIndex':
      return updateEntry(state, action.itemIndex, { index: action.slotIndex });
    case 'setSlotVisible':
      return updateEntry(state, action.itemIndex, { visible: action.visible });
    case 'setItemHidden':
      return changeHidden(state, action.key, action.hidden, items);
    case 'apply':
      return applyState(action.layout, items);
    case 'reset':
      return createState(action.initial, items);
    case 'sync':
      return state.mode === 'manual'
        ? state
        : {
            ...state,
            entries: calculateSlotEntries(
              items,
              state.mode,
              state.entries,
              state.hiddenKeys,
            ),
          };
  }
}

export function useSlotLayout<T extends LayoutItem>(
  items: T[],
  initial: SlotLayoutBase,
): SlotLayoutController {
  const [state, dispatch] = useReducer(
    (previous: SlotLayoutState, action: LayoutAction) =>
      reduceLayout(previous, action, items),
    initial,
    (base) => createState(base, items),
  );

  useEffect(() => {
    dispatch({ type: 'sync' });
  }, [items]);

  return {
    ...state,
    setRows: (rows) => dispatch({ type: 'setRows', rows }),
    setCols: (cols) => dispatch({ type: 'setCols', cols }),
    setMode: (mode) => dispatch({ type: 'setMode', mode }),
    setSlotIndex: (itemIndex, slotIndex) =>
      dispatch({ type: 'setSlotIndex', itemIndex, slotIndex }),
    setSlotVisible: (itemIndex, visible) =>
      dispatch({ type: 'setSlotVisible', itemIndex, visible }),
    setItemHidden: (key, hidden) => dispatch({ type: 'setItemHidden', key, hidden }),
    applyLayout: (layout) => dispatch({ type: 'apply', layout }),
    resetLayout: () => dispatch({ type: 'reset', initial }),
  };
}
