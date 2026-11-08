import { BUFF_CONFIG, type BuffData } from '../../models/buff';
import styles from './BuffCard.module.css';

interface BuffCardProps {
  buff: BuffData;
  onChangeValue: (value: number) => void;
}

const parseValue = (raw: string) => {
  const parsed = parseFloat(raw.replace(/[^0-9.]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const BuffCard: React.FC<BuffCardProps> = ({ buff, onChangeValue }) => (
  <div className={styles.card}>
    <img
      src={buff.imageUrl}
      alt=""
      className={styles.image}
      style={{ width: BUFF_CONFIG.editor.iconSize, height: BUFF_CONFIG.editor.iconSize }}
    />

    <div
      className={styles.name}
      style={{ fontSize: BUFF_CONFIG.editor.titleFontSize }}
    >
      {buff.cleanName}
    </div>

    <input
      type="text"
      className={styles.input}
      style={{ fontSize: BUFF_CONFIG.editor.valueFontSize }}
      value={buff.value === 0 ? '' : buff.value}
      onChange={(event) => onChangeValue(parseValue(event.target.value))}
      placeholder="0"
    />

    <div className={styles.percentage}>Заполнено: {buff.percentage.toFixed(1)}%</div>

    <div className={styles.progress}>
      <div className={styles.progressFill} style={{ width: `${buff.percentage}%` }} />
    </div>
  </div>
);
