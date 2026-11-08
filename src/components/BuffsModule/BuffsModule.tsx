import React from 'react';
import { type BuffData, type BuffType } from '../../models/buff';
import { GridControls } from '../grid/GridControls';
import { SlotGrid } from '../grid/SlotGrid';
import type { SlotLayoutController } from '../grid/useSlotLayout';
import { ModulePanel } from '../ui/ModulePanel/ModulePanel';
import { BuffCard } from './BuffCard';
import { BuffPhaseBanner } from './BuffPhaseBanner';

interface BuffsModuleProps {
  buffs: BuffData[];
  setBuffs: React.Dispatch<React.SetStateAction<BuffData[]>>;
  layout: SlotLayoutController;
  phaseInfo: { phase: number; percent: number };
  remainingThrows: { min: number; avg: number; max: number };
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
  phaseInfo,
  remainingThrows,
}) => {
  return (
    <ModulePanel>
      <GridControls layout={layout} />

      <BuffPhaseBanner
        phase={phaseInfo.phase}
        percent={phaseInfo.percent}
        remainingThrows={remainingThrows}
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
