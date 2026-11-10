import { useI18n } from '../../i18n/I18nProvider';
import { cx } from '../../utils/classNames';
import type { ProfileExportKind } from '../../hooks/useProfileExport';
import { Modal } from '../ui/Modal/Modal';
import modalStyles from '../ui/Modal/Modal.module.css';
import styles from './ProfileExportModal.module.css';

interface ProfileExportModalProps {
  kind: ProfileExportKind | null;
  shareNotice: string | null;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export const ProfileExportModal: React.FC<ProfileExportModalProps> = ({
  kind,
  shareNotice,
  onClose,
  onDownload,
  onShare,
}) => {
  const { t } = useI18n();
  const isAll = kind === 'all';

  return (
    <Modal open={kind !== null} onClose={onClose} className={styles.dialog}>
      <div className={styles.text}>
        <h3>{t(isAll ? 'All profiles export' : 'Profile export')}</h3>
        <p>
          {t(
            isAll
              ? 'All profiles will be saved as a single JSON file. Download it or send it to another app. You can load it back with the “Load” button in the profiles menu.'
              : 'The profile will be saved as a JSON file. Download it or send it to another app. You can load it back with the “Load” button in the profiles menu.',
          )}
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={cx(modalStyles.actionBtn, modalStyles.secondaryBtn)}
          onClick={onClose}
        >
          {t('Cancel')}
        </button>

        <button
          type="button"
          className={cx(modalStyles.actionBtn, modalStyles.primaryBtn)}
          onClick={onDownload}
        >
          {t('Download')}
        </button>

        <button
          type="button"
          className={cx(modalStyles.actionBtn, modalStyles.secondaryBtn)}
          onClick={onShare}
        >
          {t('Share')}
        </button>
      </div>

      {shareNotice && (
        <p className={styles.notice} role="status">
          {shareNotice}
        </p>
      )}
    </Modal>
  );
};
