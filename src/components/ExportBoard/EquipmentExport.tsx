import { EquipmentCard } from '../EquipmentCard/EquipmentCard';
import type { EquipmentData } from '../../models/equipment';
import { ExportSection } from './ExportSection';
import styles from './ExportBoard.module.css';

interface EquipmentExportProps {
  equipment: EquipmentData[];
}

export const EquipmentExport: React.FC<EquipmentExportProps> = ({ equipment }) => {
  const columns = Math.max(1, equipment.length);

  return (
    <ExportSection>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${columns}, 195px)`,
          gridTemplateRows: 'repeat(1, 209px)',
        }}
      >
        {equipment.map((item) => (
          <div key={`export-equipment-${item.name}`} className={styles.equipmentCell}>
            <EquipmentCard equipment={item} width={195} onChangeGrade={() => {}} />
          </div>
        ))}
      </div>
    </ExportSection>
  );
};
