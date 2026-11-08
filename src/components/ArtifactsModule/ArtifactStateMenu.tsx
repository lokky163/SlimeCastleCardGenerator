import type { RefObject } from 'react';
import {
  ALL_ARTIFACT_STATES,
  getArtifactStarImages,
  type ArtifactState,
} from '../../models/artifact';
import { MenuOption } from '../ui/MenuOption/MenuOption';
import { PopupMenu } from '../ui/PopupMenu/PopupMenu';
import { StarRating } from '../ui/StarRating/StarRating';
import styles from './ArtifactStateMenu.module.css';

interface ArtifactStateMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  state: ArtifactState;
  onChange: (state: ArtifactState) => void;
}

export const ArtifactStateMenu: React.FC<ArtifactStateMenuProps> = ({
  open,
  onClose,
  anchorRef,
  state,
  onChange,
}) => (
  <PopupMenu open={open} onClose={onClose} anchorRef={anchorRef} className={styles.menu}>
    {ALL_ARTIFACT_STATES.map((option) => (
      <MenuOption
        key={option}
        selected={option === state}
        onClick={() => onChange(option)}
      >
        {option === 'no' || option === '0' ? (
          <span className={styles.noStars}>{option === 'no' ? 'Нет' : '0 ★'}</span>
        ) : (
          <StarRating stars={getArtifactStarImages(option)} size={14} gap={2} />
        )}
      </MenuOption>
    ))}
  </PopupMenu>
);
