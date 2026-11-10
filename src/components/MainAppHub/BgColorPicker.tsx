import { cx } from '../../utils/classNames';
import { useI18n } from '../../i18n/I18nProvider';
import styles from './HubHeader.module.css';

const BG_PRESETS = ['#9A6E3F', '#16213e', '#1a1a2e'];

interface BgColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const BgColorPicker: React.FC<BgColorPickerProps> = ({ value, onChange }) => {
  const { t } = useI18n();

  return (
    <div className={styles.pickerBlock}>
      <span className={styles.pickerLabel}>{t('PNG background:')}</span>

      <div className={styles.swatches}>
        {BG_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            className={cx(styles.swatch, value === color && styles.swatchActive)}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>

      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={styles.colorInput}
        title={t('Choose custom color')}
      />
    </div>
  );
};
