import { toPng } from 'html-to-image';
import { RelicData, type RelicState, RELIC_NAMES } from '../models/relic';
import { SlimeData, type SlimeState, slimeLists } from '../models/slime';
import {
  EquipmentData,
  type EquipmentGrade,
  type EquipmentSet,
  type EquipmentType,
} from '../models/equipment';
import { BuffData, type BuffType, BUFFS } from '../models/buff';
import { type LayoutMode, type SlotEntry } from '../components/grid/layout';
import { ArtifactData, type ArtifactState, ARTIFACT_NAMES } from '../models/artifact';

export interface IRelicsJsonModule {
  relicsGrid: { rows: number; cols: number };
  layoutMode: LayoutMode;
  relicsList: Array<{
    name: string;
    state: string;
    slotIndex?: number;
    visible?: boolean;
  }>;
}

export interface ISlimesJsonModule {
  slimesGrid: { rows: number; cols: number };
  layoutMode: LayoutMode;
  slimesList: Array<{
    name: string;
    state: string;
    level: number;
    skin: number;
    slotIndex?: number;
    visible?: boolean;
  }>;
}

// ╨¥╨╛╨▓╨░╤Å ╤ü╤é╤Ç╤â╨║╤é╤â╤Ç╨░ JSON-╨╝╨╛╨┤╤â╨╗╤Å ╨í╨╜╨░╤Ç╤Å╨╢╨╡╨╜╨╕╤Å
export interface IEquipmentJsonModule {
  equipmentList: Array<{
    name: string;
    grade: string;
  }>;
}

export interface IBuffsJsonModule {
  buffsList: Array<{ name: string; value: number }>;
}

export interface IArtifactsJsonModule {
  artifactsList: Array<{ 
    name: string; 
    state: string; 
    level: number; 
    fragments: number 
  }>;
}

export interface IImportedSccData {
  playerName: string;
  relics: { rows: number; cols: number; layoutMode: LayoutMode; relicsList: RelicData[]; entries: SlotEntry[] } | null;
  slimes: { rows: number; cols: number; layoutMode: LayoutMode; slimesList: SlimeData[]; entries: SlotEntry[] } | null;
  equipment: EquipmentData[] | null; // ╨Æ╨╛╨╖╨▓╤Ç╨░╤ë╨░╨╡╨╝ ╨┐╨╗╨╛╤ü╨║╨╕╨╣ ╨╝╨░╤ü╤ü╨╕╨▓ ╤ü╨╜╨░╤Ç╤Å╨╢╨╡╨╜╨╕╤Å
  buffs: BuffData[] | null; // ╨Æ╨╛╨╖╨▓╤Ç╨░╤ë╨░╨╡╨╝ ╨┐╨╗╨╛╤ü╨║╨╕╨╣ ╨┐╤Ç╨╛╨▓╨╡╤Ç╨╡╨╜╨╜╤ï╨╣ ╨╝╨░╤ü╤ü╨╕╨▓ ╨▒╨░╤ä╤ä╨╛╨▓
  artifacts: ArtifactData[] | null; // ╨¥╨╛╨▓╤ï╨╣ ╨╝╨░╤ü╤ü╨╕╨▓ ╨▓ ╤ü╤é╤Ç╤â╨║╤é╤â╤Ç╨╡ ╨╕╨╝╨┐╨╛╤Ç╤é╨░
}

function packSlot(entry: SlotEntry | undefined, layoutMode: LayoutMode) {
  if (layoutMode !== 'manual') return {};

  return {
    slotIndex: entry?.index ?? -1,
    visible: entry?.visible ?? true,
  };
}

function unpackSlot(slotIndex: number | undefined, visible: boolean | undefined): SlotEntry {
  return {
    index: slotIndex ?? -1,
    visible: visible ?? true,
    hidden: false,
  };
}

function resolveEntry(
  layoutMode: LayoutMode,
  item: { slotIndex?: number; visible?: boolean } | undefined,
  autoIndex: number,
): SlotEntry {
  if (layoutMode !== 'manual') return { index: autoIndex, visible: true, hidden: false };
  return item
    ? unpackSlot(item.slotIndex, item.visible)
    : { index: -1, visible: true, hidden: false };
}

