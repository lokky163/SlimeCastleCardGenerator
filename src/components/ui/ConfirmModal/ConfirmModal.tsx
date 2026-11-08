import type { ReactNode } from 'react';
import { cx } from '../../../utils/classNames';
import { Modal } from '../Modal/Modal';
import modalStyles from '../Modal/Modal.module.css';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const WarningIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Отмена',
  danger = true,
  onCancel,
  onConfirm,
}) => (
  <Modal open={open} onClose={onCancel} className={styles.dialog}>
    <h3 className={styles.title}>
      <span className={styles.icon} aria-hidden="true">
        <WarningIcon />
      </span>
      {title}
    </h3>
    <p className={styles.text}>{children}</p>
    <div className={styles.actions}>
      <button
        type="button"
        className={cx(modalStyles.actionBtn, modalStyles.secondaryBtn)}
        onClick={onCancel}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        className={cx(
          modalStyles.actionBtn,
          danger ? styles.dangerBtn : modalStyles.primaryBtn,
        )}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);
