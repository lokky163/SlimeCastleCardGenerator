import { useRef } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cx } from '../../utils/classNames';
import styles from './ProfilesDrawer.module.css';

interface ProfilesFooterProps {
  onExportAll: () => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfilesFooter: React.FC<ProfilesFooterProps> = ({
  onExportAll,
  onImportFile,
}) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.footer}>
      <button
        type="button"
        className={cx(styles.footerBtn, styles.saveAllBtn)}
        onClick={onExportAll}
      >
        {t('Save all')}
      </button>

      <button
        type="button"
        className={cx(styles.footerBtn, styles.loadAllBtn)}
        onClick={() => fileInputRef.current?.click()}
      >
        {t('Load')}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        className={styles.fileInput}
        onChange={onImportFile}
      />
    </div>
  );
};
