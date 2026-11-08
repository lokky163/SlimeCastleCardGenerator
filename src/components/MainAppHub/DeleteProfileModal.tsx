import { ConfirmModal } from '../ui/ConfirmModal/ConfirmModal';

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
  <ConfirmModal
    open={open}
    title="Удалить профиль?"
    confirmLabel="Удалить"
    onCancel={onCancel}
    onConfirm={onConfirm}
  >
    {label} будет удалён без возможности восстановления.
  </ConfirmModal>
);
