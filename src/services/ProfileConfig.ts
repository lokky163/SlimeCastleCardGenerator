import { DEFAULT_CARD_SETTINGS } from '../models/cardSettings';
import { isDefaultExportSelection } from '../models/exportSelection';
import { DEFAULT_LAYOUTS } from '../components/grid/layoutDefaults';
import type { SlotLayoutBase, SlotLayoutState } from '../components/grid/layout';
import type { ProfileState } from '../hooks/useProfileState';
import { serializeModules } from './SccSerialization';
import { SCC_FILE_TYPE, SCC_VERSION, type SccPayload } from './SccSchema';

export const PROFILE_STORAGE_KEY = 'slime_card_profile_autosave';

export function createConfigPayload(state: ProfileState): SccPayload {
  return {
    fileType: SCC_FILE_TYPE,
    version: SCC_VERSION,
    playerName: state.playerName.trim(),
    settings: {
      bgColor: state.bgColor,
      exportSelection: state.exportSelection,
    },
    modules: serializeModules(state),
  };
}

function isDefaultLayout(layout: SlotLayoutState, defaults: SlotLayoutBase): boolean {
  if (
    layout.mode !== defaults.mode ||
    layout.autoSize !== defaults.autoSize ||
    layout.hideEnabled !== defaults.hideEnabled ||
    layout.hiddenKeys.length > 0
  ) {
    return false;
  }

  if (layout.autoSize) return true;
  return layout.rows === defaults.rows && layout.cols === defaults.cols;
}

export function isPristineProfile(state: ProfileState): boolean {
  return (
    !state.playerName &&
    state.bgColor === DEFAULT_CARD_SETTINGS.bgColor &&
    isDefaultExportSelection(state.exportSelection) &&
    state.relics.every((relic) => relic.state === '0') &&
    state.slimes.every(
      (slime) => slime.state === '0' && slime.level === 250 && slime.skin === 0,
    ) &&
    state.equipment.every((item) => item.grade === 'no') &&
    state.buffs.every((buff) => buff.value === 0) &&
    state.artifacts.every(
      (item) => item.state === 'no' && item.level === 1 && item.fragments === 0,
    ) &&
    isDefaultLayout(state.relicLayout, DEFAULT_LAYOUTS.relics) &&
    isDefaultLayout(state.slimeLayout, DEFAULT_LAYOUTS.slimes) &&
    isDefaultLayout(state.equipmentLayout, DEFAULT_LAYOUTS.equipment) &&
    isDefaultLayout(state.buffLayout, DEFAULT_LAYOUTS.buffs) &&
    isDefaultLayout(state.artifactLayout, DEFAULT_LAYOUTS.artifacts)
  );
}
