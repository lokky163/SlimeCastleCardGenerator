import { useState, type Dispatch, type SetStateAction } from 'react';
import {
  createExportSelection,
  type ExportElement,
  type ExportSelection,
} from '../models/exportSelection';

export interface ExportSettings {
  selection: ExportSelection;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: (key: ExportElement) => void;
  selectAll: () => void;
  clearAll: () => void;
  exportImage: () => void;
}

export function useExportSettings(
  selection: ExportSelection,
  setSelection: Dispatch<SetStateAction<ExportSelection>>,
  onExport: () => void,
): ExportSettings {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (key: ExportElement) => {
    setSelection((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  return {
    selection,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle,
    selectAll: () => setSelection(createExportSelection(true)),
    clearAll: () => setSelection(createExportSelection(false)),
    exportImage: () => {
      setIsOpen(false);
      onExport();
    },
  };
}
