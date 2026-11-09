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

function normalizeProfile(value: unknown): SccProfile | null {
  if (!isRecord(value) || !isRecord(value.settings) || !isRecord(value.modules)) {
    return null;
  }

  return {
    uid: readUid(value.uid),
    playerName: typeof value.playerName === 'string' ? value.playerName : '',
    settings: value.settings as unknown as SccSettings,
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

function normalizeLegacyProfile(value: unknown): SccProfile | null {
  if (!isRecord(value) || !isRecord(value.modules)) return null;

  return {
    uid: createProfileUid(),
    playerName: typeof value.playerName === 'string' ? value.playerName : '',
    settings: isRecord(value.settings)
      ? (value.settings as unknown as SccSettings)
      : {
          bgColor: DEFAULT_CARD_SETTINGS.bgColor,
          exportSelection: { ...DEFAULT_CARD_SETTINGS.exportSelection },
        },
    modules: value.modules as unknown as SccModules,
  };
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

export function parseProfilesFile(fileContent: string): SccProfile[] | null {
  try {
    const parsed = JSON.parse(fileContent) as unknown;
    if (!isRecord(parsed) || parsed.fileType !== PROFILES_FILE_TYPE) return null;

    const profiles = normalizeProfiles(parsed.profiles);
    if (!profiles) return null;
    if (parsed.profileCount !== profiles.length) return null;

    return profiles;
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
    return normalizeLegacyProfile(parsed);
  } catch {
    return null;
  }
}
