import { useState } from 'react';
import { RelicData, RELIC_NAMES } from '../models/relic';
import { SlimeData, createInitialSlimes } from '../models/slime';
import { EquipmentData, createInitialEquipment } from '../models/equipment';
import { BuffData, BUFFS } from '../models/buff';
import { ArtifactData, ARTIFACT_NAMES } from '../models/artifact';
import { useSlotLayout } from '../components/grid/useSlotLayout';

export const createRelics = () => RELIC_NAMES.map((name) => new RelicData(name, '0'));

export const createBuffs = () => BUFFS.map((type) => new BuffData(type, 0));

export const createArtifacts = () =>
  ARTIFACT_NAMES.map((name) => new ArtifactData(name, 'no', 1, 0));

export function useProfileState() {
  const [playerName, setPlayerName] = useState('');
  const [relics, setRelics] = useState<RelicData[]>(createRelics);
  const relicLayout = useSlotLayout(relics, { rows: 3, cols: 6, mode: 'to-end' });

  const [slimes, setSlimes] = useState<SlimeData[]>(createInitialSlimes);
  const slimeLayout = useSlotLayout(slimes, { rows: 5, cols: 6, mode: 'to-end' });

  const [equipment, setEquipment] = useState<EquipmentData[]>(createInitialEquipment);
  const [buffs, setBuffs] = useState<BuffData[]>(createBuffs);
  const [artifacts, setArtifacts] = useState<ArtifactData[]>(createArtifacts);

  const totalSlimeBonus = slimes.reduce(
    (sum, slime) => sum + slime.calculateBonus(),
    0,
  );

  const changeSkin = (targetName: string, nextSkin: number) => {
    setSlimes((previous) =>
      previous.map((slime) =>
        slime.name === targetName ? slime.clone({ _skin: nextSkin }) : slime,
      ),
    );
  };

  return {
    playerName,
    setPlayerName,
    relics,
    setRelics,
    relicLayout,
    slimes,
    setSlimes,
    slimeLayout,
    equipment,
    setEquipment,
    buffs,
    setBuffs,
    artifacts,
    setArtifacts,
    totalSlimeBonus,
    changeSkin,
  };
}

export type ProfileState = ReturnType<typeof useProfileState>;
