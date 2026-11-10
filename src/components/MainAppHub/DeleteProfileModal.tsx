import { useI18n } from '../../i18n/I18nProvider';
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
}) => {
  const { t } = useI18n();

  return (
    <ConfirmModal
      open={open}
      title={t('Delete profile?')}
      confirmLabel={t('Delete')}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {t('{label} will be deleted permanently.', { label })}
    </ConfirmModal>
  );
};
