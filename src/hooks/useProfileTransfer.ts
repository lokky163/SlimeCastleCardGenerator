import { DEFAULT_CARD_SETTINGS } from '../models/cardSettings';
import { createInitialEquipment } from '../models/equipment';
import { createInitialSlimes } from '../models/slime';
import type { SlotLayoutState } from '../components/grid/layout';
import { ExportService } from '../services/ExportService';
import { createConfigPayload, PROFILE_STORAGE_KEY } from '../services/ProfileConfig';
import {
  type IImportedSccData,
  type ImportedModuleLayout,
} from '../services/SccImport';
import {
  createArtifacts,
  createBuffs,
  createRelics,
  type ProfileState,
} from './useProfileState';

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

function saveConfig(state: ProfileState) {
  ExportService.exportToScc(createConfigPayload(state));
}

function readConfigFile(
  event: React.ChangeEvent<HTMLInputElement>,
  state: ProfileState,
) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const content = loadEvent.target?.result as string;
    if (!content) return;

    try {
      const imported = ExportService.importFromScc(content);
      if (imported) {
        applyImportedData(imported, state);
      } else {
        alert('Ошибка при чтении файла');
      }
    } catch (error) {
      console.error('Ошибка парсинга файла:', error);
      alert('Ошибка при чтении файла');
    }
  };

  reader.readAsText(file);
}

function resetProfile(state: ProfileState) {
  const confirmReset = window.confirm(
    "Вы уверены, что хотите полностью сбросить все введённые значения? Если нет, то рекомендуется сначала 'Сохранить схему'",
  );
  if (!confirmReset) return;

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
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}

export function useProfileTransfer(state: ProfileState) {
  return {
    exportConfig: () => saveConfig(state),
    importConfigFile: (event: React.ChangeEvent<HTMLInputElement>) =>
      readConfigFile(event, state),
    resetProfile: () => resetProfile(state),
  };
}
