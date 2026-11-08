import type { RefObject } from 'react';
import { ALL_EQUIPMENT_GRADES, type EquipmentGrade } from '../../models/equipment';
import { MenuOption } from '../ui/MenuOption/MenuOption';
import { PopupMenu } from '../ui/PopupMenu/PopupMenu';

const GRADE_COLORS: Record<EquipmentGrade, string> = {
  no: '#a0a0b0',
  epic: '#BB79C0',
  legendary: '#E3B74A',
  mythic: '#C46F6A',
  mythic1: '#C46F6A',
  mythic2: '#C46F6A',
  mythic3: '#C46F6A',
  fantasy: '#D56CA5',
  fantasy1: '#D56CA5',
  fantasy2: '#D56CA5',
};

interface EquipmentGradeMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  grade: EquipmentGrade;
  onChange: (grade: EquipmentGrade) => void;
}

export const EquipmentGradeMenu: React.FC<EquipmentGradeMenuProps> = ({
  open,
  onClose,
  anchorRef,
  grade,
  onChange,
}) => (
  <PopupMenu open={open} onClose={onClose} anchorRef={anchorRef}>
    {ALL_EQUIPMENT_GRADES.map((option) => {
      const selected = option === grade;

      return (
        <MenuOption
          key={option}
          selected={selected}
          onClick={() => onChange(option)}
          style={selected ? undefined : { color: GRADE_COLORS[option] }}
        >
          {option}
        </MenuOption>
      );
    })}
  </PopupMenu>
);
