import { ExportService } from './ExportService';
import type { ProfileState } from '../hooks/useProfileState';

export const PROFILE_STORAGE_KEY = 'slime_card_profile_autosave';

export function serializeModules(state: ProfileState) {
  const { relics, relicLayout, slimes, slimeLayout, equipment, buffs, artifacts } = state;

  return {
    relics: ExportService.serializeRelics(
      relics,
      relicLayout.entries,
      relicLayout.rows,
      relicLayout.cols,
      relicLayout.mode,
    ),
    slimes: ExportService.serializeSlimes(
      slimes,
      slimeLayout.entries,
      slimeLayout.rows,
      slimeLayout.cols,
      slimeLayout.mode,
    ),
    equipment: ExportService.serializeEquipment(equipment),
    buffs: ExportService.serializeBuffs(buffs),
    artifacts: ExportService.serializeArtifacts(artifacts),
  };
}

export function createConfigPayload(state: ProfileState) {
  return {
    fileType: 'slime-card-config',
    version: '1.0.0',
    playerName: state.playerName.trim(),
    modules: serializeModules(state),
  };
}

export function isPristineProfile(state: ProfileState): boolean {
  return (
    !state.playerName &&
    state.relics.every((relic) => relic.state === '0') &&
    state.slimes.every((slime) => slime.state === '0') &&
    state.buffs.every((buff) => buff.value === 0)
  );
}
