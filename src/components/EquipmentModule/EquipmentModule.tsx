import React from 'react';
import { EquipmentCard } from '../EquipmentCard/EquipmentCard';
import { type EquipmentData, type EquipmentGrade } from '../../models/equipment';
import { CardGrid, CardGridItem } from '../grid/CardGrid';
import { ModulePanel } from '../ui/ModulePanel/ModulePanel';

interface EquipmentModuleProps {
  equipment: EquipmentData[];
  setEquipment: React.Dispatch<React.SetStateAction<EquipmentData[]>>;
}

export const EquipmentModule: React.FC<EquipmentModuleProps> = ({
  equipment,
  setEquipment,
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
      <CardGrid variant="equipment">
        {equipment.map((item) => (
          <CardGridItem key={item.name}>
            <EquipmentCard
              equipment={item}
              width={150}
              onChangeGrade={(grade) => handleGradeChange(item.name, grade)}
            />
          </CardGridItem>
        ))}
      </CardGrid>
    </ModulePanel>
  );
};
