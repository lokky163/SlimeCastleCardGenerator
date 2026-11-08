import { useRef } from 'react';
import { cx } from '../../utils/classNames';
import { BgColorPicker } from './BgColorPicker';
import styles from './HubHeader.module.css';

interface HeaderActionsProps {
  bgColor: string;
  onBgColorChange: (color: string) => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportConfig: () => void;
  onExportImage: () => void;
  isCollapsed: boolean;
  showCollapseToggle: boolean;
  onToggleCollapsed: () => void;
}

interface ImportConfigButtonProps {
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface CollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const ImportConfigButton: React.FC<ImportConfigButtonProps> = ({ onImportFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onImportFile(event);
    event.target.value = '';
  };

  return (
    <>
      <button
        type="button"
        className={cx(styles.actionBtn, styles.btnImport)}
        onClick={() => fileInputRef.current?.click()}
      >
        Загрузить схему
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className={styles.fileInput}
      />
    </>
  );
};

const CollapseButton: React.FC<CollapseButtonProps> = ({ isCollapsed, onToggle }) => {
  const label = isCollapsed
    ? 'Развернуть верхнюю панель'
    : 'Свернуть верхнюю панель';

  return (
    <button
      type="button"
      className={cx(styles.actionBtn, styles.collapseBtn)}
      aria-expanded={!isCollapsed}
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      <span
        className={cx(
          styles.collapseIcon,
          isCollapsed && styles.collapseIconDown,
        )}
      />
    </button>
  );
};

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  bgColor,
  onBgColorChange,
  onImportFile,
  onExportConfig,
  onExportImage,
  isCollapsed,
  showCollapseToggle,
  onToggleCollapsed,
}) => (
  <div className={styles.toolsContainer}>
    <div className={styles.pickerGroup}>
      <BgColorPicker value={bgColor} onChange={onBgColorChange} />
    </div>

    <div className={styles.actionGroup}>
      <ImportConfigButton onImportFile={onImportFile} />

      <button
        type="button"
        className={cx(styles.actionBtn, styles.btnExport)}
        onClick={onExportConfig}
      >
        Сохранить схему
      </button>

      <div className={styles.pngActions}>
        <button
          type="button"
          className={cx(styles.actionBtn, styles.btnPng)}
          onClick={onExportImage}
        >
          Сохранить изображение
        </button>

        {showCollapseToggle && (
          <CollapseButton isCollapsed={isCollapsed} onToggle={onToggleCollapsed} />
        )}
      </div>
    </div>
  </div>
);
