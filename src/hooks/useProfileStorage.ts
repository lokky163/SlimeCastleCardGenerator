import { useEffect } from 'react';
import { ExportService } from '../services/ExportService';
import {
  createConfigPayload,
  isPristineProfile,
  PROFILE_STORAGE_KEY,
} from '../services/ProfileConfig';
import { applyImportedData } from './useProfileTransfer';
import type { ProfileState } from './useProfileState';

function useProfileAutosave(state: ProfileState) {
  const {
    playerName, bgColor, exportSelection,
    relics, relicLayout, slimes, slimeLayout,
    equipment, equipmentLayout, buffs, buffLayout,
    artifacts, artifactLayout,
  } = state;

  useEffect(() => {
    if (isPristineProfile(state)) return;

    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(createConfigPayload(state)));
    } catch (error) {
      console.error(error);
    }
  }, [
    playerName, bgColor, exportSelection,
    relics, relicLayout.entries, relicLayout.hiddenKeys,
    relicLayout.rows, relicLayout.cols, relicLayout.mode,
    relicLayout.autoSize, relicLayout.hideEnabled,
    slimes, slimeLayout.entries, slimeLayout.hiddenKeys,
    slimeLayout.rows, slimeLayout.cols, slimeLayout.mode,
    slimeLayout.autoSize, slimeLayout.hideEnabled,
    equipment, equipmentLayout.entries, equipmentLayout.hiddenKeys,
    equipmentLayout.rows, equipmentLayout.cols, equipmentLayout.mode,
    equipmentLayout.autoSize, equipmentLayout.hideEnabled,
    buffs, buffLayout.entries, buffLayout.hiddenKeys,
    buffLayout.rows, buffLayout.cols, buffLayout.mode,
    buffLayout.autoSize, buffLayout.hideEnabled,
    artifacts, artifactLayout.entries, artifactLayout.hiddenKeys,
    artifactLayout.rows, artifactLayout.cols, artifactLayout.mode,
    artifactLayout.autoSize, artifactLayout.hideEnabled,
  ]);
}

function useProfileAutoload(state: ProfileState) {
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!saved) return;

      const imported = ExportService.importFromScc(saved);
      if (imported) applyImportedData(imported, state);
    } catch (error) {
      console.error('Не удалось прочитать автосохранение:', error);
    }
  }, []);
}

export function useProfileStorage(state: ProfileState) {
  useProfileAutosave(state);
  useProfileAutoload(state);
}
