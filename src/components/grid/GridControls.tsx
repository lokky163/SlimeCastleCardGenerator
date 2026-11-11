import { useRef, useState } from 'react';
import { cx } from '../../utils/classNames';
import { useI18n } from '../../i18n/I18nProvider';
import { MenuOption } from '../ui/MenuOption/MenuOption';
import { PopupMenu } from '../ui/PopupMenu/PopupMenu';
import type { LayoutMode } from './layout';
import { LAYOUT_MODES } from './layout';
import type { SlotLayoutController } from './useSlotLayout';
import { CounterLabel } from '../CounterLabel';
import { GridToggle } from './GridToggle';
import styles from './GridControls.module.css';

interface GridControlsProps {
  layout: SlotLayoutController;
  children?: React.ReactNode;
}

interface ManualSizeCountersProps {
  rows: number;
  cols: number;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
}

const ManualSizeCounters: React.FC<ManualSizeCountersProps> = ({
  rows,
  cols,
  onRowsChange,
  onColsChange,
}) => {
  const { t } = useI18n();

  return (
    <>
      <CounterLabel
        label={t('Rows in image')}
        min={1}
        max={6}
        value={rows}
        onChange={onRowsChange}
      />
      <CounterLabel
        label={t('Columns in image')}
        min={1}
        max={10}
        value={cols}
        onChange={onColsChange}
      />
    </>
  );
};

interface LayoutModeSelectProps {
  mode: LayoutMode;
  onModeChange: (mode: LayoutMode) => void;
}

const LayoutModeSelect: React.FC<LayoutModeSelectProps> = ({ mode, onModeChange }) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const current = LAYOUT_MODES.find((option) => option.value === mode) ?? LAYOUT_MODES[0];

  const handleSelect = (nextMode: LayoutMode) => {
    onModeChange(nextMode);
    setIsOpen(false);
  };

  return (
    <div className={styles.modeBlock}>
      <span className={styles.modeLabel}>{t('Layout:')}</span>

      <div className={styles.modeDropdown} ref={anchorRef}>
        <button
          type="button"
          className={cx(styles.modeToggle, isOpen && styles.modeToggleOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title={t(current.label)}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className={styles.modeValue}>{t(current.shortLabel)}</span>
          <span className={cx(styles.modeArrow, isOpen && styles.modeArrowUp)} />
        </button>

        <PopupMenu
          open={isOpen}
          onClose={() => setIsOpen(false)}
          anchorRef={anchorRef}
          placement="dropdown"
          className={styles.modeMenu}
        >
          {LAYOUT_MODES.map((option) => (
            <MenuOption
              key={option.value}
              selected={option.value === mode}
              align="start"
              className={cx(
                styles.modeOption,
                option.value === mode && styles.modeOptionActive,
              )}
              onClick={() => handleSelect(option.value)}
            >
              {t(option.label)}
            </MenuOption>
          ))}
        </PopupMenu>
      </div>
    </div>
  );
};

export const GridControls: React.FC<GridControlsProps> = ({ layout, children }) => {
  const { t } = useI18n();
  const customOrder = layout.mode === 'manual';

  return (
    <div className={styles.controls}>
      {!customOrder && (
        <>
          <GridToggle
            label={t('Grid size')}
            checked={layout.autoSize}
            onLabel={t('Auto')}
            offLabel={t('Manual')}
            disabled={layout.mode === 'manual'}
            onChange={layout.setAutoSize}
          />

          {!layout.autoSize && (
            <ManualSizeCounters
              rows={layout.rows}
              cols={layout.cols}
              onRowsChange={layout.setRows}
              onColsChange={layout.setCols}
            />
          )}
        </>
      )}

      <LayoutModeSelect mode={layout.mode} onModeChange={layout.setMode} />

      <GridToggle
        label={t('Card hiding')}
        checked={layout.hideEnabled}
        onLabel={t('Disable hiding')}
        offLabel={t('Enable hiding')}
        onChange={layout.setHideEnabled}
      />

      {children}
    </div>
  );
};
