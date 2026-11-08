/** Chance and pity math for permanent buff drops. */
export const DROP_PITY_THRESHOLD = 30;

export const DROP_CHANCE_PRESETS = {
  base: 4.5,
  x2: 9,
} as const;

export type DropChanceMode = 'base' | 'x2' | 'custom';

export interface DropChanceSelection {
  mode: DropChanceMode;
  /** Raw custom input, percent. Kept as a string so commas and empty values are allowed. */
  custom: string;
}

export const DEFAULT_DROP_CHANCE: DropChanceSelection = {
  mode: 'base',
  custom: '4.5',
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function resolveDropChancePercent(
  selection: DropChanceSelection,
): number {
  if (selection.mode === 'base') return DROP_CHANCE_PRESETS.base;
  if (selection.mode === 'x2') return DROP_CHANCE_PRESETS.x2;

  const parsed = Number.parseFloat(selection.custom.replace(',', '.'));
  if (!Number.isFinite(parsed)) return DROP_CHANCE_PRESETS.base;

  return clamp(parsed, 0, 100);
}

/**
 * Expected drops per one permanent buff.
 *
 * A drop is guaranteed on the 30th consecutive failure, so the success
 * probability on attempt k is p for k < 30 and 1 for k = 30, which gives
 * the sum of survival probabilities: (1 - (1 - p)^30) / p.
 */
export function calculateDropMultiplier(chancePercent: number): number {
  const probability = clamp(chancePercent, 0, 100) / 100;
  if (probability <= 0) return DROP_PITY_THRESHOLD;
  if (probability >= 1) return 1;

  return (1 - Math.pow(1 - probability, DROP_PITY_THRESHOLD)) / probability;
}

export function calculateDropsNeeded(
  permabuffs: number,
  chancePercent: number,
): number {
  if (!Number.isFinite(permabuffs) || permabuffs <= 0) return 0;
  return Math.ceil(permabuffs * calculateDropMultiplier(chancePercent));
}
