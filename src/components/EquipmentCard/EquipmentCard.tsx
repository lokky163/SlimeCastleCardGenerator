import { useRef, useState } from 'react';
import type { EquipmentData, EquipmentGrade } from '../../models/equipment';
import { useComposedImage } from '../../hooks/useComposedImage';
import { ComposedImage } from '../ui/ComposedImage/ComposedImage';
import {
  drawEquipmentImage,
  EQUIPMENT_IMAGE_HEIGHT,
  EQUIPMENT_IMAGE_WIDTH,
  equipmentImageKey,
} from './drawEquipmentImage';
import { EquipmentGradeMenu } from './EquipmentGradeMenu';
import styles from './EquipmentCard.module.css';

interface EquipmentCardProps {
  equipment: EquipmentData;
  width?: number;
  onChangeGrade: (newGrade: EquipmentGrade) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  width = 195,
  onChangeGrade,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const imageSrc = useComposedImage(
    equipmentImageKey(equipment),
    EQUIPMENT_IMAGE_WIDTH,
    EQUIPMENT_IMAGE_HEIGHT,
    (ctx) => drawEquipmentImage(ctx, equipment),
  );

  const handleSelectGrade = (grade: EquipmentGrade) => {
    onChangeGrade(grade);
    setIsMenuOpen(false);
  };

  return (
    <div
      ref={cardRef}
      className={styles.cardContainer}
      onClick={() => setIsMenuOpen((open) => !open)}
      style={{ width: `${width}px` }}
    >
      <ComposedImage
        src={imageSrc}
        alt={equipment.name}
        aspectRatio={`${EQUIPMENT_IMAGE_WIDTH} / ${EQUIPMENT_IMAGE_HEIGHT}`}
        grayscale={equipment.isBlackAndWhite}
        className={styles.artwork}
      />

      <EquipmentGradeMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={cardRef}
        grade={equipment.grade}
        onChange={handleSelectGrade}
      />
    </div>
  );
};
