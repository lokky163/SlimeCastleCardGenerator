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
import { SCC_FILE_TYPE, type SlotJson } from './SccSchema';

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

interface NormalizedModule {
  grid: { rows: number; cols: number };
  layoutMode: LayoutMode;
  list: Array<Record<string, unknown>>;
  autoSize?: boolean;
  hideEnabled?: boolean;
}

const LAYOUT_MODE_VALUES: LayoutMode[] = ['default', 'to-end', 'hidden', 'manual'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function readGrid(value: unknown): { rows: number; cols: number } | null {
  const { rows, cols } = asRecord(value);
  if (typeof rows !== 'number' || rows < 1) return null;
  if (typeof cols !== 'number' || cols < 1) return null;
  return { rows, cols };
}

function readLayoutMode(value: unknown, fallback: LayoutMode): LayoutMode {
  return LAYOUT_MODE_VALUES.includes(value as LayoutMode)
    ? (value as LayoutMode)
    : fallback;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

// Схемы 1.0.0 не содержат settings, части grid/layoutMode и autoSize/hideEnabled.
// Недостающие поля заменяются дефолтами, поэтому старые файлы читаются,
// а при следующем сохранении записываются уже в формате текущей версии.
function normalizeModule(
  value: unknown,
  gridKey: string,
  listKey: string,
  defaults: SlotLayoutBase,
): NormalizedModule | null {
  if (!isRecord(value)) return null;

  const rawList = value[listKey];
  return {
    grid: readGrid(value[gridKey]) ?? { rows: defaults.rows, cols: defaults.cols },
    layoutMode: readLayoutMode(value.layoutMode, defaults.mode),
    list: Array.isArray(rawList) ? rawList.filter(isRecord) : [],
    autoSize: typeof value.autoSize === 'boolean' ? value.autoSize : undefined,
    hideEnabled:
      typeof value.hideEnabled === 'boolean' ? value.hideEnabled : undefined,
  };
}

function toSlotJson(item: Record<string, unknown> | undefined): SlotJson {
  if (!item) return {};
  return {
    slotIndex: typeof item.slotIndex === 'number' ? item.slotIndex : undefined,
    visible: typeof item.visible === 'boolean' ? item.visible : undefined,
    hidden: item.hidden === true ? true : undefined,
  };
}

function buildLayout<T extends LayoutItem>(
  items: T[],
  flags: SlotJson[],
  module: NormalizedModule,
): ImportedModuleLayout {
  const { rows, cols } = module.grid;
  const mode = module.layoutMode;
  const hiddenKeys = items
    .filter((item, index) => flags[index]?.hidden === true)
    .map((item) => item.key);
  const hideEnabled = module.hideEnabled ?? hiddenKeys.length > 0;
  const autoSize = mode === 'manual' ? false : (module.autoSize ?? true);

  const entries =
    mode === 'manual'
      ? items.map((item, index) => ({
          index: flags[index]?.slotIndex ?? -1,
          visible: flags[index]?.visible ?? true,
          hidden: hideEnabled && hiddenKeys.includes(item.key),
        }))
      : calculateSlotEntries(items, mode, [], hiddenKeys, hideEnabled);

  return { rows, cols, layoutMode: mode, autoSize, hideEnabled, entries, hiddenKeys };
}

function importRelics(module: NormalizedModule | null): ImportedModule<RelicData> | null {
  if (!module) return null;

  const list: RelicData[] = [];
  const flags: SlotJson[] = [];

  RELIC_NAMES.forEach((name) => {
    const found = module.list.find((item) => item.name === name);
    list.push(new RelicData(name, readString(found?.state, 'no') as RelicState));
    flags.push(toSlotJson(found));
  });

  return { list, layout: buildLayout(list, flags, module) };
}

function importSlimes(module: NormalizedModule | null): ImportedModule<SlimeData> | null {
  if (!module) return null;

  const list: SlimeData[] = [];
  const flags: SlotJson[] = [];

  slimeLists.forEach((group) => {
    group.names.forEach((name) => {
      const found = module.list.find((item) => item.name === name);
      list.push(
        new SlimeData(
          name,
          readString(found?.state, 'no') as SlimeState,
          readNumber(found?.level, 1),
          readNumber(found?.skin, 0),
        ),
      );
      flags.push(toSlotJson(found));
    });
  });

  return { list, layout: buildLayout(list, flags, module) };
}

function importEquipment(
  module: NormalizedModule | null,
): ImportedModule<EquipmentData> | null {
  if (!module) return null;

  const flags: SlotJson[] = [];
  const list = createInitialEquipment().map((defaultItem) => {
    const found = module.list.find((item) => item.name === defaultItem.name);
    flags.push(toSlotJson(found));
    return found
      ? defaultItem.clone({ grade: readString(found.grade, 'no') as EquipmentGrade })
      : defaultItem;
  });

  return { list, layout: buildLayout(list, flags, module) };
}

function importBuffs(module: NormalizedModule | null): ImportedModule<BuffData> | null {
  if (!module) return null;

  const flags: SlotJson[] = [];
  const list = BUFFS.map((type) => {
    const found = module.list.find((buff) => buff.name === type);
    flags.push(toSlotJson(found));
    return new BuffData(type as BuffType, readNumber(found?.value, 0));
  });

  return { list, layout: buildLayout(list, flags, module) };
}

function importArtifacts(
  module: NormalizedModule | null,
): ImportedModule<ArtifactData> | null {
  if (!module) return null;

  const flags: SlotJson[] = [];
  const list = ARTIFACT_NAMES.map((name) => {
    const found = module.list.find((artifact) => artifact.name === name);
    flags.push(toSlotJson(found));
    return new ArtifactData(
      name,
      readString(found?.state, 'no') as ArtifactState,
      readNumber(found?.level, 1),
      readNumber(found?.fragments, 0),
    );
  });

  return { list, layout: buildLayout(list, flags, module) };
}

export function importScc(fileContent: string): IImportedSccData | null {
  try {
    const parsed = JSON.parse(fileContent);
    if (!isRecord(parsed) || parsed.fileType !== SCC_FILE_TYPE) return null;

    const modules = asRecord(parsed.modules);
    const settings = asRecord(parsed.settings);

    return {
      playerName: readString(parsed.playerName, ''),
      bgColor: typeof settings.bgColor === 'string' ? settings.bgColor : null,
      exportSelection: isRecord(settings.exportSelection)
        ? normalizeExportSelection(settings.exportSelection as Partial<ExportSelection>)
        : null,
      relics: importRelics(
        normalizeModule(modules.relics, 'relicsGrid', 'relicsList', DEFAULT_LAYOUTS.relics),
      ),
      slimes: importSlimes(
        normalizeModule(modules.slimes, 'slimesGrid', 'slimesList', DEFAULT_LAYOUTS.slimes),
      ),
      equipment: importEquipment(
        normalizeModule(
          modules.equipment,
          'equipmentGrid',
          'equipmentList',
          DEFAULT_LAYOUTS.equipment,
        ),
      ),
      buffs: importBuffs(
        normalizeModule(modules.buffs, 'buffsGrid', 'buffsList', DEFAULT_LAYOUTS.buffs),
      ),
      artifacts: importArtifacts(
        normalizeModule(
          modules.artifacts,
          'artifactsGrid',
          'artifactsList',
          DEFAULT_LAYOUTS.artifacts,
        ),
      ),
    };
  } catch {
    return null;
  }
}
