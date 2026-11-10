import type { RefObject } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
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
}) => {
  const { t } = useI18n();

  return (
    <PopupMenu open={open} onClose={onClose} anchorRef={anchorRef}>
      {ALL_RELIC_STATES.map((option) => (
        <MenuOption
          key={option}
          selected={option === state}
          onClick={() => onChange(option)}
        >
          {option === 'no' ? (
            <span className={styles.noText}>{t('None')}</span>
          ) : (
            <StarRating stars={getStarImages(option)} size={18} gap={2} />
          )}
        </MenuOption>
      ))}
    </PopupMenu>
  );
};
