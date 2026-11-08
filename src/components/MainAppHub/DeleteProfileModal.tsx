import { cx } from '../../utils/classNames';
import { Modal } from '../ui/Modal/Modal';
import modalStyles from '../ui/Modal/Modal.module.css';
import styles from './DeleteProfileModal.module.css';

interface DeleteProfileModalProps {
  open: boolean;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteProfileModal: React.FC<DeleteProfileModalProps> = ({
  open,
  label,
  onCancel,
  onConfirm,
}) => (
  <Modal open={open} onClose={onCancel} className={styles.dialog}>
    <h3 className={styles.title}>Удалить профиль?</h3>
    <p className={styles.text}>
      {label} будет удалён без возможности восстановления.
    </p>
    <div className={styles.actions}>
      <button
        type="button"
        className={cx(modalStyles.actionBtn, modalStyles.secondaryBtn)}
        onClick={onCancel}
      >
        Отмена
      </button>
      <button
        type="button"
        className={cx(modalStyles.actionBtn, styles.deleteBtn)}
        onClick={onConfirm}
      >
        Удалить
      </button>
    </div>
  </Modal>
);
