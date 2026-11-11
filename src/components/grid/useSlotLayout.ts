import { useEffect, useReducer } from 'react';
import type {
  LayoutItem,
  LayoutMode,
  SlotLayoutBase,
  SlotLayoutInput,
  SlotLayoutState,
} from './layout';
import {
  createState,
  reduceLayout,
  type LayoutAction,
} from './slotLayoutState';

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
