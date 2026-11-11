import { useI18n } from '../../i18n/I18nProvider';
import type { SccProfile } from '../../services/ProfilesSchema';
import type { ProfileDragState } from './profileDragTypes';
import { profileName } from './profileName';
import styles from './ProfilesDrawer.module.css';

interface ProfileGhostProps {
  profile: SccProfile;
  drag: ProfileDragState;
  ref?: React.Ref<HTMLDivElement>;
}

export const ProfileGhost: React.FC<ProfileGhostProps> = ({
  profile,
  drag,
  ref,
}) => {
  const { t } = useI18n();

  return (
    <div
      ref={ref}
      className={styles.dragGhost}
      aria-hidden="true"
      style={{ width: drag.width, height: drag.height }}
    >
      <span className={styles.profileTitle}>
        {t('Profile {index}:', { index: drag.position + 1 })}
      </span>
      <span className={styles.profileName}>
        {profileName(profile, t('No name'))}
      </span>
    </div>
  );
};
