import { DEFAULT_CARD_SETTINGS } from '../models/cardSettings';
import {
  SCC_FILE_TYPE,
  type SccModules,
  type SccSettings,
} from './SccSchema';
import {
  PROFILES_FILE_TYPE,
  PROFILES_VERSION,
  createProfileUid,
  type ProfilesFile,
  type ProfilesStore,
  type SccProfile,
} from './ProfilesSchema';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readUid(value: unknown): string {
  if (typeof value !== 'string') return createProfileUid();

  const uid = value.trim();
  return uid || createProfileUid();
}

function readSettings(value: unknown): SccSettings {
  if (isRecord(value)) return value as unknown as SccSettings;

  return {
    bgColor: DEFAULT_CARD_SETTINGS.bgColor,
    exportSelection: { ...DEFAULT_CARD_SETTINGS.exportSelection },
  };
}

function normalizeProfile(value: unknown): SccProfile | null {
  if (!isRecord(value) || !isRecord(value.modules)) return null;

  return {
    uid: readUid(value.uid),
    playerName: typeof value.playerName === 'string' ? value.playerName : '',
    settings: readSettings(value.settings),
    modules: value.modules as unknown as SccModules,
  };
}

function normalizeProfiles(value: unknown): SccProfile[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const profiles: SccProfile[] = [];
  for (const item of value) {
    const profile = normalizeProfile(item);
    if (!profile) return null;
    profiles.push(profile);
  }
  return profiles;
}

export function createProfilesFile(profiles: SccProfile[]): ProfilesFile {
  return {
    fileType: PROFILES_FILE_TYPE,
    version: PROFILES_VERSION,
    exportDate: new Date().toISOString(),
    profileCount: profiles.length,
    profiles,
  };
}

function hasValidProfileCount(parsed: Record<string, unknown>, count: number): boolean {
  return typeof parsed.profileCount !== 'number' || parsed.profileCount === count;
}

/**
 * Читает как файл всех профилей, так и одиночный профиль.
 * Профилям без uid uid генерируется при нормализации.
 */
export function parseProfilesContent(fileContent: string): SccProfile[] | null {
  try {
    const parsed = JSON.parse(fileContent) as unknown;
    if (!isRecord(parsed)) return null;

    if (parsed.fileType === PROFILES_FILE_TYPE) {
      const profiles = normalizeProfiles(parsed.profiles);
      if (!profiles || !hasValidProfileCount(parsed, profiles.length)) {
        return null;
      }
      return profiles;
    }

    if (parsed.fileType === SCC_FILE_TYPE) {
      const profile = normalizeProfile(parsed);
      return profile ? [profile] : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function parseProfilesStore(fileContent: string): ProfilesStore | null {
  try {
    const parsed = JSON.parse(fileContent) as unknown;
    if (!isRecord(parsed) || parsed.version !== 1) return null;

    const profiles = normalizeProfiles(parsed.profiles);
    if (!profiles) return null;

    const rawIndex =
      typeof parsed.activeIndex === 'number' ? Math.trunc(parsed.activeIndex) : 0;
    const activeIndex = Math.min(Math.max(rawIndex, 0), profiles.length - 1);

    return { version: 1, activeIndex, profiles };
  } catch {
    return null;
  }
}

export function parseLegacyProfile(fileContent: string): SccProfile | null {
  try {
    const parsed = JSON.parse(fileContent) as unknown;
    if (!isRecord(parsed) || parsed.fileType !== SCC_FILE_TYPE) return null;
    return normalizeProfile(parsed);
  } catch {
    return null;
  }
}
