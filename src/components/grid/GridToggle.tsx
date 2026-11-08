import { cx } from '../../utils/classNames';
import styles from './GridToggle.module.css';

interface GridToggleProps {
  label: string;
  checked: boolean;
  onLabel: string;
  offLabel: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export const GridToggle: React.FC<GridToggleProps> = ({
  label,
  checked,
  onLabel,
  offLabel,
  disabled = false,
  onChange,
}) => (
  <div className={styles.block}>
    <span className={styles.label}>{label}:</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cx(styles.switch, checked && styles.checked)}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
      <span className={styles.text}>{checked ? onLabel : offLabel}</span>
    </button>
  </div>
);
