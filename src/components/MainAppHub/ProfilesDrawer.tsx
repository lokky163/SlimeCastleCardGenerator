import { useRef } from 'react';
import type { ProfilesMoveDirection } from '../../hooks/useProfiles';
import type { SccProfile } from '../../services/ProfilesSchema';
import { cx } from '../../utils/classNames';
import styles from './ProfilesDrawer.module.css';

interface ProfilesDrawerProps {
  open: boolean;
  profiles: SccProfile[];
  activeProfileIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRequestDelete: (index: number) => void;
  onMoveProfile: (index: number, direction: ProfilesMoveDirection) => void;
  onExportAll: () => void;
  onImportAllFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ProfileRowProps {
  profile: SccProfile;
  index: number;
  active: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: ProfilesMoveDirection) => void;
}

interface ProfilesFooterProps {
  onExportAll: () => void;
  onImportAllFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
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

const MoveIcon: React.FC<{ direction: ProfilesMoveDirection }> = ({
  direction,
}) => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: direction === 'down' ? 'rotate(180deg)' : undefined }}
  >
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

function profileName(profile: SccProfile): string {
  return profile.playerName.trim() || 'Без ника';
}

interface ProfileMoveButtonsProps {
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (index: number, direction: ProfilesMoveDirection) => void;
}

const ProfileMoveButtons: React.FC<ProfileMoveButtonsProps> = ({
  index,
  canMoveUp,
  canMoveDown,
  onMove,
}) => {
  if (!canMoveUp && !canMoveDown) return null;

  return (
    <div className={styles.reorderBtns}>
      {canMoveUp && (
        <button
          type="button"
          className={styles.moveBtn}
          aria-label={`Переместить профиль ${index + 1} вверх`}
          title={`Переместить профиль ${index + 1} вверх`}
          onClick={() => onMove(index, 'up')}
        >
          <MoveIcon direction="up" />
        </button>
      )}

      {canMoveDown && (
        <button
          type="button"
          className={styles.moveBtn}
          aria-label={`Переместить профиль ${index + 1} вниз`}
          title={`Переместить профиль ${index + 1} вниз`}
          onClick={() => onMove(index, 'down')}
        >
          <MoveIcon direction="down" />
        </button>
      )}
    </div>
  );
};

const ProfileRow: React.FC<ProfileRowProps> = ({
  profile,
  index,
  active,
  canMoveUp,
  canMoveDown,
  onSelect,
  onDelete,
  onMove,
}) => (
  <div className={cx(styles.profileRow, active && styles.profileRowActive)}>
    <button
      type="button"
      className={styles.profileSelect}
      aria-current={active ? 'true' : undefined}
      onClick={() => onSelect(index)}
    >
      <span className={styles.profileTitle}>Профиль {index + 1}:</span>
      <span className={styles.profileName}>{profileName(profile)}</span>
    </button>

    <ProfileMoveButtons
      index={index}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      onMove={onMove}
    />

    <button
      type="button"
      className={styles.deleteBtn}
      aria-label={`Удалить профиль ${index + 1}`}
      title={`Удалить профиль ${index + 1}`}
      onClick={() => onDelete(index)}
    >
      <TrashIcon />
    </button>
  </div>
);

const ProfilesFooter: React.FC<ProfilesFooterProps> = ({
  onExportAll,
  onImportAllFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.footer}>
      <button
        type="button"
        className={cx(styles.footerBtn, styles.saveAllBtn)}
        onClick={onExportAll}
      >
        Сохранить все
      </button>

      <button
        type="button"
        className={cx(styles.footerBtn, styles.loadAllBtn)}
        onClick={() => fileInputRef.current?.click()}
      >
        Загрузить все
      </button>

      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        className={styles.fileInput}
        onChange={onImportAllFile}
      />
    </div>
  );
};

export const ProfilesDrawer: React.FC<ProfilesDrawerProps> = ({
  open,
  profiles,
  activeProfileIndex,
  onSelect,
  onAdd,
  onRequestDelete,
  onMoveProfile,
  onExportAll,
  onImportAllFile,
}) => {
  if (!open) return null;

  return (
    <aside id="profiles-drawer" className={styles.drawer} aria-label="Профили">
      <div className={styles.list}>
        {profiles.map((profile, index) => (
          <ProfileRow
            key={profile.uid}
            profile={profile}
            index={index}
            active={index === activeProfileIndex}
            canMoveUp={index > 0}
            canMoveDown={index < profiles.length - 1}
            onSelect={onSelect}
            onDelete={onRequestDelete}
            onMove={onMoveProfile}
          />
        ))}

        <button type="button" className={styles.addBtn} onClick={onAdd}>
          + Добавить профиль
        </button>
      </div>

      <ProfilesFooter
        onExportAll={onExportAll}
        onImportAllFile={onImportAllFile}
      />
    </aside>
  );
};
