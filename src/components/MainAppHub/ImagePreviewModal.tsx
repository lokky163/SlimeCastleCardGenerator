import { useI18n } from '../../i18n/I18nProvider';
import { cx } from '../../utils/classNames';
import { Modal } from '../ui/Modal/Modal';
import modalStyles from '../ui/Modal/Modal.module.css';
import { Tooltip } from '../ui/Tooltip/Tooltip';
import styles from './ImagePreviewModal.module.css';

interface ImagePreviewModalProps {
  image: string | null;
  canShare: boolean;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  canShare,
  onClose,
  onDownload,
  onShare,
}) => {
  const { t } = useI18n();
  const shareLabel = canShare
    ? t('Share')
    : t('Sharing is not supported in this browser');

  return (
    <Modal open={Boolean(image)} onClose={onClose} className={styles.dialog}>
      <div className={styles.text}>
        <h3>{t('Image is ready!')}</h3>
        <p>{t('Download the image or share it with other apps.')}</p>
      </div>

      <div className={styles.imageWrapper}>
        {image && <img src={image} alt={t('Image preview')} />}
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

        <Tooltip label={shareLabel} placement="top" align="end">
          <button
            type="button"
            className={cx(modalStyles.actionBtn, modalStyles.secondaryBtn)}
            aria-label={shareLabel}
            disabled={!canShare}
            onClick={onShare}
          >
            {t('Share')}
          </button>
        </Tooltip>
      </div>
    </Modal>
  );
};
