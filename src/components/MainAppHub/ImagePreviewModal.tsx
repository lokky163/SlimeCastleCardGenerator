import { useI18n } from '../../i18n/I18nProvider';
import { cx } from '../../utils/classNames';
import { Modal } from '../ui/Modal/Modal';
import modalStyles from '../ui/Modal/Modal.module.css';
import styles from './ImagePreviewModal.module.css';

interface ImagePreviewModalProps {
  image: string | null;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ image, onClose }) => {
  const { t } = useI18n();

  return (
    <Modal open={Boolean(image)} onClose={onClose} className={styles.dialog}>
      <div className={styles.text}>
        <h3>{t('Image is ready!')}</h3>
        <p>
          {t('Press and hold the image below and choose')}{' '}
          <strong>{t('“Save to Photos”')}</strong>
        </p>
      </div>

      <div className={styles.imageWrapper}>
        {image && <img src={image} alt={t('Image preview')} />}
      </div>

      <button
        type="button"
        className={cx(modalStyles.actionBtn, modalStyles.primaryBtn, styles.closeBtn)}
        onClick={onClose}
      >
        {t('Close')}
      </button>
    </Modal>
  );
};
