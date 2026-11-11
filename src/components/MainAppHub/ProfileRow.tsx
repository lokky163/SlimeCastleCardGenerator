import { useI18n } from '../../i18n/I18nProvider';
import type { SccProfile } from '../../services/ProfilesSchema';
import { cx } from '../../utils/classNames';
import { Tooltip } from '../ui/Tooltip/Tooltip';
import styles from './ProfilesDrawer.module.css';
import { profileName } from './profileName';
import type { ProfileRowHandlers } from './profileDragTypes';

interface ProfileRowProps {
  profile: SccProfile;
  index: number;
  displayIndex: number;
  position: number;
  total: number;
  active: boolean;
  dragging: boolean;
  handlers: ProfileRowHandlers;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (from: number, to: number) => void;
}

const TrashIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
);

export const ProfileRow: React.FC<ProfileRowProps> = ({
  profile,
  index,
  displayIndex,
  position,
  total,
  active,
  dragging,
  handlers,
  onSelect,
  onDelete,
  onReorder,
}) => {
  const { t } = useI18n();
  const deleteLabel = t('Delete profile {index}', { index: displayIndex + 1 });

  return (
    <div
      className={cx(
        styles.profileRow,
        active && styles.profileRowActive,
        dragging && styles.profileRowDragging,
      )}
      data-profile-uid={profile.uid}
      data-profile-position={position}
      onPointerDown={(event) => handlers.onPointerDown(event, index)}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      onPointerLeave={handlers.onPointerLeave}
    >
      <button
        type="button"
        className={styles.profileSelect}
        aria-current={active ? 'true' : undefined}
        aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
        onClick={() => onSelect(index)}
        onKeyDown={(event) => {
          if (!event.altKey) return;
          if (event.key === 'ArrowUp' && index > 0) {
            event.preventDefault();
            onReorder(index, index - 1);
          } else if (event.key === 'ArrowDown' && index < total - 1) {
            event.preventDefault();
            onReorder(index, index + 1);
          }
        }}
      >
        <span className={styles.profileTitle}>
          {t('Profile {index}:', { index: displayIndex + 1 })}
        </span>
        <span className={styles.profileName}>
          {profileName(profile, t('No name'))}
        </span>
      </button>

      <Tooltip label={deleteLabel} placement="bottom" align="end">
        <button
          type="button"
          className={styles.deleteBtn}
          aria-label={deleteLabel}
          data-no-drag="true"
          onClick={() => onDelete(index)}
        >
          <TrashIcon />
        </button>
      </Tooltip>
    </div>
  );
};
