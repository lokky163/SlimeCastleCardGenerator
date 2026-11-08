import { useEffect, useReducer } from 'react';
import {
  calculateSlotEntries,
  type LayoutItem,
  type LayoutMode,
  type SlotEntry,
  type SlotLayoutState,
} from './layout';

export interface SlotLayoutController extends SlotLayoutState {
  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
  setMode: (mode: LayoutMode) => void;
  setSlotIndex: (itemIndex: number, slotIndex: number) => void;
  setSlotVisible: (itemIndex: number, visible: boolean) => void;
  applyLayout: (layout: SlotLayoutState) => void;
  resetLayout: () => void;
}

type SlotLayoutBase = Omit<SlotLayoutState, 'entries'>;

type LayoutAction =
  | { type: 'setRows'; rows: number }
  | { type: 'setCols'; cols: number }
  | { type: 'setMode'; mode: LayoutMode }
  | { type: 'setSlotIndex'; itemIndex: number; slotIndex: number }
  | { type: 'setSlotVisible'; itemIndex: number; visible: boolean }
  | { type: 'apply'; layout: SlotLayoutState }
  | { type: 'reset'; initial: SlotLayoutBase }
  | { type: 'sync' };

function createState(initial: SlotLayoutBase, items: LayoutItem[]): SlotLayoutState {
  return { ...initial, entries: calculateSlotEntries(items, initial.mode, []) };
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
  const entries =
    mode === 'manual'
      ? state.entries
      : calculateSlotEntries(items, mode, state.entries);

  return { ...state, mode, entries };
}

function applyState(layout: SlotLayoutState, items: LayoutItem[]): SlotLayoutState {
  const entries =
    layout.mode === 'manual'
      ? layout.entries
      : calculateSlotEntries(items, layout.mode, layout.entries);

  return { ...layout, entries };
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
    case 'apply':
      return applyState(action.layout, items);
    case 'reset':
      return createState(action.initial, items);
    case 'sync':
      return state.mode === 'manual'
        ? state
        : {
            ...state,
            entries: calculateSlotEntries(items, state.mode, state.entries),
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
    applyLayout: (layout) => dispatch({ type: 'apply', layout }),
    resetLayout: () => dispatch({ type: 'reset', initial }),
  };
}
