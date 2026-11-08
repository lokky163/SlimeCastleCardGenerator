import React from 'react';
import { EquipmentCard } from '../EquipmentCard/EquipmentCard';
import { type EquipmentData, type EquipmentGrade } from '../../models/equipment';
import { GridControls } from '../grid/GridControls';
import { SlotGrid } from '../grid/SlotGrid';
import type { SlotLayoutController } from '../grid/useSlotLayout';
import { ModulePanel } from '../ui/ModulePanel/ModulePanel';

interface EquipmentModuleProps {
  equipment: EquipmentData[];
  setEquipment: React.Dispatch<React.SetStateAction<EquipmentData[]>>;
  layout: SlotLayoutController;
}

export const EquipmentModule: React.FC<EquipmentModuleProps> = ({
  equipment,
  setEquipment,
  layout,
}) => {
  const handleGradeChange = (targetName: string, grade: EquipmentGrade) => {
    setEquipment((previous) =>
      previous.map((item) =>
        item.name === targetName ? item.clone({ grade }) : item,
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
        items={equipment}
        entries={layout.entries}
        mode={layout.mode}
        slotCount={layout.rows * layout.cols}
        variant="equipment"
        hiddenKeys={layout.hiddenKeys}
        onToggleHidden={(key) => layout.setItemHidden(key, !layout.hiddenKeys.includes(key))}
        onSlotIndexChange={layout.setSlotIndex}
        renderCard={(item) => (
          <EquipmentCard
            equipment={item}
            width={150}
            onChangeGrade={(grade) => handleGradeChange(item.name, grade)}
          />
        )}
      />
    </ModulePanel>
  );
};
