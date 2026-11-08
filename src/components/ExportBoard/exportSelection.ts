export type ExportElement =
  | 'header'
  | 'equipment'
  | 'relics'
  | 'slimes'
  | 'buffs'
  | 'artifacts';

export type ExportSelection = Record<ExportElement, boolean>;

export interface ExportOption {
  key: ExportElement;
  label: string;
}

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

export const EXPORT_OPTIONS: ExportOption[] = [
  { key: 'header', label: 'Шапка (ник и общий бонус)' },
  { key: 'equipment', label: 'Снаряжение' },
  { key: 'relics', label: 'Реликвии' },
  { key: 'slimes', label: 'Слаймы' },
  { key: 'buffs', label: 'Перманентные бафы' },
  { key: 'artifacts', label: 'Артефакты' },
];

export const DEFAULT_EXPORT_SELECTION: ExportSelection = {
  header: true,
  equipment: true,
  relics: true,
  slimes: true,
  buffs: true,
  artifacts: true,
};

export function createExportSelection(value: boolean): ExportSelection {
  return {
    header: value,
    equipment: value,
    relics: value,
    slimes: value,
    buffs: value,
    artifacts: value,
  };
}
