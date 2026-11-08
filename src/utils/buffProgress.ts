import { BUFF_STATS, type BuffData } from '../models/buff';

export type BuffPhase = 1 | 2;

export interface RemainingPermabuffs {
  min: number;
  avg: number;
  max: number;
}

export interface PhaseProgress {
  percent: number;
  remaining: RemainingPermabuffs;
}

export interface BuffsProgress {
  active: { phase: BuffPhase; percent: number };
  phaseOne: PhaseProgress;
  phaseTwo: PhaseProgress;
}

const PHASE_TWO_TYPES = new Set(['ATK', 'HP', 'CritRes']);

const ZERO_REMAINING: RemainingPermabuffs = { min: 0, avg: 0, max: 0 };

const isPhaseTwoType = (buff: BuffData) => PHASE_TWO_TYPES.has(buff.type);

const isPhaseType = (buff: BuffData, phase: BuffPhase) =>
  (phase === 2) === isPhaseTwoType(buff);

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

export function getPhasePercent(buffs: BuffData[], phase: BuffPhase): number {
  return averagePercentage(buffs.filter((buff) => isPhaseType(buff, phase)));
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

function calculatePhaseRemaining(
  buffs: BuffData[],
  phase: BuffPhase,
  countCompanions: boolean,
): RemainingPermabuffs {
  const targets = buffs.filter(
    (buff) => isPhaseType(buff, phase) && buff.percentage < 100,
  );
  if (targets.length === 0) return ZERO_REMAINING;

  const companions = countCompanions
    ? buffs.filter(
        (buff) => !isPhaseType(buff, phase) && buff.percentage < 100,
      )
    : [];

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

export function getBuffsProgress(buffs: BuffData[]): BuffsProgress {
  const activePhase: BuffPhase = isPhaseOneComplete(buffs) ? 2 : 1;

  return {
    active: {
      phase: activePhase,
      percent: getPhasePercent(buffs, activePhase),
    },
    phaseOne: {
      percent: getPhasePercent(buffs, 1),
      remaining: calculatePhaseRemaining(buffs, 1, true),
    },
    phaseTwo: {
      percent: getPhasePercent(buffs, 2),
      remaining: calculatePhaseRemaining(buffs, 2, false),
    },
  };
}

