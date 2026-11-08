import React from 'react';
import { type BuffData, type BuffType } from '../../models/buff';
import { CardGrid, CardGridItem } from '../grid/CardGrid';
import { ModulePanel } from '../ui/ModulePanel/ModulePanel';
import { BuffCard } from './BuffCard';
import { BuffPhaseBanner } from './BuffPhaseBanner';

interface BuffsModuleProps {
  buffs: BuffData[];
  setBuffs: React.Dispatch<React.SetStateAction<BuffData[]>>;
  phaseInfo: { phase: number; percent: number };
  remainingThrows: { min: number; avg: number; max: number };
}

export const BuffsModule: React.FC<BuffsModuleProps> = ({
  buffs,
  setBuffs,
  phaseInfo,
  remainingThrows,
}) => {
  const handleValueChange = (targetType: BuffType, value: number) => {
    setBuffs((previous) =>
      previous.map((buff) =>
        buff.type === targetType ? buff.clone({ value }) : buff,
      ),
    );
  };

  return (
    <ModulePanel>
      <BuffPhaseBanner
        phase={phaseInfo.phase}
        percent={phaseInfo.percent}
        remainingThrows={remainingThrows}
      />

      <CardGrid variant="buff">
        {buffs.map((buff) => (
          <CardGridItem key={buff.type}>
            <BuffCard
              buff={buff}
              onChangeValue={(value) => handleValueChange(buff.type, value)}
            />
          </CardGridItem>
        ))}
      </CardGrid>
    </ModulePanel>
  );
};
