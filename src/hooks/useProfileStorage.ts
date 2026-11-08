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
  const { playerName, relics, relicLayout, slimes, slimeLayout, equipment, buffs, artifacts } = state;

  useEffect(() => {
    if (isPristineProfile(state)) return;

    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(createConfigPayload(state)));
    } catch (error) {
      console.error(error);
    }
  }, [
    playerName,
    relics,
    relicLayout.entries,
    relicLayout.rows,
    relicLayout.cols,
    relicLayout.mode,
    slimes,
    slimeLayout.entries,
    slimeLayout.rows,
    slimeLayout.cols,
    slimeLayout.mode,
    equipment,
    buffs,
    artifacts,
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
