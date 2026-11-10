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

export const EXPORT_OPTIONS: ExportOption[] = [
  { key: 'header', label: 'Header (name and total bonus)' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'relics', label: 'Relics' },
  { key: 'slimes', label: 'Slimes' },
  { key: 'buffs', label: 'Permanent buffs' },
  { key: 'artifacts', label: 'Artifacts' },
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

export function normalizeExportSelection(
  value: Partial<ExportSelection> | null | undefined,
): ExportSelection {
  return {
    ...DEFAULT_EXPORT_SELECTION,
    ...(value ?? {}),
  };
}

export function isDefaultExportSelection(selection: ExportSelection): boolean {
  return (Object.keys(DEFAULT_EXPORT_SELECTION) as ExportElement[]).every(
    (key) => selection[key] === DEFAULT_EXPORT_SELECTION[key],
  );
}
