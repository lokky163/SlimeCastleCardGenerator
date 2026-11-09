import type { SccModules, SccSettings } from './SccSchema';

export const PROFILES_FILE_TYPE = 'slime-card-profiles';
export const PROFILES_VERSION = '1.1.0';
export const PROFILES_STORAGE_KEY = 'slime_card_profiles_v1';
export const LEGACY_PROFILE_STORAGE_KEY = 'slime_card_profile_autosave';

export function createProfileUid(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface SccProfile {
  uid: string;
  playerName: string;
  settings: SccSettings;
  modules: SccModules;
}

export interface ProfilesFile {
  fileType: typeof PROFILES_FILE_TYPE;
  version: string;
  exportDate: string;
  profileCount: number;
  profiles: SccProfile[];
}

export interface ProfilesStore {
  version: 1;
  activeIndex: number;
  profiles: SccProfile[];
}
