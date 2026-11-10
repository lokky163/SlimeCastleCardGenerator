import { cx } from '../../utils/classNames';
import { useI18n } from '../../i18n/I18nProvider';
import { Tooltip } from '../ui/Tooltip/Tooltip';
import { BgColorPicker } from './BgColorPicker';
import styles from './HubHeader.module.css';

interface HeaderActionsProps {
  bgColor: string;
  onBgColorChange: (color: string) => void;
  onExportProfile: () => void;
  onExportImage: () => void;
  isCollapsed: boolean;
  showCollapseToggle: boolean;
  onToggleCollapsed: () => void;
}

interface CollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const CollapseButton: React.FC<CollapseButtonProps> = ({ isCollapsed, onToggle }) => {
  const { t } = useI18n();
  const label = t(isCollapsed ? 'Expand top panel' : 'Collapse top panel');

  return (
    <Tooltip label={label} placement="bottom" align="end">
      <button
        type="button"
        className={cx(styles.actionBtn, styles.collapseBtn)}
        aria-expanded={!isCollapsed}
        aria-label={label}
        onClick={onToggle}
      >
        <span
          className={cx(
            styles.collapseIcon,
            isCollapsed && styles.collapseIconDown,
          )}
        />
      </button>
    </Tooltip>
  );
};

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  bgColor,
  onBgColorChange,
  onExportProfile,
  onExportImage,
  isCollapsed,
  showCollapseToggle,
  onToggleCollapsed,
}) => {
  const { t } = useI18n();

  return (
    <div className={styles.toolsContainer}>
      <div className={styles.pickerGroup}>
        <BgColorPicker value={bgColor} onChange={onBgColorChange} />
      </div>

      <div className={styles.actionGroup}>
        <button
          type="button"
          className={cx(styles.actionBtn, styles.btnExport)}
          onClick={onExportProfile}
        >
          {t('Save profile')}
        </button>

        <div className={styles.pngActions}>
          <button
            type="button"
            className={cx(styles.actionBtn, styles.btnPng)}
            onClick={onExportImage}
          >
            {t('Save image')}
          </button>

          {showCollapseToggle && (
            <CollapseButton isCollapsed={isCollapsed} onToggle={onToggleCollapsed} />
          )}
        </div>
      </div>
    </div>
  );
};
