import type { NoticeData } from '../../../models/notice';
import { cx } from '../../../utils/classNames';
import { Modal } from '../Modal/Modal';
import modalStyles from '../Modal/Modal.module.css';
import styles from './NoticeModal.module.css';

interface NoticeModalProps {
  notice: NoticeData | null;
  onClose: () => void;
}

const SuccessIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ErrorIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16.5h.01" />
  </svg>
);

export const NoticeModal: React.FC<NoticeModalProps> = ({
  notice,
  onClose,
}) => (
  <Modal open={Boolean(notice)} onClose={onClose} className={styles.dialog}>
    {notice && (
      <>
        <span
          className={cx(
            styles.icon,
            notice.tone === 'error' ? styles.iconError : styles.iconSuccess,
          )}
          aria-hidden="true"
        >
          {notice.tone === 'error' ? <ErrorIcon /> : <SuccessIcon />}
        </span>

        <h3 className={styles.title}>{notice.title}</h3>
        <p className={styles.text}>{notice.text}</p>

        <button
          type="button"
          className={cx(
            modalStyles.actionBtn,
            modalStyles.primaryBtn,
            styles.closeBtn,
          )}
          onClick={onClose}
        >
          Понятно
        </button>
      </>
    )}
  </Modal>
);
