import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppTab } from '../components/MainAppHub/tabs';
import {
  buildRouteUrl,
  profileRouteId,
  resolveAppRoute,
  writeRouteUrl,
} from '../services/AppRoute';
import type { CardProfile } from './useCardProfile';

export interface AppRouteController {
  activeTab: AppTab;
  isNotFound: boolean;
  selectTab: (tab: AppTab) => void;
  selectProfile: (index: number) => void;
  recoverRoute: () => void;
}

interface RouteSnapshot {
  profiles: CardProfile['profiles'];
  activeProfileIndex: number;
  activeTab: AppTab;
  isNotFound: boolean;
}

export function useAppRoute(profile: CardProfile): AppRouteController {
  const [activeTab, setActiveTab] = useState<AppTab>('equipment');
  const [isNotFound, setIsNotFound] = useState(false);
  const initializedRef = useRef(false);
  const lastPathRef = useRef('');
  const profileRef = useRef(profile);
  const snapshotRef = useRef<RouteSnapshot>({
    profiles: profile.profiles,
    activeProfileIndex: profile.activeProfileIndex,
    activeTab,
    isNotFound,
  });

  profileRef.current = profile;
  snapshotRef.current = {
    profiles: profile.profiles,
    activeProfileIndex: profile.activeProfileIndex,
    activeTab,
    isNotFound,
  };

  useEffect(() => {
    if (!profile.hydrated) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      const route = resolveAppRoute(profile.profiles);
      if (route.profileIndex === null) {
        setIsNotFound(true);
        lastPathRef.current = window.location.pathname;
        return;
      }

      setActiveTab(route.tab);
      if (route.profileIndex !== profile.activeProfileIndex) {
        profileRef.current.selectProfile(route.profileIndex);
      }
      writeRouteUrl(route.canonicalPath, 'replace');
      lastPathRef.current = route.canonicalPath;
      return;
    }

    if (isNotFound) {
      const retry = resolveAppRoute(profile.profiles);
      if (retry.profileIndex === null) return;
      setIsNotFound(false);
      setActiveTab(retry.tab);
      profileRef.current.selectProfile(retry.profileIndex);
      writeRouteUrl(retry.canonicalPath, 'replace');
      lastPathRef.current = retry.canonicalPath;
      return;
    }

    const current = profile.profiles[profile.activeProfileIndex];
    if (!current) return;

    const path = buildRouteUrl(
      profileRouteId(profile.profiles, profile.activeProfileIndex),
      activeTab,
    );
    if (path === lastPathRef.current) return;

    writeRouteUrl(path, 'replace');
    lastPathRef.current = path;
  }, [
    profile.hydrated,
    profile.profiles,
    profile.activeProfileIndex,
    activeTab,
    isNotFound,
  ]);

  useEffect(() => {
    const onPopState = () => {
      const route = resolveAppRoute(snapshotRef.current.profiles);
      if (route.profileIndex === null) {
        setIsNotFound(true);
        lastPathRef.current = window.location.pathname;
        return;
      }

      setIsNotFound(false);
      setActiveTab(route.tab);
      profileRef.current.selectProfile(route.profileIndex);
      writeRouteUrl(route.canonicalPath, 'replace');
      lastPathRef.current = route.canonicalPath;
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const selectTab = useCallback((tab: AppTab) => {
    setActiveTab(tab);
    const {
      profiles,
      activeProfileIndex,
      isNotFound: missing,
    } = snapshotRef.current;
    if (missing) return;

    const current = profiles[activeProfileIndex];
    if (!current) return;

    const path = buildRouteUrl(profileRouteId(profiles, activeProfileIndex), tab);
    writeRouteUrl(path, 'push');
    lastPathRef.current = path;
  }, []);

  const selectProfile = useCallback((index: number) => {
    const { profiles, activeTab: tab } = snapshotRef.current;
    if (!profiles[index]) return;

    const path = buildRouteUrl(profileRouteId(profiles, index), tab);
    profileRef.current.selectProfile(index);
    setIsNotFound(false);
    writeRouteUrl(path, 'push');
    lastPathRef.current = path;
  }, []);

  const recoverRoute = useCallback(() => setIsNotFound(false), []);

  return { activeTab, isNotFound, selectTab, selectProfile, recoverRoute };
}
