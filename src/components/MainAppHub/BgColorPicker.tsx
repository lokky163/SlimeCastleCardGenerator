import { cx } from '../../utils/classNames';
import { useI18n } from '../../i18n/I18nProvider';
import { Tooltip } from '../ui/Tooltip/Tooltip';
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
          <Tooltip key={color} label={color.toUpperCase()} placement="bottom">
            <button
              type="button"
              aria-label={color}
              className={cx(styles.swatch, value === color && styles.swatchActive)}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          </Tooltip>
        ))}
      </div>

      <Tooltip label={t('Choose custom color')} placement="bottom">
        <input
          type="color"
          value={value}
          aria-label={t('Choose custom color')}
          onChange={(event) => onChange(event.target.value)}
          className={styles.colorInput}
        />
      </Tooltip>
    </div>
  );
};
