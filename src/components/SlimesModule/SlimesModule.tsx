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
  setSlimes: React.Dispatch<React.SetStateAction<SlimeData[]>>;
  layout: SlotLayoutController;
  onChangeSkin: (targetName: string, nextSkin: number) => void;
}

export const SlimesModule: React.FC<SlimesModuleProps> = ({
  slimes,
  setSlimes,
  layout,
  onChangeSkin,
}) => {
  const totalSlimeBonus = slimes.reduce(
    (sum, slime) => sum + slime.calculateBonus(),
    0,
  );

  const handleStateChange = (targetName: string, nextState: SlimeState) => {
    setSlimes((previous) =>
      previous.map((slime) =>
        slime.name === targetName ? slime.clone({ _state: nextState }) : slime,
      ),
    );
  };

  const handleLevelChange = (targetName: string, nextLevel: number) => {
    setSlimes((previous) =>
      previous.map((slime) => {
        if (slime.name !== targetName) return slime;

        const updated = slime.clone({});
        updated.level = nextLevel;
        return updated;
      }),
    );
  };

  return (
    <ModulePanel>
      <GridControls
        rows={layout.rows}
        cols={layout.cols}
        mode={layout.mode}
        onRowsChange={layout.setRows}
        onColsChange={layout.setCols}
        onModeChange={layout.setMode}
      >
        <div className={styles.bonus}>
          Общий бонус слайма: {totalSlimeBonus.toFixed(2)}
        </div>
      </GridControls>

      <SlotGrid
        items={slimes}
        entries={layout.entries}
        mode={layout.mode}
        slotCount={layout.rows * layout.cols}
        variant="slime"
        getKey={(slime) => slime.name}
        onSlotIndexChange={layout.setSlotIndex}
        renderCard={(slime) => (
          <SlimeCard
            slime={slime}
            width={130}
            onChangeState={(state) => handleStateChange(slime.name, state)}
            onChangeLevel={(level) => handleLevelChange(slime.name, level)}
            onChangeSkin={() => onChangeSkin(slime.name, slime.nextSkin())}
          />
        )}
      />
    </ModulePanel>
  );
};
