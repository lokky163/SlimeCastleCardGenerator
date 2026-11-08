import React from 'react';
import { RelicCard } from '../RelicCard';
import { type RelicData, type RelicState } from '../../models/relic';
import { GridControls } from '../grid/GridControls';
import { ModulePanel } from '../ui/ModulePanel/ModulePanel';
import { SlotGrid } from '../grid/SlotGrid';
import type { SlotLayoutController } from '../grid/useSlotLayout';

interface RelicsModuleProps {
  relics: RelicData[];
  setRelics: React.Dispatch<React.SetStateAction<RelicData[]>>;
  layout: SlotLayoutController;
}

export const RelicsModule: React.FC<RelicsModuleProps> = ({
  relics,
  setRelics,
  layout,
}) => {
  const handleStateChange = (targetName: string, nextState: RelicState) => {
    setRelics((previous) =>
      previous.map((relic) =>
        relic.name === targetName ? relic.clone({ state: nextState }) : relic,
      ),
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
      />

      <SlotGrid
        items={relics}
        entries={layout.entries}
        mode={layout.mode}
        slotCount={layout.rows * layout.cols}
        variant="relic"
        hiddenKeys={layout.hiddenKeys}
        onToggleHidden={(key) => layout.setItemHidden(key, !layout.hiddenKeys.includes(key))}
        onSlotIndexChange={layout.setSlotIndex}
        renderCard={(relic) => (
          <RelicCard
            imageUrl={relic.imageUrl}
            state={relic.state}
            onChangeState={(state) => handleStateChange(relic.name, state)}
          />
        )}
      />
    </ModulePanel>
  );
};
