import { type IImportedSccData, ExportService } from '../services/ExportService';
import { createConfigPayload, PROFILE_STORAGE_KEY } from '../services/ProfileConfig';
import { createInitialEquipment } from '../models/equipment';
import { createInitialSlimes } from '../models/slime';
import {
  createArtifacts,
  createBuffs,
  createRelics,
  type ProfileState,
} from './useProfileState';

export function applyImportedData(imported: IImportedSccData, state: ProfileState) {
  state.setPlayerName(imported.playerName);

  if (imported.relics) {
    const { rows, cols, layoutMode, relicsList, entries } = imported.relics;
    state.setRelics(relicsList);
    state.relicLayout.applyLayout({ rows, cols, mode: layoutMode, entries });
  }

  if (imported.slimes) {
    const { rows, cols, layoutMode, slimesList, entries } = imported.slimes;
    state.setSlimes(slimesList);
    state.slimeLayout.applyLayout({ rows, cols, mode: layoutMode, entries });
  }

  if (imported.equipment) {
    const savedItems = imported.equipment;
    const defaults = createInitialEquipment();
    state.setEquipment(
      defaults.map((defaultItem) => {
        const saved = savedItems.find((item) => item.name === defaultItem.name);
        return saved ? defaultItem.clone({ grade: saved.grade }) : defaultItem;
      }),
    );
  }

  if (imported.buffs) state.setBuffs(imported.buffs);
  if (imported.artifacts) state.setArtifacts(imported.artifacts);
}

function saveConfig(state: ProfileState) {
  const { modules } = createConfigPayload(state);

  ExportService.exportToScc(
    state.playerName,
    ['relics', 'slimes', 'equipment', 'buffs', 'artifacts'],
    modules.relics,
    modules.slimes,
    modules.equipment,
    modules.buffs,
    modules.artifacts,
  );
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
  state.relicLayout.resetLayout();
  state.slimeLayout.resetLayout();
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
