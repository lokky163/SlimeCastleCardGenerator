import React from 'react';
import { EquipmentCard } from '../EquipmentCard/EquipmentCard';
import { type EquipmentData, type EquipmentGrade } from '../../models/equipment';
import styles from './EquipmentModule.module.css';

interface EquipmentModuleProps {
  equipment: EquipmentData[];
  setEquipment: React.Dispatch<React.SetStateAction<EquipmentData[]>>;
  bgColor: string;
  hdRef: React.RefObject<HTMLDivElement | null>;
}

export const EquipmentModule: React.FC<EquipmentModuleProps> = ({
  equipment,
  setEquipment,
  bgColor,
  hdRef
}) => {
  // Изменение грейда конкретной шмотки
  const handleGradeChange = (targetName: string, nextGrade: EquipmentGrade) => {
    setEquipment(prev =>
      prev.map(item => item.name === targetName ? item.clone({ grade: nextGrade }) : item)
    );
  };

  return (
    <div className={styles.container}>
      <div style={{ width: '100%' }}>
        <div className={styles.screenGrid}>
          {equipment.map((item) => (
            <div key={item.name} className={styles.equipCardWrapper}>
              <div className={styles.cardContainerSize}>
                <EquipmentCard 
                  equipment={item}
                  width={150} // Превью на экране уменьшено
                  onChangeGrade={(g) => handleGradeChange(item.name, g)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* СКРЫТЫЙ HD-СТЕНД ДЛЯ СНИМКА PNG (Строго 4 столбца на 2 строки)           */}
      {/* ====================================================================== */}
      <div ref={hdRef} className={styles.hdHiddenContainer} style={{ backgroundColor: bgColor, padding: '15px' }}>
        <div 
          className={styles.hdEquipGrid} 
          style={{ 
            gridTemplateColumns: 'repeat(4, 195px)', 
            gridTemplateRows: 'repeat(2, 209px)' 
          }}
        >
          {equipment.map((item) => (
            <div key={`hd-${item.name}`} className={styles.hdEquipCell}>
              <EquipmentCard 
                equipment={item}
                width={195} // На картинке рендерится строго 1:1
                onChangeGrade={() => {}}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
