import { cx } from '../../utils/classNames';
import { Modal } from '../ui/Modal/Modal';
import modalStyles from '../ui/Modal/Modal.module.css';
import {
  EXPORT_OPTIONS,
  type ExportOption,
  type ExportSettings,
} from './exportSelection';
import styles from './ExportOptionsModal.module.css';

interface ExportOptionsModalProps {
  settings: ExportSettings;
}

interface ExportOptionRowProps {
  option: ExportOption;
  checked: boolean;
  onToggle: (key: ExportOption['key']) => void;
}

const ExportOptionRow: React.FC<ExportOptionRowProps> = ({
  option,
  checked,
  onToggle,
}) => (
  <label className={styles.option}>
    <input
      type="checkbox"
      checked={checked}
      onChange={() => onToggle(option.key)}
    />
    <span>{option.label}</span>
  </label>
);

interface ExportOptionsActionsProps {
  hasSelection: boolean;
  onClose: () => void;
  onExport: () => void;
}

const ExportOptionsActions: React.FC<ExportOptionsActionsProps> = ({
  hasSelection,
  onClose,
  onExport,
}) => (
  <div className={styles.actions}>
    <button
      type="button"
      className={cx(modalStyles.actionBtn, modalStyles.secondaryBtn)}
      onClick={onClose}
    >
      Отмена
    </button>
    <button
      type="button"
      className={cx(modalStyles.actionBtn, modalStyles.primaryBtn)}
      onClick={onExport}
      disabled={!hasSelection}
    >
      Скачать PNG
    </button>
  </div>
);

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({ settings }) => {
  const hasSelection = EXPORT_OPTIONS.some(
    (option) => settings.selection[option.key],
  );

  return (
    <Modal open={settings.isOpen} onClose={settings.close} className={styles.dialog}>
      <div className={styles.header}>
        <h3>Что показать на изображении</h3>
      </div>

      <div className={styles.bulkActions}>
        <button type="button" className={styles.linkBtn} onClick={settings.selectAll}>
          Выбрать всё
        </button>
        <button type="button" className={styles.linkBtn} onClick={settings.clearAll}>
          Снять всё
        </button>
      </div>

      <div className={styles.options}>
        {EXPORT_OPTIONS.map((option) => (
          <ExportOptionRow
            key={option.key}
            option={option}
            checked={settings.selection[option.key]}
            onToggle={settings.toggle}
          />
        ))}
      </div>

      <ExportOptionsActions
        hasSelection={hasSelection}
        onClose={settings.close}
        onExport={settings.exportImage}
      />
    </Modal>
  );
};
