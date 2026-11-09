import { useState } from 'react';
import { DEFAULT_CARD_SETTINGS } from '../models/cardSettings';
import { createInitialEquipment } from '../models/equipment';
import type { NoticeData } from '../models/notice';
import { createInitialSlimes } from '../models/slime';
import type { SlotLayoutState } from '../components/grid/layout';
import { ExportService } from '../services/ExportService';
import { createConfigPayload } from '../services/ProfileConfig';
import type { SccProfile } from '../services/ProfilesSchema';
import {
  parseSccObject,
  type IImportedSccData,
  type ImportedModuleLayout,
} from '../services/SccImport';
import { SCC_FILE_TYPE, SCC_VERSION } from '../services/SccSchema';
import {
  createArtifacts,
  createBuffs,
  createRelics,
} from '../services/profileDefaults';
import type { ProfileState } from './useProfileState';

function toSlotLayout(layout: ImportedModuleLayout): SlotLayoutState {
  return {
    rows: layout.rows,
    cols: layout.cols,
    mode: layout.layoutMode,
    autoSize: layout.autoSize,
    hideEnabled: layout.hideEnabled,
    entries: layout.entries,
    hiddenKeys: layout.hiddenKeys,
  };
}

export function applyImportedData(imported: IImportedSccData, state: ProfileState) {
  state.setPlayerName(imported.playerName);
  if (imported.bgColor) state.setBgColor(imported.bgColor);
  if (imported.exportSelection) state.setExportSelection(imported.exportSelection);

  if (imported.relics) {
    state.setRelics(imported.relics.list);
    state.relicLayout.applyLayout(toSlotLayout(imported.relics.layout));
  }

  if (imported.slimes) {
    state.setSlimes(imported.slimes.list);
    state.slimeLayout.applyLayout(toSlotLayout(imported.slimes.layout));
  }

  if (imported.equipment) {
    state.setEquipment(imported.equipment.list);
    state.equipmentLayout.applyLayout(toSlotLayout(imported.equipment.layout));
  }

  if (imported.buffs) {
    state.setBuffs(imported.buffs.list);
    state.buffLayout.applyLayout(toSlotLayout(imported.buffs.layout));
  }

  if (imported.artifacts) {
    state.setArtifacts(imported.artifacts.list);
    state.artifactLayout.applyLayout(toSlotLayout(imported.artifacts.layout));
  }
}

export function applyProfilePayload(
  profile: SccProfile,
  state: ProfileState,
): boolean {
  const imported = parseSccObject({
    fileType: SCC_FILE_TYPE,
    version: SCC_VERSION,
    ...profile,
  });
  if (!imported) return false;

  applyImportedData(imported, state);
  return true;
}

function saveConfig(state: ProfileState) {
  ExportService.exportToScc(createConfigPayload(state));
}

const INVALID_PROFILE_TEXT =
  'Файл повреждён или имеет неподдерживаемый формат.';

function errorNotice(title: string, text: string): NoticeData {
  return { tone: 'error', title, text };
}

function applyConfigContent(
  content: unknown,
  state: ProfileState,
  showNotice: (notice: NoticeData) => void,
): void {
  if (typeof content !== 'string' || !content) {
    showNotice(
      errorNotice('Не удалось прочитать файл', 'Файл пуст или недоступен.'),
    );
    return;
  }

  try {
    const imported = ExportService.importFromScc(content);
    if (!imported) {
      showNotice(
        errorNotice('Не удалось загрузить профиль', INVALID_PROFILE_TEXT),
      );
      return;
    }

    applyImportedData(imported, state);
    showNotice({
      tone: 'success',
      title: 'Профиль загружен',
      text: 'Данные из файла применены к текущему профилю.',
    });
  } catch (error) {
    console.error('Ошибка парсинга файла:', error);
    showNotice(
      errorNotice('Не удалось загрузить профиль', INVALID_PROFILE_TEXT),
    );
  }
}

function readConfigFile(
  event: React.ChangeEvent<HTMLInputElement>,
  state: ProfileState,
  showNotice: (notice: NoticeData) => void,
) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    applyConfigContent(loadEvent.target?.result, state, showNotice);
  };
  reader.onerror = () => {
    showNotice(
      errorNotice('Не удалось прочитать файл', 'Попробуйте выбрать файл ещё раз.'),
    );
  };

  reader.readAsText(file);
}

function resetProfile(state: ProfileState) {
  state.setPlayerName('');
  state.setBgColor(DEFAULT_CARD_SETTINGS.bgColor);
  state.setExportSelection(DEFAULT_CARD_SETTINGS.exportSelection);
  state.relicLayout.resetLayout();
  state.slimeLayout.resetLayout();
  state.equipmentLayout.resetLayout();
  state.buffLayout.resetLayout();
  state.artifactLayout.resetLayout();
  state.setRelics(createRelics());
  state.setSlimes(createInitialSlimes());
  state.setEquipment(createInitialEquipment());
  state.setBuffs(createBuffs());
  state.setArtifacts(createArtifacts());
}

export function useProfileTransfer(state: ProfileState) {
  const [notice, setNotice] = useState<NoticeData | null>(null);

  return {
    exportConfig: () => saveConfig(state),
    importConfigFile: (event: React.ChangeEvent<HTMLInputElement>) =>
      readConfigFile(event, state, setNotice),
    resetProfile: () => resetProfile(state),
    transferNotice: notice,
    clearTransferNotice: () => setNotice(null),
  };
}
