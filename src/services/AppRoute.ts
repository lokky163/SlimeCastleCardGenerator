import type { AppTab } from '../components/MainAppHub/tabs';
import { TAB_ORDER } from '../components/MainAppHub/tabs';
import type { SccProfile } from './ProfilesSchema';

export interface ResolvedAppRoute {
  profileIndex: number | null;
  tab: AppTab;
  canonicalPath: string;
}

export type RouteWriteMode = 'push' | 'replace';

const DEFAULT_TAB: AppTab = 'equipment';

function appBaseUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

export function buildRouteUrl(identifier: string, tab: AppTab): string {
  return `${appBaseUrl()}${encodeURIComponent(identifier)}/${tab}`;
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment).trim();
  } catch {
    return segment.trim();
  }
}

function readSegments(pathname: string): string[] {
  const base = appBaseUrl();
  const relative = pathname.startsWith(base) ? pathname.slice(base.length) : '';
  return relative.split('/').filter(Boolean).map(decodeSegment);
}

function isAppTab(value: string): value is AppTab {
  return (TAB_ORDER as readonly string[]).includes(value);
}

function matchesNickname(profile: SccProfile, nicknameKey: string): boolean {
  return profile.playerName.trim().toLowerCase() === nicknameKey;
}

/**
 * Идентификатор профиля для адреса: ник, если он уникален, иначе uid.
 */
export function profileRouteId(profiles: SccProfile[], index: number): string {
  const profile = profiles[index];
  if (!profile) return '';

  const nickname = profile.playerName.trim();
  if (!nickname) return profile.uid;

  const key = nickname.toLowerCase();
  const sameName = profiles.filter((item) => matchesNickname(item, key));
  return sameName.length > 1 ? profile.uid : nickname;
}

function findProfileIndex(
  profiles: SccProfile[],
  identifier: string,
): number {
  const byUid = profiles.findIndex((profile) => profile.uid === identifier);
  if (byUid !== -1) return byUid;

  const nicknameKey = identifier.toLowerCase();
  return profiles.findIndex((profile) => matchesNickname(profile, nicknameKey));
}

export function resolveAppRoute(
  profiles: SccProfile[],
  pathname = window.location.pathname,
): ResolvedAppRoute {
  const [identifier = '', tabSegment = ''] = readSegments(pathname);
  const tab = isAppTab(tabSegment) ? tabSegment : DEFAULT_TAB;

  if (profiles.length === 0) {
    return { profileIndex: null, tab, canonicalPath: '' };
  }

  const profileIndex = identifier
    ? findProfileIndex(profiles, identifier)
    : 0;
  if (profileIndex === -1) {
    return { profileIndex: null, tab, canonicalPath: '' };
  }

  return {
    profileIndex,
    tab,
    canonicalPath: buildRouteUrl(profileRouteId(profiles, profileIndex), tab),
  };
}

export function writeRouteUrl(path: string, mode: RouteWriteMode): void {
  if (!path || path === window.location.pathname) return;

  const method = mode === 'push' ? 'pushState' : 'replaceState';
  window.history[method](null, '', path);
}
