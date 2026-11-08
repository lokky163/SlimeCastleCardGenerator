export type AppTab = 'relics' | 'slimes' | 'equipment' | 'buffs' | 'artifacts';

export const TAB_LABELS: Record<AppTab, string> = {
  equipment: 'Снаряжение',
  slimes: 'Слаймы',
  relics: 'Реликвии',
  buffs: 'Баффы',
  artifacts: 'Артефакты',
};

export const TAB_ORDER: AppTab[] = [
  'equipment',
  'slimes',
  'relics',
  'artifacts',
  'buffs',
];
