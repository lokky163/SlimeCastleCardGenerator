import type { LayoutMode } from './layout';
import { LAYOUT_MODES } from './layout';
import { CounterLabel } from '../CounterLabel';
import styles from './GridControls.module.css';

interface GridControlsProps {
  rows: number;
  cols: number;
  mode: LayoutMode;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
  onModeChange: (mode: LayoutMode) => void;
  children?: React.ReactNode;
}

export const GridControls: React.FC<GridControlsProps> = ({
  rows,
  cols,
  mode,
  onRowsChange,
  onColsChange,
  onModeChange,
  children,
}) => (
  <div className={styles.controls}>
    <CounterLabel
      label="Строк на изображении"
      min={1}
      max={6}
      value={rows}
      onChange={onRowsChange}
    />
    <CounterLabel
      label="Столбцов на изображении"
      min={1}
      max={10}
      value={cols}
      onChange={onColsChange}
    />

    <label className={styles.modeBlock}>
      <span className={styles.modeLabel}>Режим сетки:</span>
      <select
        className={styles.modeSelect}
        value={mode}
        onChange={(event) => onModeChange(event.target.value as LayoutMode)}
      >
        {LAYOUT_MODES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>

    {children}
  </div>
);
