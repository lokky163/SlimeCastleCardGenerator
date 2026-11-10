import { useI18n } from '../../i18n/I18nProvider';
import type { LanguageId } from '../../services/Language';
import { cx } from '../../utils/classNames';
import {
  calculateDropMultiplier,
  calculateDropsNeeded,
  DROP_PITY_THRESHOLD,
  resolveDropChancePercent,
  type DropChanceMode,
  type DropChanceSelection,
} from '../../utils/buffDrops';
import type { RemainingPermabuffs } from '../../utils/buffProgress';
import styles from './BuffsModule.module.css';

interface BuffDropCalculatorProps {
  phaseOne: RemainingPermabuffs;
  phaseTwo: RemainingPermabuffs;
  chance: DropChanceSelection;
  onChanceChange: (chance: DropChanceSelection) => void;
}

interface ChanceButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const ChanceButton: React.FC<ChanceButtonProps> = ({
  active,
  onClick,
  children,
}) => (
  <button
    type="button"
    aria-pressed={active}
    className={cx(styles.chanceBtn, active && styles.chanceBtnActive)}
    onClick={onClick}
  >
    {children}
  </button>
);

interface ChanceSelectorProps {
  chance: DropChanceSelection;
  onChange: (chance: DropChanceSelection) => void;
}

const ChanceSelector: React.FC<ChanceSelectorProps> = ({ chance, onChange }) => {
  const { t } = useI18n();
  const selectMode = (mode: DropChanceMode) => onChange({ ...chance, mode });

  return (
    <div className={styles.chanceRow}>
      <span className={styles.calculatorLabel}>
        {t('Permanent buff drop chance:')}
      </span>

      <div className={styles.chanceButtons}>
        <ChanceButton
          active={chance.mode === 'base'}
          onClick={() => selectMode('base')}
        >
          4.5%
        </ChanceButton>
        <ChanceButton
          active={chance.mode === 'x2'}
          onClick={() => selectMode('x2')}
        >
          9%
        </ChanceButton>
        <ChanceButton
          active={chance.mode === 'custom'}
          onClick={() => selectMode('custom')}
        >
          {t('Custom')}
        </ChanceButton>
      </div>

      {chance.mode === 'custom' && (
        <label className={styles.customChance}>
          <input
            type="text"
            inputMode="decimal"
            aria-label={t('Custom permanent buff drop chance, %')}
            className={styles.chanceInput}
            value={chance.custom}
            onChange={(event) =>
              onChange({ ...chance, custom: event.target.value })
            }
          />
          <span>%</span>
        </label>
      )}
    </div>
  );
};

function formatInteger(language: LanguageId, value: number): string {
  return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US').format(
    value,
  );
}

interface DropsValueProps {
  drops: number;
}

const DropsValue: React.FC<DropsValueProps> = ({ drops }) => {
  const { language, tPlural } = useI18n();

  return (
    <span className={styles.accent}>
      ≈ {formatInteger(language, drops)} {tPlural('Drop', drops)}
    </span>
  );
};

const DropsRow: React.FC<{ label: string; drops: number }> = ({
  label,
  drops,
}) => (
  <span>
    {label} <DropsValue drops={drops} />
  </span>
);

interface DropCostsProps {
  multiplier: number;
  phaseOneDrops: number;
  phaseTwoDrops: number;
}

const DropCosts: React.FC<DropCostsProps> = ({
  multiplier,
  phaseOneDrops,
  phaseTwoDrops,
}) => {
  const { t } = useI18n();

  return (
    <>
      <div className={styles.multiplier}>
        {t('Drop multiplier:')}{' '}
        <span className={styles.accent}>×{multiplier.toFixed(2)}</span>
        <span className={styles.hint}>
          {' '}
          {t('— on average, with pity at roll {roll}', {
            roll: DROP_PITY_THRESHOLD,
          })}
        </span>
      </div>

      <div className={styles.dropCosts}>
        <DropsRow label={t('Until phase 1 is complete:')} drops={phaseOneDrops} />
        <DropsRow label={t('Until phase 2 is complete:')} drops={phaseTwoDrops} />
      </div>
    </>
  );
};

export const BuffDropCalculator: React.FC<BuffDropCalculatorProps> = ({
  phaseOne,
  phaseTwo,
  chance,
  onChanceChange,
}) => {
  const chancePercent = resolveDropChancePercent(chance);

  return (
    <div className={styles.calculator}>
      <ChanceSelector chance={chance} onChange={onChanceChange} />
      <DropCosts
        multiplier={calculateDropMultiplier(chancePercent)}
        phaseOneDrops={calculateDropsNeeded(phaseOne.avg, chancePercent)}
        phaseTwoDrops={calculateDropsNeeded(phaseTwo.avg, chancePercent)}
      />
    </div>
  );
};
