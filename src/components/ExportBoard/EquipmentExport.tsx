import { EquipmentCard } from '../EquipmentCard/EquipmentCard';
import { EQUIPMENT_COLUMNS, type EquipmentData } from '../../models/equipment';
import type { SlotLayoutState } from '../grid/layout';
import { ExportSection } from './ExportSection';
import { ExportSlotGrid } from './ExportSlotGrid';
import styles from './ExportBoard.module.css';

interface EquipmentExportProps {
  equipment: EquipmentData[];
}

/** Equipment never hides cards or changes order: all 12 items are always drawn. */
function createEquipmentLayout(equipment: EquipmentData[]): SlotLayoutState {
  return {
    rows: Math.max(1, Math.ceil(equipment.length / EQUIPMENT_COLUMNS)),
    cols: EQUIPMENT_COLUMNS,
    mode: 'default',
    autoSize: true,
    hideEnabled: false,
    hiddenKeys: [],
    entries: equipment.map((_, index) => ({
      index,
      visible: true,
      hidden: false,
    })),
  };
}

export const EquipmentExport: React.FC<EquipmentExportProps> = ({ equipment }) => (
  <ExportSection>
    <ExportSlotGrid
      items={equipment}
      layout={createEquipmentLayout(equipment)}
      cellWidth={195}
      cellHeight={209}
      cellClassName={styles.equipmentCell}
      renderItem={(item) => (
        <EquipmentCard equipment={item} width={195} onChangeGrade={() => {}} />
      )}
    />
  </ExportSection>
);
