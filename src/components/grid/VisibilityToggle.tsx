import { useI18n } from '../../i18n/I18nProvider';
import { cx } from '../../utils/classNames';
import styles from './VisibilityToggle.module.css';

interface VisibilityToggleProps {
  hidden: boolean;
  onToggle: () => void;
}

export const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ hidden, onToggle }) => {
  const { t } = useI18n();

  return (
    <button
      type="button"
      className={cx(styles.toggle, hidden && styles.hidden)}
      onClick={onToggle}
      aria-pressed={hidden}
    >
      {hidden ? t('Show') : t('Hide')}
    </button>
  );
};
