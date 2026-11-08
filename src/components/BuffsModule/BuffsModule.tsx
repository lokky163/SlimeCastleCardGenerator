import React from 'react';
import { type BuffData, type BuffType } from '../../models/buff';
import type { DropChanceSelection } from '../../utils/buffDrops';
import type { BuffsProgress } from '../../utils/buffProgress';
import { GridControls } from '../grid/GridControls';
import { SlotGrid } from '../grid/SlotGrid';
import type { SlotLayoutController } from '../grid/useSlotLayout';
import { ModulePanel } from '../ui/ModulePanel/ModulePanel';
import { BuffCard } from './BuffCard';
import { BuffDropCalculator } from './BuffDropCalculator';
import { BuffPhaseBanner } from './BuffPhaseBanner';

interface BuffsModuleProps {
  buffs: BuffData[];
  setBuffs: React.Dispatch<React.SetStateAction<BuffData[]>>;
  layout: SlotLayoutController;
  progress: BuffsProgress;
  dropChance: DropChanceSelection;
  onDropChanceChange: (chance: DropChanceSelection) => void;
}

function changeBuffValue(
  setBuffs: React.Dispatch<React.SetStateAction<BuffData[]>>,
  targetType: BuffType,
  value: number,
) {
  setBuffs((previous) =>
    previous.map((buff) =>
      buff.type === targetType ? buff.clone({ value }) : buff,
    ),
  );
}

export const BuffsModule: React.FC<BuffsModuleProps> = ({
  buffs,
  setBuffs,
  layout,
  progress,
  dropChance,
  onDropChanceChange,
}) => {
  return (
    <ModulePanel>
      <GridControls layout={layout} />

      <BuffPhaseBanner
        phaseOne={progress.phaseOne}
        phaseTwo={progress.phaseTwo}
      />

      <BuffDropCalculator
        phaseOne={progress.phaseOne.remaining}
        phaseTwo={progress.phaseTwo.remaining}
        chance={dropChance}
        onChanceChange={onDropChanceChange}
      />

      <SlotGrid
        items={buffs}
        layout={layout}
        variant="buff"
        renderCard={(buff) => (
          <BuffCard
            buff={buff}
            onChangeValue={(value) => changeBuffValue(setBuffs, buff.type, value)}
          />
        )}
      />
    </ModulePanel>
  );
};
