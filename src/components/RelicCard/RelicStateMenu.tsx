import type { RefObject } from 'react';
import { ALL_RELIC_STATES, getStarImages, type RelicState } from '../../models/relic';
import { MenuOption } from '../ui/MenuOption/MenuOption';
import { PopupMenu } from '../ui/PopupMenu/PopupMenu';
import { StarRating } from '../ui/StarRating/StarRating';
import styles from './RelicStateMenu.module.css';

interface RelicStateMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  state: RelicState;
  onChange: (state: RelicState) => void;
}

export const RelicStateMenu: React.FC<RelicStateMenuProps> = ({
  open,
  onClose,
  anchorRef,
  state,
  onChange,
}) => (
  <PopupMenu open={open} onClose={onClose} anchorRef={anchorRef}>
    {ALL_RELIC_STATES.map((option) => (
      <MenuOption
        key={option}
        selected={option === state}
        onClick={() => onChange(option)}
      >
        {option === 'no' ? (
          <span className={styles.noText}>no</span>
        ) : (
          <StarRating stars={getStarImages(option)} size={18} gap={2} />
        )}
      </MenuOption>
    ))}
  </PopupMenu>
);
