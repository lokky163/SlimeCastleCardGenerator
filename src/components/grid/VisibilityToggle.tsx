import { cx } from '../../utils/classNames';
import styles from './VisibilityToggle.module.css';

interface VisibilityToggleProps {
  hidden: boolean;
  onToggle: () => void;
}

export const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ hidden, onToggle }) => (
  <button
    type="button"
    className={cx(styles.toggle, hidden && styles.hidden)}
    onClick={onToggle}
    aria-pressed={hidden}
  >
    {hidden ? 'Показать' : 'Скрыть'}
  </button>
);
