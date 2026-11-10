import { useI18n } from '../../i18n/I18nProvider';
import styles from './PlayerNotFound.module.css';

export const PlayerNotFound: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className={styles.panel} role="status">
      <span className={styles.icon} aria-hidden="true">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <path d="M12 16.5h.01" />
        </svg>
      </span>
      <h2 className={styles.title}>{t('Player not found')}</h2>
      <p className={styles.text}>
        {t(
          'The profile at this address does not exist. Pick a profile from the list.',
        )}
      </p>
    </div>
  );
};
