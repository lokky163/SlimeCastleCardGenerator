import { ConfirmModal } from '../ui/ConfirmModal/ConfirmModal';

interface ResetProfileModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetProfileModal: React.FC<ResetProfileModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => (
  <ConfirmModal
    open={open}
    title="Сбросить все значения?"
    confirmLabel="Сбросить"
    onCancel={onCancel}
    onConfirm={onConfirm}
  >
    Все введённые значения текущего профиля будут сброшены. Чтобы сохранить
    текущую схему, сначала нажмите «Сохранить схему».
  </ConfirmModal>
);
