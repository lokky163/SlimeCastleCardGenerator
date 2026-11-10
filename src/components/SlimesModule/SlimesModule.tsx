import React from 'react';
import { useI18n } from '../../i18n/I18nProvider';
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
}) => {
  const { t } = useI18n();

  return (
    <ModulePanel>
      <GridControls layout={layout}>
        <div className={styles.bonus}>
          {t('Total slime bonus:')} {totalSlimeBonus.toFixed(2)}
        </div>
      </GridControls>

      <SlotGrid
        items={slimes}
        layout={layout}
        variant="slime"
        renderCard={(slime, _itemIndex, width) => (
          <SlimeCard
            slime={slime}
            width={width}
            onChangeState={(state) => onChangeState(slime.name, state)}
            onChangeLevel={(level) => onChangeLevel(slime.name, level)}
            onChangeSkin={() => onChangeSkin(slime.name, slime.nextSkin())}
          />
        )}
      />
    </ModulePanel>
  );
};
