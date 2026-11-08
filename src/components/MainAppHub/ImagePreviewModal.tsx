import { Modal } from '../ui/Modal/Modal';
import styles from './ImagePreviewModal.module.css';

interface ImagePreviewModalProps {
  image: string | null;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ image, onClose }) => (
  <Modal open={Boolean(image)} onClose={onClose} className={styles.dialog}>
    <div className={styles.text}>
      <h3>Изображение готово!</h3>
      <p>
        Зажмите палец на картинке ниже и выберите <strong>«Сохранить в Фото»</strong>
      </p>
    </div>

    <div className={styles.imageWrapper}>
      {image && <img src={image} alt="Layout Preview" />}
    </div>

    <button type="button" className={styles.closeBtn} onClick={onClose}>
      Закрыть
    </button>
  </Modal>
);
