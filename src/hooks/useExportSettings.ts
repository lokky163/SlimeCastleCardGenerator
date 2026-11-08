import { useState } from 'react';
import {
  DEFAULT_EXPORT_SELECTION,
  createExportSelection,
  type ExportElement,
  type ExportSelection,
  type ExportSettings,
} from '../components/ExportBoard/exportSelection';

export function useExportSettings(onExport: () => void): ExportSettings {
  const [selection, setSelection] = useState<ExportSelection>(DEFAULT_EXPORT_SELECTION);
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
    selectAll: () => setSelection(DEFAULT_EXPORT_SELECTION),
    clearAll: () => setSelection(createExportSelection(false)),
    exportImage: () => {
      setIsOpen(false);
      onExport();
    },
  };
}
