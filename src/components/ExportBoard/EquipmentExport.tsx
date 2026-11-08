import { EquipmentCard } from '../EquipmentCard/EquipmentCard';
import type { EquipmentData } from '../../models/equipment';
import type { SlotLayoutState } from '../grid/layout';
import { ExportSection } from './ExportSection';
import { ExportSlotGrid } from './ExportSlotGrid';
import styles from './ExportBoard.module.css';

interface EquipmentExportProps {
  equipment: EquipmentData[];
  layout: SlotLayoutState;
}

export const EquipmentExport: React.FC<EquipmentExportProps> = ({
  equipment,
  layout,
}) => (
  <ExportSection>
    <ExportSlotGrid
      items={equipment}
      layout={layout}
      cellWidth={195}
      cellHeight={209}
      cellClassName={styles.equipmentCell}
      renderItem={(item) => (
        <EquipmentCard equipment={item} width={195} onChangeGrade={() => {}} />
      )}
    />
  </ExportSection>
);
