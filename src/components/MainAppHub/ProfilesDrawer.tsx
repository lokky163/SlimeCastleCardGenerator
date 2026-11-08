import { useRef } from 'react';
import type { ProfilesNotice } from '../../hooks/useProfiles';
import type { SccProfile } from '../../services/ProfilesSchema';
import { cx } from '../../utils/classNames';
import styles from './ProfilesDrawer.module.css';

interface ProfilesDrawerProps {
  open: boolean;
  profiles: SccProfile[];
  activeProfileIndex: number;
  notice: ProfilesNotice | null;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRequestDelete: (index: number) => void;
  onExportAll: () => void;
  onImportAllFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ProfileRowProps {
  profile: SccProfile;
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
}

interface ProfilesFooterProps {
  notice: ProfilesNotice | null;
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

function profileName(profile: SccProfile): string {
  return profile.playerName.trim() || 'Без ника';
}

const ProfileRow: React.FC<ProfileRowProps> = ({
  profile,
  index,
  active,
  onSelect,
  onDelete,
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
  notice,
  onExportAll,
  onImportAllFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.footer}>
      {notice && (
        <p
          className={cx(
            styles.notice,
            notice.tone === 'error' ? styles.noticeError : styles.noticeSuccess,
          )}
        >
          {notice.text}
        </p>
      )}

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
  notice,
  onSelect,
  onAdd,
  onRequestDelete,
  onExportAll,
  onImportAllFile,
}) => {
  if (!open) return null;

  return (
    <aside id="profiles-drawer" className={styles.drawer} aria-label="Профили">
      <div className={styles.list}>
        {profiles.map((profile, index) => (
          <ProfileRow
            key={index}
            profile={profile}
            index={index}
            active={index === activeProfileIndex}
            onSelect={onSelect}
            onDelete={onRequestDelete}
          />
        ))}

        <button type="button" className={styles.addBtn} onClick={onAdd}>
          + Добавить профиль
        </button>
      </div>

      <ProfilesFooter
        notice={notice}
        onExportAll={onExportAll}
        onImportAllFile={onImportAllFile}
      />
    </aside>
  );
};
