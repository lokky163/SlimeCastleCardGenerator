import { useI18n } from '../../i18n/I18nProvider';
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

  return (
    <label className={styles.modeBlock}>
      <span className={styles.modeLabel}>{t('Missing:')}</span>
      <select
        className={styles.modeSelect}
        value={mode}
        onChange={(event) => onModeChange(event.target.value as LayoutMode)}
      >
        {LAYOUT_MODES.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
    </label>
  );
};

export const GridControls: React.FC<GridControlsProps> = ({ layout, children }) => {
  const { t } = useI18n();

  return (
    <div className={styles.controls}>
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

      <LayoutModeSelect mode={layout.mode} onModeChange={layout.setMode} />

      {layout.mode !== 'manual' && (
        <GridToggle
          label={t('Card hiding')}
          checked={layout.hideEnabled}
          onLabel={t('Disable hiding')}
          offLabel={t('Enable hiding')}
          onChange={layout.setHideEnabled}
        />
      )}

      {children}
    </div>
  );
};
