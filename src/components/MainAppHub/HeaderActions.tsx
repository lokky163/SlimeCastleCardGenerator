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
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  bgColor,
  onBgColorChange,
  onImportFile,
  onExportConfig,
  onExportImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onImportFile(event);
    event.target.value = '';
  };

  return (
    <div className={styles.toolsContainer}>
      <BgColorPicker value={bgColor} onChange={onBgColorChange} />

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

      <button
        type="button"
        className={cx(styles.actionBtn, styles.btnExport)}
        onClick={onExportConfig}
      >
        Сохранить схему
      </button>

      <button
        type="button"
        className={cx(styles.actionBtn, styles.btnPng)}
        onClick={onExportImage}
      >
        Сохранить изображение
      </button>
    </div>
  );
};
