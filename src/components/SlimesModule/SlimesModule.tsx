import React from 'react';
import { SlimeCard } from '../SlimeCard/SlimeCard';
import { type SlimeData, type SlimeState } from '../../models/slime';
import { GridControls } from '../grid/GridControls';
import { ModulePanel } from '../ui/ModulePanel/ModulePanel';
import { SlotGrid } from '../grid/SlotGrid';
import type { SlotLayoutController } from '../grid/useSlotLayout';
import styles from './SlimesModule.module.css';

interface SlimesModuleProps {
  slimes: SlimeData[];
  totalSlimeBonus: number;
  layout: SlotLayoutController;
  onChangeState: (targetName: string, nextState: SlimeState) => void;
  onChangeLevel: (targetName: string, nextLevel: number) => void;
  onChangeSkin: (targetName: string, nextSkin: number) => void;
}

export const SlimesModule: React.FC<SlimesModuleProps> = ({
  slimes,
  totalSlimeBonus,
  layout,
  onChangeState,
  onChangeLevel,
  onChangeSkin,
}) => (
  <ModulePanel>
    <GridControls layout={layout}>
      <div className={styles.bonus}>
        Общий бонус слайма: {totalSlimeBonus.toFixed(2)}
      </div>
    </GridControls>

    <SlotGrid
      items={slimes}
      layout={layout}
      variant="slime"
      renderCard={(slime) => (
        <SlimeCard
          slime={slime}
          width={130}
          onChangeState={(state) => onChangeState(slime.name, state)}
          onChangeLevel={(level) => onChangeLevel(slime.name, level)}
          onChangeSkin={() => onChangeSkin(slime.name, slime.nextSkin())}
        />
      )}
    />
  </ModulePanel>
);
