import { useTheme } from '../../hooks/useTheme';
import { useI18n } from '../../i18n/I18nProvider';
import type { ThemeIconName } from '../../services/Theme';
import { Tooltip } from '../ui/Tooltip/Tooltip';
import styles from './ThemeToggle.module.css';

const SunIcon: React.FC = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42" />
    <path d="M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
  </svg>
);

const MoonIcon: React.FC = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ThemeIcon: React.FC<{ name: ThemeIconName }> = ({ name }) =>
  name === 'sun' ? <SunIcon /> : <MoonIcon />;

export const ThemeToggle: React.FC = () => {
  const { t } = useI18n();
  const { nextTheme, toggleTheme } = useTheme();
  const label = t(nextTheme.toggleLabelKey);

  return (
    <Tooltip label={label} placement="bottom">
      <button
        type="button"
        className={styles.toggle}
        aria-label={label}
        onClick={toggleTheme}
      >
        <ThemeIcon name={nextTheme.icon} />
      </button>
    </Tooltip>
  );
};
