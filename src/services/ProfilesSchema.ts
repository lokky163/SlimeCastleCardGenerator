import type { SccModules, SccSettings } from './SccSchema';

export const PROFILES_FILE_TYPE = 'slime-card-profiles';
export const PROFILES_VERSION = '1.0.0';
export const PROFILES_STORAGE_KEY = 'slime_card_profiles_v1';
export const LEGACY_PROFILE_STORAGE_KEY = 'slime_card_profile_autosave';

export interface SccProfile {
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
