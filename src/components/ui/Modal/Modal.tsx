import { useEffect, type ReactNode } from 'react';
import { cx } from '../../../utils/classNames';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, className, children }) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={cx(styles.dialog, className)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
