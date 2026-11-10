import { useLayoutEffect, useState } from 'react';
import {
  applyTheme,
  getNextTheme,
  readStoredTheme,
  saveTheme,
  type ThemeId,
} from '../services/Theme';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(readStoredTheme);
  const nextTheme = getNextTheme(theme);

  useLayoutEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  return {
    theme,
    nextTheme,
    toggleTheme: () => setTheme((current) => getNextTheme(current).id),
  };
}
