import { DEFAULT_EXPORT_SELECTION, type ExportSelection } from './exportSelection';

export const DEFAULT_BG_COLOR = '#9A6E3F';

export interface CardSettings {
  bgColor: string;
  exportSelection: ExportSelection;
}

export const DEFAULT_CARD_SETTINGS: CardSettings = {
  bgColor: DEFAULT_BG_COLOR,
  exportSelection: DEFAULT_EXPORT_SELECTION,
};
