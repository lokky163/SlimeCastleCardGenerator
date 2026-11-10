import { useI18n } from '../../i18n/I18nProvider';
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
}) => {
  const { t } = useI18n();

  return (
    <ConfirmModal
      open={open}
      title={t('Reset all values?')}
      confirmLabel={t('Reset')}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {t(
        'All entered values of the current profile will be reset. To keep the current setup, save the profile first.',
      )}
    </ConfirmModal>
  );
};
