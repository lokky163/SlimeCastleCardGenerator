import { useState } from 'react';
import { RelicData, RELIC_NAMES } from '../models/relic';
import { SlimeData, createInitialSlimes } from '../models/slime';
import { EquipmentData, createInitialEquipment } from '../models/equipment';
import { BuffData, BUFFS } from '../models/buff';
import { ArtifactData, ARTIFACT_NAMES } from '../models/artifact';
import { DEFAULT_LAYOUTS } from '../components/grid/layoutDefaults';
import { useSlotLayout } from '../components/grid/useSlotLayout';
import { useSlimeActions } from './useSlimeActions';

export const createRelics = () => RELIC_NAMES.map((name) => new RelicData(name, '0'));

export const createBuffs = () => BUFFS.map((type) => new BuffData(type, 0));

export const createArtifacts = () =>
  ARTIFACT_NAMES.map((name) => new ArtifactData(name, 'no', 1, 0));

function useCardModules() {
  const [relics, setRelics] = useState<RelicData[]>(createRelics);
  const relicLayout = useSlotLayout(relics, DEFAULT_LAYOUTS.relics);

  const [slimes, setSlimes] = useState<SlimeData[]>(createInitialSlimes);
  const slimeLayout = useSlotLayout(slimes, DEFAULT_LAYOUTS.slimes);
  const slimeActions = useSlimeActions(setSlimes);

  const [equipment, setEquipment] = useState<EquipmentData[]>(createInitialEquipment);
  const equipmentLayout = useSlotLayout(equipment, DEFAULT_LAYOUTS.equipment);

  const [buffs, setBuffs] = useState<BuffData[]>(createBuffs);
  const buffLayout = useSlotLayout(buffs, DEFAULT_LAYOUTS.buffs);

  const [artifacts, setArtifacts] = useState<ArtifactData[]>(createArtifacts);
  const artifactLayout = useSlotLayout(artifacts, DEFAULT_LAYOUTS.artifacts);

  const totalSlimeBonus = slimes.reduce(
    (sum, slime) => sum + slime.calculateBonus(),
    0,
  );

  return {
    relics,
    setRelics,
    relicLayout,
    slimes,
    setSlimes,
    slimeLayout,
    equipment,
    setEquipment,
    equipmentLayout,
    buffs,
    setBuffs,
    buffLayout,
    artifacts,
    setArtifacts,
    artifactLayout,
    totalSlimeBonus,
    ...slimeActions,
  };
}

export function useProfileState() {
  const [playerName, setPlayerName] = useState('');
  const modules = useCardModules();

  return {
    playerName,
    setPlayerName,
    ...modules,
  };
}

export type ProfileState = ReturnType<typeof useProfileState>;
