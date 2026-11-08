import { useState } from 'react';
import { createInitialSlimes } from '../models/slime';
import { createInitialEquipment } from '../models/equipment';
import { DEFAULT_CARD_SETTINGS } from '../models/cardSettings';
import type { ExportSelection } from '../models/exportSelection';
import type { LayoutItem, SlotLayoutBase } from '../components/grid/layout';
import { DEFAULT_LAYOUTS, MAX_AUTO_COLS } from '../components/grid/layoutDefaults';
import { useSlotLayout } from '../components/grid/useSlotLayout';
import { createArtifacts, createBuffs, createRelics } from '../services/profileDefaults';
import { useSlimeActions } from './useSlimeActions';

function useCardModule<T extends LayoutItem>(
  createItems: () => T[],
  defaults: SlotLayoutBase,
  maxCols: number,
) {
  const [items, setItems] = useState<T[]>(createItems);
  const layout = useSlotLayout(items, defaults, maxCols);
  return { items, setItems, layout };
}

function useCardModules() {
  const relics = useCardModule(createRelics, DEFAULT_LAYOUTS.relics, MAX_AUTO_COLS.relics);
  const slimes = useCardModule(
    createInitialSlimes,
    DEFAULT_LAYOUTS.slimes,
    MAX_AUTO_COLS.slimes,
  );
  const equipment = useCardModule(
    createInitialEquipment,
    DEFAULT_LAYOUTS.equipment,
    MAX_AUTO_COLS.equipment,
  );
  const buffs = useCardModule(createBuffs, DEFAULT_LAYOUTS.buffs, MAX_AUTO_COLS.buffs);
  const artifacts = useCardModule(
    createArtifacts,
    DEFAULT_LAYOUTS.artifacts,
    MAX_AUTO_COLS.artifacts,
  );
  const slimeActions = useSlimeActions(slimes.setItems);

  const totalSlimeBonus = slimes.items.reduce(
    (sum, slime) => sum + slime.calculateBonus(),
    0,
  );

  return {
    relics: relics.items,
    setRelics: relics.setItems,
    relicLayout: relics.layout,
    slimes: slimes.items,
    setSlimes: slimes.setItems,
    slimeLayout: slimes.layout,
    equipment: equipment.items,
    setEquipment: equipment.setItems,
    equipmentLayout: equipment.layout,
    buffs: buffs.items,
    setBuffs: buffs.setItems,
    buffLayout: buffs.layout,
    artifacts: artifacts.items,
    setArtifacts: artifacts.setItems,
    artifactLayout: artifacts.layout,
    totalSlimeBonus,
    ...slimeActions,
  };
}

export function useProfileState() {
  const [playerName, setPlayerName] = useState('');
  const [bgColor, setBgColor] = useState(DEFAULT_CARD_SETTINGS.bgColor);
  const [exportSelection, setExportSelection] =
    useState<ExportSelection>(DEFAULT_CARD_SETTINGS.exportSelection);
  const modules = useCardModules();

  return {
    playerName,
    setPlayerName,
    bgColor,
    setBgColor,
    exportSelection,
    setExportSelection,
    ...modules,
  };
}

export type ProfileState = ReturnType<typeof useProfileState>;