function importRelics(module: IRelicsJsonModule | null): IImportedSccData['relics'] {
  if (!module) return null;

  const { rows, cols } = module.relicsGrid;
  const layoutMode = module.layoutMode ?? 'default';
  const relicsList: RelicData[] = [];
  const entries: SlotEntry[] = [];

  RELIC_NAMES.forEach((defaultName, index) => {
    const found = module.relicsList.find((item) => item.name === defaultName);
    relicsList.push(
      found
        ? new RelicData(found.name, found.state as RelicState)
        : new RelicData(defaultName, 'no'),
    );
    entries.push(resolveEntry(layoutMode, found, index));
  });

  return { rows, cols, layoutMode, relicsList, entries };
}

function importSlimes(module: ISlimesJsonModule | null): IImportedSccData['slimes'] {
  if (!module) return null;

  const { rows, cols } = module.slimesGrid;
  const layoutMode = module.layoutMode ?? 'default';
  const slimesList: SlimeData[] = [];
  const entries: SlotEntry[] = [];
  let autoIndex = 0;

  slimeLists.forEach((list) => {
    list.names.forEach((defaultName) => {
      const found = module.slimesList.find((item) => item.name === defaultName);
      slimesList.push(
        found
          ? new SlimeData(found.name, found.state as SlimeState, found.level, found.skin)
          : new SlimeData(defaultName, 'no', 1, 0),
      );
      entries.push(resolveEntry(layoutMode, found, autoIndex));
      autoIndex += 1;
    });
  });

  return { rows, cols, layoutMode, slimesList, entries };
}

function detectEquipmentType(name: string): EquipmentType {
  const normalized = name.toLowerCase();
  if (normalized.includes('helmet')) return 'helmet';
  if (normalized.includes('chestplate')) return 'chestplate';
  if (normalized.includes('ring')) return 'ring';
  return 'sword';
}

function detectEquipmentSet(name: string): EquipmentSet {
  return name.toLowerCase().includes('astral') ? 'astral' : 'egida';
}

function importEquipment(module: IEquipmentJsonModule | null): EquipmentData[] | null {
  if (!module) return null;

  return module.equipmentList.map(
    (item) =>
      new EquipmentData(
        item.name,
        detectEquipmentType(item.name),
        detectEquipmentSet(item.name),
        item.grade as EquipmentGrade,
      ),
  );
}

function importBuffs(module: IBuffsJsonModule | null): BuffData[] | null {
  if (!module) return null;

  return BUFFS.map((type) => {
    const found = module.buffsList.find((buff) => buff.name === type);
    return new BuffData(type as BuffType, found?.value ?? 0);
  });
}

function importArtifacts(module: IArtifactsJsonModule | null): ArtifactData[] | null {
  if (!module) return null;

  return ARTIFACT_NAMES.map((defaultName) => {
    const found = module.artifactsList.find((artifact) => artifact.name === defaultName);
    return found
      ? new ArtifactData(found.name, found.state as ArtifactState, found.level, found.fragments)
      : new ArtifactData(defaultName, 'no', 1, 0);
  });
}

export class ExportService {
  
  static serializeRelics(allRelics: RelicData[], entries: SlotEntry[], rows: number, cols: number, layoutMode: LayoutMode): IRelicsJsonModule {
    const relicsList = allRelics.map((relic, idx) => ({
      name: relic.name,
      state: relic.state,
      ...packSlot(entries[idx], layoutMode),
    }));
    return { relicsGrid: { rows, cols }, layoutMode, relicsList };
  }

  static serializeSlimes(allSlimes: SlimeData[], entries: SlotEntry[], rows: number, cols: number, layoutMode: LayoutMode): ISlimesJsonModule {
    const slimesList = allSlimes.map((slime, idx) => ({
      name: slime.name,
      state: slime.state,
      level: slime.level,
      skin: slime.skin,
      ...packSlot(entries[idx], layoutMode),
    }));
    return { slimesGrid: { rows, cols }, layoutMode, slimesList };
  }
  
