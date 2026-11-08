import type { SlotLayoutBase, SlotLayoutState } from '../components/grid/layout';
import { DEFAULT_LAYOUTS } from '../components/grid/layoutDefaults';
import { ArtifactData, ARTIFACT_NAMES } from '../models/artifact';
import { BuffData, BUFFS } from '../models/buff';
import { DEFAULT_CARD_SETTINGS } from '../models/cardSettings';
import { createInitialEquipment } from '../models/equipment';
import { RelicData, RELIC_NAMES } from '../models/relic';
import { createInitialSlimes } from '../models/slime';
import type { SccProfile } from './ProfilesSchema';
import { serializeModules } from './SccSerialization';

export const createRelics = () =>
  RELIC_NAMES.map((name) => new RelicData(name, '0'));

export const createBuffs = () => BUFFS.map((type) => new BuffData(type, 0));

export const createArtifacts = () =>
  ARTIFACT_NAMES.map((name) => new ArtifactData(name, 'no', 1, 0));

function createDefaultLayout(base: SlotLayoutBase): SlotLayoutState {
  return { ...base, hiddenKeys: [], entries: [] };
}

export function createEmptyProfile(): SccProfile {
  const modules = serializeModules({
    relics: createRelics(),
    relicLayout: createDefaultLayout(DEFAULT_LAYOUTS.relics),
    slimes: createInitialSlimes(),
    slimeLayout: createDefaultLayout(DEFAULT_LAYOUTS.slimes),
    equipment: createInitialEquipment(),
    equipmentLayout: createDefaultLayout(DEFAULT_LAYOUTS.equipment),
    buffs: createBuffs(),
    buffLayout: createDefaultLayout(DEFAULT_LAYOUTS.buffs),
    artifacts: createArtifacts(),
    artifactLayout: createDefaultLayout(DEFAULT_LAYOUTS.artifacts),
  });

  return {
    playerName: '',
    settings: {
      bgColor: DEFAULT_CARD_SETTINGS.bgColor,
      exportSelection: { ...DEFAULT_CARD_SETTINGS.exportSelection },
    },
    modules,
  };
}
