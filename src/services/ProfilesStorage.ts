import { createEmptyProfile } from './profileDefaults';
import {
  LEGACY_PROFILE_STORAGE_KEY,
  PROFILES_STORAGE_KEY,
  type ProfilesStore,
} from './ProfilesSchema';
import {
  parseLegacyProfile,
  parseProfilesStore,
} from './ProfilesSerialization';

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function loadProfiles(): ProfilesStore {
  const saved = readStorage(PROFILES_STORAGE_KEY);
  if (saved) {
    const store = parseProfilesStore(saved);
    if (store) return store;
  }

  const legacy = readStorage(LEGACY_PROFILE_STORAGE_KEY);
  if (legacy) {
    const profile = parseLegacyProfile(legacy);
    if (profile) {
      try {
        localStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY);
      } catch {
        // Миграция всё равно продолжится: старый ключ просто останется в браузере.
      }
      return { version: 1, activeIndex: 0, profiles: [profile] };
    }
  }

  return { version: 1, activeIndex: 0, profiles: [createEmptyProfile()] };
}

export function saveProfiles(store: ProfilesStore): void {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Не удалось сохранить профили:', error);
  }
}
