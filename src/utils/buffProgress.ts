import { BUFF_STATS, type BuffData } from '../models/buff';

const PHASE_TWO_TYPES = new Set(['ATK', 'HP', 'CritRes']);

const isPhaseTwoType = (buff: BuffData) => PHASE_TWO_TYPES.has(buff.type);

export function isPhaseOneComplete(buffs: BuffData[]): boolean {
  return buffs
    .filter((buff) => !isPhaseTwoType(buff))
    .every((buff) => buff.percentage >= 100);
}

function averagePercentage(buffs: BuffData[]): number {
  if (buffs.length === 0) return 0;
  const total = buffs.reduce((sum, buff) => sum + buff.percentage, 0);
  return total / buffs.length;
}

export function getActivePhaseInfo(buffs: BuffData[]): { phase: number; percent: number } {
  const phase = isPhaseOneComplete(buffs) ? 2 : 1;
  const phaseBuffs = buffs.filter((buff) => (phase === 2) === isPhaseTwoType(buff));
  return { phase, percent: averagePercentage(phaseBuffs) };
}

function getRemainingSteps(buff: BuffData) {
  const stats = BUFF_STATS[buff.type];
  const remaining = Math.max(0, stats.maxObtainable - buff.value);
  const averageRoll = (stats.min + stats.max) / 2;

  return {
    min: remaining / stats.max,
    max: remaining / stats.min,
    avg: remaining / averageRoll,
  };
}

export function calculateRemainingThrows(
  buffs: BuffData[],
): { min: number; avg: number; max: number } {
  const phaseOneDone = isPhaseOneComplete(buffs);
  const isTarget = (buff: BuffData) => phaseOneDone === isPhaseTwoType(buff);

  const targets = buffs.filter((buff) => isTarget(buff) && buff.percentage < 100);
  const companions = phaseOneDone
    ? []
    : buffs.filter((buff) => isPhaseTwoType(buff) && buff.percentage < 100);

  if (targets.length === 0) return { min: 0, avg: 0, max: 0 };

  const sums = targets.reduce(
    (total, buff) => {
      const steps = getRemainingSteps(buff);
      return {
        min: total.min + steps.min,
        avg: total.avg + steps.avg,
        max: total.max + steps.max,
      };
    },
    { min: 0, avg: 0, max: 0 },
  );

  const poolModifier = (targets.length + companions.length) / targets.length;

  return {
    min: Math.ceil(sums.min * poolModifier),
    avg: Math.ceil(sums.avg * poolModifier),
    max: Math.ceil(sums.max * poolModifier),
  };
}
