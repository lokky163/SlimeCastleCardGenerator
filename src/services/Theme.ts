export type ThemeId = 'dark' | 'light';
export type ThemeIconName = 'sun' | 'moon';

export interface ThemeDefinition {
  id: ThemeId;
  titleKey: string;
  toggleLabelKey: string;
  icon: ThemeIconName;
}

export const THEME_STORAGE_KEY = 'slime_card_theme';
export const DEFAULT_THEME: ThemeId = 'dark';

/**
 * Порядок массива задаёт порядок переключения тем.
 * Чтобы добавить тему, достаточно добавить элемент и палитру в global.css.
 */
export const THEMES: readonly ThemeDefinition[] = [
  {
    id: 'dark',
    titleKey: 'Dark theme',
    toggleLabelKey: 'Switch to dark theme',
    icon: 'moon',
  },
  {
    id: 'light',
    titleKey: 'Light theme',
    toggleLabelKey: 'Switch to light theme',
    icon: 'sun',
  },
];

function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

export function readStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    // Если localStorage недоступен, используем тему по умолчанию.
  }

  return DEFAULT_THEME;
}

export function saveTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Настройка просто не сохранится между сессиями.
  }
}

export function getTheme(theme: ThemeId): ThemeDefinition {
  return THEMES.find((item) => item.id === theme) ?? THEMES[0];
}

export function getNextTheme(theme: ThemeId): ThemeDefinition {
  const index = THEMES.findIndex((item) => item.id === theme);
  const nextIndex = index < 0 ? 0 : (index + 1) % THEMES.length;
  return THEMES[nextIndex];
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.dataset.theme = theme;
}

export function applyStoredTheme(): ThemeId {
  const theme = readStoredTheme();
  applyTheme(theme);
  return theme;
}
