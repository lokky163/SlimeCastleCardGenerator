export type AppTab = 'relics' | 'slimes' | 'equipment' | 'buffs' | 'artifacts';

export const TAB_LABELS: Record<AppTab, string> = {
  equipment: 'Equipment',
  slimes: 'Slimes',
  relics: 'Relics',
  buffs: 'Buffs',
  artifacts: 'Artifacts',
};

export const TAB_ORDER: AppTab[] = [
  'equipment',
  'slimes',
  'relics',
  'artifacts',
  'buffs',
];
