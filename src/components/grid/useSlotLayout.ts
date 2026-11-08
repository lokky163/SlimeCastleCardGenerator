import { useEffect, useState } from 'react';
import {
  calculateSlotEntries,
  type LayoutItem,
  type LayoutMode,
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

export function useSlotLayout<T extends LayoutItem>(
  items: T[],
  initial: Omit<SlotLayoutState, 'entries'>,
): SlotLayoutController {
  const [state, setState] = useState<SlotLayoutState>(() => ({
    ...initial,
    entries: calculateSlotEntries(items, initial.mode, []),
  }));

  useEffect(() => {
    setState((previous) => {
      if (previous.mode === 'manual') return previous;

      return {
        ...previous,
        entries: calculateSlotEntries(items, previous.mode, previous.entries),
      };
    });
  }, [items]);

  const setRows = (rows: number) => setState((previous) => ({ ...previous, rows }));

  const setCols = (cols: number) => setState((previous) => ({ ...previous, cols }));

  const setMode = (mode: LayoutMode) => {
    setState((previous) => ({
      ...previous,
      mode,
      entries:
        mode === 'manual'
          ? previous.entries
          : calculateSlotEntries(items, mode, previous.entries),
    }));
  };

  const setSlotIndex = (itemIndex: number, slotIndex: number) => {
    setState((previous) => ({
      ...previous,
      entries: previous.entries.map((entry, index) =>
        index === itemIndex ? { ...entry, index: slotIndex } : entry,
      ),
    }));
  };

  const setSlotVisible = (itemIndex: number, visible: boolean) => {
    setState((previous) => ({
      ...previous,
      entries: previous.entries.map((entry, index) =>
        index === itemIndex ? { ...entry, visible } : entry,
      ),
    }));
  };

  const applyLayout = (layout: SlotLayoutState) => {
    setState({
      ...layout,
      entries:
        layout.mode === 'manual'
          ? layout.entries
          : calculateSlotEntries(items, layout.mode, layout.entries),
    });
  };

  const resetLayout = () => {
    setState({
      ...initial,
      entries: calculateSlotEntries(items, initial.mode, []),
    });
  };

  return {
    ...state,
    setRows,
    setCols,
    setMode,
    setSlotIndex,
    setSlotVisible,
    applyLayout,
    resetLayout,
  };
}
