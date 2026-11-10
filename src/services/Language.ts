export type LanguageId = 'ru' | 'en';
export type LanguageFlag = 'ru' | 'gb';

export interface LanguageDefinition {
  id: LanguageId;
  /** Название языка на нём самом. */
  nativeName: string;
  flag: LanguageFlag;
}

export const LANGUAGE_STORAGE_KEY = 'slime_card_language';
export const DEFAULT_LANGUAGE: LanguageId = 'ru';

/**
 * Порядок массива задаёт порядок языков в меню.
 * Чтобы добавить язык, достаточно добавить элемент и переводы в translations.ts.
 */
export const LANGUAGES: readonly LanguageDefinition[] = [
  { id: 'ru', nativeName: 'Русский', flag: 'ru' },
  { id: 'en', nativeName: 'English', flag: 'gb' },
];

function isLanguageId(value: unknown): value is LanguageId {
  return LANGUAGES.some((language) => language.id === value);
}

export function readStoredLanguage(): LanguageId {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguageId(stored)) return stored;
  } catch {
    // Если localStorage недоступен, используем язык по умолчанию.
  }

  return DEFAULT_LANGUAGE;
}

export function saveLanguage(language: LanguageId): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Настройка просто не сохранится между сессиями.
  }
}

export function getLanguage(language: LanguageId): LanguageDefinition {
  return LANGUAGES.find((item) => item.id === language) ?? LANGUAGES[0];
}
