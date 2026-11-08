import {
  calculateSlotEntries,
  type LayoutItem,
  type LayoutMode,
  type SlotEntry,
  type SlotLayoutBase,
} from '../components/grid/layout';
import { DEFAULT_LAYOUTS } from '../components/grid/layoutDefaults';
import {
  ArtifactData,
  ARTIFACT_NAMES,
  type ArtifactState,
} from '../models/artifact';
import { BUFFS, BuffData, type BuffType } from '../models/buff';
import {
  createInitialEquipment,
  type EquipmentData,
  type EquipmentGrade,
} from '../models/equipment';
import {
  normalizeExportSelection,
  type ExportSelection,
} from '../models/exportSelection';
import { RELIC_NAMES, RelicData, type RelicState } from '../models/relic';
import { SlimeData, slimeLists, type SlimeState } from '../models/slime';
import {
  SCC_FILE_TYPE,
  type GridLayoutJson,
  type IArtifactsJsonModule,
  type IBuffsJsonModule,
  type IEquipmentJsonModule,
  type IRelicsJsonModule,
  type ISlimesJsonModule,
  type SlotJson,
} from './SccSchema';

export interface ImportedModuleLayout {
  rows: number;
  cols: number;
  layoutMode: LayoutMode;
  autoSize: boolean;
  hideEnabled: boolean;
  entries: SlotEntry[];
  hiddenKeys: string[];
}

export interface ImportedModule<T> {
  list: T[];
  layout: ImportedModuleLayout;
}

export interface IImportedSccData {
  playerName: string;
  bgColor: string | null;
  exportSelection: ExportSelection | null;
  relics: ImportedModule<RelicData> | null;
  slimes: ImportedModule<SlimeData> | null;
  equipment: ImportedModule<EquipmentData> | null;
  buffs: ImportedModule<BuffData> | null;
  artifacts: ImportedModule<ArtifactData> | null;
}

function buildLayout<T extends LayoutItem>(
  items: T[],
  flags: SlotJson[],
  grid: { rows: number; cols: number } | undefined,
  layoutMode: LayoutMode | undefined,
  settings: GridLayoutJson,
  defaults: SlotLayoutBase,
): ImportedModuleLayout {
  const mode = layoutMode ?? defaults.mode;
  const rows = grid?.rows ?? defaults.rows;
  const cols = grid?.cols ?? defaults.cols;
  const hiddenKeys = items
    .filter((item, index) => flags[index]?.hidden === true)
    .map((item) => item.key);
  const hideEnabled = settings.hideEnabled ?? hiddenKeys.length > 0;
  const autoSize = mode === 'manual' ? false : (settings.autoSize ?? true);

  const entries =
    mode === 'manual'
      ? items.map((_, index) => ({
          index: flags[index]?.slotIndex ?? -1,
          visible: flags[index]?.visible ?? true,
          hidden: false,
        }))
      : calculateSlotEntries(items, mode, [], hiddenKeys, hideEnabled);

  return { rows, cols, layoutMode: mode, autoSize, hideEnabled, entries, hiddenKeys };
}

function importRelics(module: IRelicsJsonModule | null): ImportedModule<RelicData> | null {
  if (!module) return null;

  const list: RelicData[] = [];
  const flags: SlotJson[] = [];

  RELIC_NAMES.forEach((name) => {
    const found = module.relicsList.find((item) => item.name === name);
    list.push(
      found
        ? new RelicData(found.name, found.state as RelicState)
        : new RelicData(name, 'no'),
    );
    flags.push(found ?? {});
  });

  return {
    list,
    layout: buildLayout(
      list,
      flags,
      module.relicsGrid,
      module.layoutMode,
      module,
      DEFAULT_LAYOUTS.relics,
    ),
  };
}

function importSlimes(module: ISlimesJsonModule | null): ImportedModule<SlimeData> | null {
  if (!module) return null;

  const list: SlimeData[] = [];
  const flags: SlotJson[] = [];

  slimeLists.forEach((group) => {
    group.names.forEach((name) => {
      const found = module.slimesList.find((item) => item.name === name);
      list.push(
        found
          ? new SlimeData(found.name, found.state as SlimeState, found.level, found.skin)
          : new SlimeData(name, 'no', 1, 0),
      );
      flags.push(found ?? {});
    });
  });

  return {
    list,
    layout: buildLayout(
      list,
      flags,
      module.slimesGrid,
      module.layoutMode,
      module,
      DEFAULT_LAYOUTS.slimes,
    ),
  };
}

function importEquipment(
  module: IEquipmentJsonModule | null,
): ImportedModule<EquipmentData> | null {
  if (!module) return null;

  const flags: SlotJson[] = [];
  const list = createInitialEquipment().map((defaultItem) => {
    const found = module.equipmentList.find((item) => item.name === defaultItem.name);
    flags.push(found ?? {});
    return found ? defaultItem.clone({ grade: found.grade as EquipmentGrade }) : defaultItem;
  });

  return {
    list,
    layout: buildLayout(
      list,
      flags,
      module.equipmentGrid,
      module.layoutMode,
      module,
      DEFAULT_LAYOUTS.equipment,
    ),
  };
}

function importBuffs(module: IBuffsJsonModule | null): ImportedModule<BuffData> | null {
  if (!module) return null;

  const flags: SlotJson[] = [];
  const list = BUFFS.map((type) => {
    const found = module.buffsList.find((buff) => buff.name === type);
    flags.push(found ?? {});
    return new BuffData(type as BuffType, found?.value ?? 0);
  });

  return {
    list,
    layout: buildLayout(
      list,
      flags,
      module.buffsGrid,
      module.layoutMode,
      module,
      DEFAULT_LAYOUTS.buffs,
    ),
  };
}

function importArtifacts(
  module: IArtifactsJsonModule | null,
): ImportedModule<ArtifactData> | null {
  if (!module) return null;

  const flags: SlotJson[] = [];
  const list = ARTIFACT_NAMES.map((name) => {
    const found = module.artifactsList.find((artifact) => artifact.name === name);
    flags.push(found ?? {});
    return found
      ? new ArtifactData(
          found.name,
          found.state as ArtifactState,
          found.level,
          found.fragments,
        )
      : new ArtifactData(name, 'no', 1, 0);
  });

  return {
    list,
    layout: buildLayout(
      list,
      flags,
      module.artifactsGrid,
      module.layoutMode,
      module,
      DEFAULT_LAYOUTS.artifacts,
    ),
  };
}

export function importScc(fileContent: string): IImportedSccData | null {
  try {
    const parsed = JSON.parse(fileContent);
    if (parsed.fileType !== SCC_FILE_TYPE) return null;

    const modules = parsed.modules ?? {};
    const settings = parsed.settings ?? {};

    return {
      playerName: parsed.playerName ?? '',
      bgColor: typeof settings.bgColor === 'string' ? settings.bgColor : null,
      exportSelection: settings.exportSelection
        ? normalizeExportSelection(settings.exportSelection)
        : null,
      relics: importRelics(modules.relics ?? null),
      slimes: importSlimes(modules.slimes ?? null),
      equipment: importEquipment(modules.equipment ?? null),
      buffs: importBuffs(modules.buffs ?? null),
      artifacts: importArtifacts(modules.artifacts ?? null),
    };
  } catch {
    return null;
  }
}
