import type { LayoutItem, SlotLayoutState } from '../components/grid/layout';
import type { ArtifactData } from '../models/artifact';
import type { BuffData } from '../models/buff';
import type { EquipmentData } from '../models/equipment';
import type { RelicData } from '../models/relic';
import type { SlimeData } from '../models/slime';
import type {
  IBuffsJsonModule,
  IEquipmentJsonModule,
  IRelicsJsonModule,
  ISlimesJsonModule,
  IArtifactsJsonModule,
  SccModules,
  SlotJson,
} from './SccSchema';

export interface ProfileSerializationSource {
  relics: RelicData[];
  relicLayout: SlotLayoutState;
  slimes: SlimeData[];
  slimeLayout: SlotLayoutState;
  equipment: EquipmentData[];
  equipmentLayout: SlotLayoutState;
  buffs: BuffData[];
  buffLayout: SlotLayoutState;
  artifacts: ArtifactData[];
  artifactLayout: SlotLayoutState;
}

function serializeSlots<T extends LayoutItem, J extends object>(
  items: T[],
  layout: SlotLayoutState,
  toJson: (item: T) => J,
): Array<J & SlotJson> {
  const hiddenKeys = new Set(layout.hiddenKeys);

  return items.map((item, index) => {
    const entry = layout.entries[index];
    const slot =
      layout.mode === 'manual'
        ? { slotIndex: entry?.index ?? -1, visible: entry?.visible ?? true }
        : {};

    return {
      ...toJson(item),
      ...slot,
      ...(hiddenKeys.has(item.key) ? { hidden: true } : {}),
    };
  });
}

function serializeLayoutFlags(layout: SlotLayoutState) {
  return { autoSize: layout.autoSize, hideEnabled: layout.hideEnabled };
}

function serializeRelics(state: ProfileSerializationSource): IRelicsJsonModule {
  return {
    relicsGrid: { rows: state.relicLayout.rows, cols: state.relicLayout.cols },
    layoutMode: state.relicLayout.mode,
    ...serializeLayoutFlags(state.relicLayout),
    relicsList: serializeSlots(state.relics, state.relicLayout, (relic) => ({
      name: relic.name,
      state: relic.state,
    })),
  };
}

function serializeSlimes(state: ProfileSerializationSource): ISlimesJsonModule {
  return {
    slimesGrid: { rows: state.slimeLayout.rows, cols: state.slimeLayout.cols },
    layoutMode: state.slimeLayout.mode,
    ...serializeLayoutFlags(state.slimeLayout),
    slimesList: serializeSlots(state.slimes, state.slimeLayout, (slime) => ({
      name: slime.name,
      state: slime.state,
      level: slime.level,
      skin: slime.skin,
    })),
  };
}

function serializeEquipment(state: ProfileSerializationSource): IEquipmentJsonModule {
  return {
    equipmentGrid: { rows: state.equipmentLayout.rows, cols: state.equipmentLayout.cols },
    layoutMode: state.equipmentLayout.mode,
    ...serializeLayoutFlags(state.equipmentLayout),
    equipmentList: serializeSlots(state.equipment, state.equipmentLayout, (item) => ({
      name: item.name,
      grade: item.grade,
    })),
  };
}

function serializeBuffs(state: ProfileSerializationSource): IBuffsJsonModule {
  return {
    buffsGrid: { rows: state.buffLayout.rows, cols: state.buffLayout.cols },
    layoutMode: state.buffLayout.mode,
    ...serializeLayoutFlags(state.buffLayout),
    buffsList: serializeSlots(state.buffs, state.buffLayout, (buff) => ({
      name: buff.type,
      value: buff.value,
    })),
  };
}

function serializeArtifacts(state: ProfileSerializationSource): IArtifactsJsonModule {
  return {
    artifactsGrid: {
      rows: state.artifactLayout.rows,
      cols: state.artifactLayout.cols,
    },
    layoutMode: state.artifactLayout.mode,
    ...serializeLayoutFlags(state.artifactLayout),
    artifactsList: serializeSlots(state.artifacts, state.artifactLayout, (artifact) => ({
      name: artifact.name,
      state: artifact.state,
      level: artifact.level,
      fragments: artifact.fragments,
    })),
  };
}

export function serializeModules(state: ProfileSerializationSource): SccModules {
  return {
    relics: serializeRelics(state),
    slimes: serializeSlimes(state),
    equipment: serializeEquipment(state),
    buffs: serializeBuffs(state),
    artifacts: serializeArtifacts(state),
  };
}