  static serializeEquipment(allEquipment: EquipmentData[]): IEquipmentJsonModule {
    return {
      equipmentList: allEquipment.map(item => ({
        name: item.name,
        grade: item.grade
      }))
    };
  }

  static serializeBuffs(allBuffs: BuffData[]): IBuffsJsonModule {
    return { buffsList: allBuffs.map(b => ({ name: b.type, value: b.value })) };
  }

  static serializeArtifacts(allArtifacts: ArtifactData[]): IArtifactsJsonModule {
    return {
      artifactsList: allArtifacts.map(art => ({
        name: art.name, state: art.state, level: art.level, fragments: art.fragments
      }))
    };
  }

  static curFormattedDate() {
    const now = new Date();
    
    // ╨ñ╤â╨╜╨║╤å╨╕╤Å ╨┤╨╗╤Å ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╨╕╤Å ╨▓╨╡╨┤╤â╤ë╨╡╨│╨╛ ╨╜╤â╨╗╤Å (╨╜╨░╨┐╤Ç╨╕╨╝╨╡╤Ç: 9 -> "09")
    const pad = (num: number) => String(num).padStart(2, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1); // ╨£╨╡╤ü╤Å╤å╤ï ╨╜╨░╤ç╨╕╨╜╨░╤Ä╤é╤ü╤Å ╤ü 0
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    // ╨ñ╨╛╤Ç╨╝╨░╤é: "19_15-18.07.2026" ΓÇö ╨┐╨╛╨╗╨╜╨╛╤ü╤é╤î╤Ä ╨▒╨╡╨╖╨╛╨┐╨░╤ü╨╡╨╜ ╨┤╨╗╤Å ╤ä╨░╨╣╨╗╨╛╨▓╤ï╤à ╤ü╨╕╤ü╤é╨╡╨╝
    return `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;
  }
    
static exportToScc(
    playerName: string,
    activeModules: ('relics' | 'slimes' | 'equipment' | 'buffs' | 'artifacts')[],
    relicsData: IRelicsJsonModule | null,
    slimesData: ISlimesJsonModule | null,
    equipmentData: IEquipmentJsonModule | null,
    buffsData: IBuffsJsonModule | null,
    artifactsData: IArtifactsJsonModule | null
  ): void {
    const sccPayload = {
      fileType: "slime-card-config",
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      playerName: playerName.trim(),
      exportedModules: activeModules,
      modules: {
        relics: activeModules.includes('relics') ? relicsData : null,
        slimes: activeModules.includes('slimes') ? slimesData : null,
        equipment: activeModules.includes('equipment') ? equipmentData : null,
        buffs: activeModules.includes('buffs') ? buffsData : null,
        artifacts: activeModules.includes('artifacts') ? artifactsData : null
      }
    };

    const jsonString = JSON.stringify(sccPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${playerName.trim()}-${ExportService.curFormattedDate()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  static importFromScc(fileContent: string): IImportedSccData | null {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.fileType !== 'slime-card-config') return null;

      const modules = parsed.modules ?? {};
      return {
        playerName: parsed.playerName ?? '',
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

  static async exportToPng(element: HTMLDivElement | null): Promise<string | null> {
    if (!element) return null;
    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 1, // 2 ╤ü╨┤╨╡╨╗╨░╨╡╤é ╨║╨░╤Ç╤é╨╕╨╜╨║╤â ╤ç╨╡╤é╨║╨╛╨╣ ╨╜╨░ Retina-╤ì╨║╤Ç╨░╨╜╨░╤à ╨░╨╣╤ä╨╛╨╜╨╛╨▓
        style: { left: '0', top: '0', transform: 'translate(0, 0)' }
      });
      
      return dataUrl; // ╨Æ╨╛╨╖╨▓╤Ç╨░╤ë╨░╨╡╨╝ dataUrl (base64) ╨┤╨╗╤Å ╨╛╤é╨╛╨▒╤Ç╨░╨╢╨╡╨╜╨╕╤Å ╨▓ React
    } catch (error) {
      console.error('╨₧╤ê╨╕╨▒╨║╨░ ╨┐╤Ç╨╕ ╨│╨╡╨╜╨╡╤Ç╨░╤å╨╕╨╕ PNG:', error);
      return null;
    }
  }
}
