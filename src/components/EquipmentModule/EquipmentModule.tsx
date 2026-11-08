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
      <GridControls layout={layout} />

      <SlotGrid
        items={equipment}
        layout={layout}
        variant="equipment"
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
