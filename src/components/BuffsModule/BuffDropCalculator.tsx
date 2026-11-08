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
  const selectMode = (mode: DropChanceMode) => onChange({ ...chance, mode });

  return (
    <div className={styles.chanceRow}>
      <span className={styles.calculatorLabel}>Шанс выпадения пермача:</span>

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
          Свой
        </ChanceButton>
      </div>

      {chance.mode === 'custom' && (
        <label className={styles.customChance}>
          <input
            type="text"
            inputMode="decimal"
            aria-label="Свой шанс выпадения пермача, %"
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

function getDropsWord(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return 'капля';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'капли';
  }
  return 'капель';
}

const formatInteger = (value: number) => value.toLocaleString('ru-RU');

interface DropCostsProps {
  multiplier: number;
  phaseOneDrops: number;
  phaseTwoDrops: number;
}

const DropCosts: React.FC<DropCostsProps> = ({
  multiplier,
  phaseOneDrops,
  phaseTwoDrops,
}) => (
  <>
    <div className={styles.multiplier}>
      Множитель капель:{' '}
      <span className={styles.accent}>×{multiplier.toFixed(2)}</span>
      <span className={styles.hint}>
        {' '}
        — в среднем, с гарантом на {DROP_PITY_THRESHOLD}-м ролле
      </span>
    </div>

    <div className={styles.dropCosts}>
      <span>
        До закрытия 1 фазы:{' '}
        <span className={styles.accent}>
          ≈ {formatInteger(phaseOneDrops)} {getDropsWord(phaseOneDrops)}
        </span>
      </span>
      <span>
        До закрытия 2 фазы:{' '}
        <span className={styles.accent}>
          ≈ {formatInteger(phaseTwoDrops)} {getDropsWord(phaseTwoDrops)}
        </span>
      </span>
    </div>
  </>
);

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
