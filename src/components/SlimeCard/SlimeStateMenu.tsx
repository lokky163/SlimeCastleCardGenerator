import type { RefObject } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { ALL_SLIME_STATES, SLIME_ASSETS, type SlimeState } from '../../models/slime';
import { MenuOption } from '../ui/MenuOption/MenuOption';
import { PopupMenu } from '../ui/PopupMenu/PopupMenu';
import { StarRating } from '../ui/StarRating/StarRating';
import styles from './SlimeStateMenu.module.css';

interface SlimeStateMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  state: SlimeState;
  cardWidth: number;
  onChange: (state: SlimeState) => void;
}

function getStars(option: SlimeState): string[] {
  const count = parseInt(option, 10) || 0;
  if (count === 0) return [];

  const type = option.endsWith('y') ? 'yellow' : 'red';
  return Array<string>(count).fill(SLIME_ASSETS.stars[type]);
}

export const SlimeStateMenu: React.FC<SlimeStateMenuProps> = ({
  open,
  onClose,
  anchorRef,
  state,
  cardWidth,
  onChange,
}) => {
  const { t } = useI18n();

  return (
    <PopupMenu open={open} onClose={onClose} anchorRef={anchorRef}>
      {ALL_SLIME_STATES.map((option) => {
        const stars = getStars(option);

        return (
          <MenuOption
            key={option}
            selected={option === state}
            onClick={() => onChange(option)}
          >
            {option === 'no' || option === '0' ? (
              <span className={styles.noText}>
                {option === 'no' ? t('None') : '0 ★'}
              </span>
            ) : (
              <StarRating
                stars={stars}
                size={Math.max(10, Math.round(cardWidth * 0.11))}
                gap={2}
              />
            )}
          </MenuOption>
        );
      })}
    </PopupMenu>
  );
};
