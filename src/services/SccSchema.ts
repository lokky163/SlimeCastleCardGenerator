import type { LayoutMode } from '../components/grid/layout';
import type { CardSettings } from '../models/cardSettings';

export const SCC_FILE_TYPE = 'slime-card-config';
export const SCC_VERSION = '1.1.0';

export const SCC_MODULES = [
  'relics',
  'slimes',
  'equipment',
  'buffs',
  'artifacts',
] as const;

export type SccModuleKey = (typeof SCC_MODULES)[number];

export interface SlotJson {
  slotIndex?: number;
  visible?: boolean;
  hidden?: boolean;
}

export interface IRelicsJsonModule {
  relicsGrid: { rows: number; cols: number };
  layoutMode: LayoutMode;
  relicsList: Array<{ name: string; state: string } & SlotJson>;
}

export interface ISlimesJsonModule {
  slimesGrid: { rows: number; cols: number };
  layoutMode: LayoutMode;
  slimesList: Array<{
    name: string;
    state: string;
    level: number;
    skin: number;
  } & SlotJson>;
}

export interface IEquipmentJsonModule {
  equipmentGrid: { rows: number; cols: number };
  layoutMode: LayoutMode;
  equipmentList: Array<{ name: string; grade: string } & SlotJson>;
}

export interface IBuffsJsonModule {
  buffsGrid: { rows: number; cols: number };
  layoutMode: LayoutMode;
  buffsList: Array<{ name: string; value: number } & SlotJson>;
}

export interface IArtifactsJsonModule {
  artifactsGrid: { rows: number; cols: number };
  layoutMode: LayoutMode;
  artifactsList: Array<{
    name: string;
    state: string;
    level: number;
    fragments: number;
  } & SlotJson>;
}

export interface SccModules {
  relics: IRelicsJsonModule | null;
  slimes: ISlimesJsonModule | null;
  equipment: IEquipmentJsonModule | null;
  buffs: IBuffsJsonModule | null;
  artifacts: IArtifactsJsonModule | null;
}

export type SccSettings = CardSettings;

export interface SccPayload {
  fileType: typeof SCC_FILE_TYPE;
  version: string;
  exportDate?: string;
  playerName: string;
  exportedModules?: SccModuleKey[];
  settings: SccSettings;
  modules: SccModules;
}
