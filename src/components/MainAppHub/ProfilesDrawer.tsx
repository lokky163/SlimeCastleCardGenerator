import { useRef } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import type { SccProfile } from '../../services/ProfilesSchema';
import { cx } from '../../utils/classNames';
import { ProfileGhost } from './ProfileGhost';
import { ProfilesFooter } from './ProfilesFooter';
import { ProfileRow } from './ProfileRow';
import styles from './ProfilesDrawer.module.css';
import { useProfileDrag } from './useProfileDrag';

interface ProfilesDrawerProps {
  open: boolean;
  profiles: SccProfile[];
  activeProfileIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRequestDelete: (index: number) => void;
  onReorderProfile: (from: number, to: number) => void;
  onExportAll: () => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfilesDrawer: React.FC<ProfilesDrawerProps> = ({
  open,
  profiles,
  activeProfileIndex,
  onSelect,
  onAdd,
  onRequestDelete,
  onReorderProfile,
  onExportAll,
  onImportFile,
}) => {
  const { t } = useI18n();
  const listRef = useRef<HTMLDivElement>(null);
  const { drag, ghostRef, isDragging, rowHandlers, drawerHandlers } =
    useProfileDrag({ profiles, listRef, onReorderProfile });

  if (!open) return null;

  const order = drag ? drag.order : profiles.map((_, index) => index);
  const ghostProfile = drag ? profiles[drag.order[drag.position]] : null;

  return (
    <aside
      id="profiles-drawer"
      className={cx(styles.drawer, isDragging && styles.drawerDragging)}
      aria-label={t('Profiles')}
      {...drawerHandlers}
    >
      <div className={styles.list} ref={listRef}>
        {order.map((profileIndex, position) => {
          const profile = profiles[profileIndex];
          if (!profile) return null;

          return (
            <ProfileRow
              key={profile.uid}
              profile={profile}
              index={profileIndex}
              displayIndex={position}
              position={position}
              total={profiles.length}
              active={profileIndex === activeProfileIndex}
              dragging={drag !== null && drag.position === position}
              handlers={rowHandlers}
              onSelect={onSelect}
              onDelete={onRequestDelete}
              onReorder={onReorderProfile}
            />
          );
        })}

        <button type="button" className={styles.addBtn} onClick={onAdd}>
          {t('+ Add profile')}
        </button>
      </div>

      <ProfilesFooter
        onExportAll={onExportAll}
        onImportFile={onImportFile}
      />

      {drag && ghostProfile && (
        <ProfileGhost ref={ghostRef} profile={ghostProfile} drag={drag} />
      )}
    </aside>
  );
};
