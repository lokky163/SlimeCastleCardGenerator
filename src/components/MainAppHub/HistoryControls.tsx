import { useI18n } from '../../i18n/I18nProvider';
import { Tooltip } from '../ui/Tooltip/Tooltip';
import styles from './HistoryControls.module.css';

interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const UndoIcon: React.FC = () => (
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
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10a5 5 0 0 1 0 10h-3" />
  </svg>
);

const RedoIcon: React.FC = () => (
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
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H10a5 5 0 0 0 0 10h3" />
  </svg>
);

export const HistoryControls: React.FC<HistoryControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const { t } = useI18n();
  const undoLabel = t('Undo (Ctrl+Z)');
  const redoLabel = t('Redo (Ctrl+Shift+Z)');

  return (
    <div className={styles.group}>
      <Tooltip label={undoLabel} placement="bottom">
        <button
          type="button"
          className={styles.toggle}
          aria-label={undoLabel}
          disabled={!canUndo}
          onClick={onUndo}
        >
          <UndoIcon />
        </button>
      </Tooltip>

      <Tooltip label={redoLabel} placement="bottom">
        <button
          type="button"
          className={styles.toggle}
          aria-label={redoLabel}
          disabled={!canRedo}
          onClick={onRedo}
        >
          <RedoIcon />
        </button>
      </Tooltip>
    </div>
  );
};
