import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  readStoredLanguage,
  saveLanguage,
  type LanguageId,
} from '../services/Language';
import {
  translate,
  translatePlural,
  type TranslationParams,
} from './translations';

interface I18nContextValue {
  language: LanguageId;
  setLanguage: (language: LanguageId) => void;
  t: (key: string, params?: TranslationParams) => string;
  tPlural: (key: string, count: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<LanguageId>(readStoredLanguage);

  useLayoutEffect(() => {
    saveLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: string, params?: TranslationParams) =>
      translate(language, key, params),
    [language],
  );

  const tPlural = useCallback(
    (key: string, count: number) =>
      translatePlural(language, key, count),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, tPlural }),
    [language, t, tPlural],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// oxlint-disable-next-line react/only-export-components -- хук живёт рядом с провайдером осознанно.
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}
