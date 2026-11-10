import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useI18n } from '../i18n/I18nProvider';
import type { NoticeData } from '../models/notice';
import { ExportService } from '../services/ExportService';
import { createProfilePayload } from '../services/ProfileConfig';
import type { SccProfile } from '../services/ProfilesSchema';
import { loadProfiles, saveProfiles } from '../services/ProfilesStorage';
import { createEmptyProfile } from '../services/profileDefaults';
import { useProfileHistory } from './useProfileHistory';
import { applyProfilePayload } from './useProfileTransfer';
import type { ProfileState } from './useProfileState';

export interface ProfilesController {
  profiles: SccProfile[];
  activeProfileIndex: number;
  hydrated: boolean;
  selectProfile: (index: number) => void;
  addProfile: () => void;
  deleteProfile: (index: number) => void;
  moveProfile: (index: number, direction: ProfilesMoveDirection) => void;
  exportProfile: () => void;
  exportAllProfiles: () => void;
  importProfilesFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  profilesNotice: NoticeData | null;
  clearProfilesNotice: () => void;
}

export type ProfilesMoveDirection = 'up' | 'down';

interface ProfilesHydration {
  profiles: SccProfile[];
  setProfiles: Dispatch<SetStateAction<SccProfile[]>>;
  activeProfileIndex: number;
  setActiveProfileIndex: Dispatch<SetStateAction<number>>;
  hydrated: boolean;
}

type Translate = ReturnType<typeof useI18n>['t'];

interface ProfilesContext extends ProfilesHydration {
  state: ProfileState;
  setNotice: Dispatch<SetStateAction<NoticeData | null>>;
  t: Translate;
}

function replaceProfile(
  profiles: SccProfile[],
  index: number,
  profile: SccProfile,
): SccProfile[] {
  return profiles.map((item, itemIndex) =>
    itemIndex === index ? profile : item,
  );
}

function sameProfile(left: SccProfile, right: SccProfile): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function useProfilesHydration(state: ProfileState): ProfilesHydration {
  const [profiles, setProfiles] = useState<SccProfile[]>(() => [
    createEmptyProfile(),
  ]);
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const stored = loadProfiles();
    const activeIndex = Math.min(
      stored.activeIndex,
      stored.profiles.length - 1,
    );
    setProfiles(stored.profiles);
    setActiveProfileIndex(activeIndex);
    applyProfilePayload(stored.profiles[activeIndex], state);
    setHydrated(true);
  }, [state]);

  return {
    profiles,
    setProfiles,
    activeProfileIndex,
    setActiveProfileIndex,
    hydrated,
  };
}

function useProfilesAutosave(
  state: ProfileState,
  hydration: ProfilesHydration,
): void {
  const { setProfiles, activeProfileIndex, hydrated } = hydration;

  useEffect(() => {
    if (!hydrated) return;

    setProfiles((previous) => {
      const stored = previous[activeProfileIndex];
      if (!stored) return previous;

      const current = createProfilePayload(state, stored.uid);
      if (sameProfile(stored, current)) return previous;
      return replaceProfile(previous, activeProfileIndex, current);
    });
  }, [state, setProfiles, activeProfileIndex, hydrated]);
}

function useProfilesPersistence(hydration: ProfilesHydration): void {
  const { profiles, activeProfileIndex, hydrated } = hydration;

  useEffect(() => {
    if (!hydrated) return;
    saveProfiles({ version: 1, activeIndex: activeProfileIndex, profiles });
  }, [profiles, activeProfileIndex, hydrated]);
}

function syncCurrentProfile(context: ProfilesContext): SccProfile[] {
  const current = context.profiles[context.activeProfileIndex];
  if (!current) return context.profiles;

  const synced = replaceProfile(
    context.profiles,
    context.activeProfileIndex,
    createProfilePayload(context.state, current.uid),
  );
  context.setProfiles(synced);
  return synced;
}

function selectProfile(context: ProfilesContext, index: number): void {
  const { profiles, activeProfileIndex, setActiveProfileIndex, state, setNotice } =
    context;
  if (index === activeProfileIndex || !profiles[index]) return;

  syncCurrentProfile(context);
  setActiveProfileIndex(index);
  applyProfilePayload(profiles[index], state);
  setNotice(null);
}

function addProfile(context: ProfilesContext): void {
  const { profiles, setProfiles, setActiveProfileIndex, state, setNotice } =
    context;
  const empty = createEmptyProfile();

  syncCurrentProfile(context);
  setProfiles((previous) => [...previous, empty]);
  setActiveProfileIndex(profiles.length);
  applyProfilePayload(empty, state);
  setNotice(null);
}

function deleteProfile(context: ProfilesContext, index: number): void {
  const { activeProfileIndex, setProfiles, setActiveProfileIndex } = context;
  if (!context.profiles[index]) return;

  const synced = syncCurrentProfile(context);
  const remaining = synced.filter((_, itemIndex) => itemIndex !== index);

  if (remaining.length === 0) {
    const empty = createEmptyProfile();
    setProfiles([empty]);
    setActiveProfileIndex(0);
    applyProfilePayload(empty, context.state);
  } else {
    if (index <= activeProfileIndex) {
      const nextIndex =
        index < activeProfileIndex
          ? activeProfileIndex - 1
          : Math.min(index, remaining.length - 1);
      setActiveProfileIndex(nextIndex);
      applyProfilePayload(remaining[nextIndex], context.state);
    }
    setProfiles(remaining);
  }
  context.setNotice(null);
}

function moveProfile(
  context: ProfilesContext,
  index: number,
  direction: ProfilesMoveDirection,
): void {
  const target = direction === 'up' ? index - 1 : index + 1;
  const { profiles, activeProfileIndex } = context;
  if (!profiles[index] || !profiles[target]) return;

  const synced = syncCurrentProfile(context);
  const reordered = [...synced];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  let nextActiveIndex = activeProfileIndex;
  if (activeProfileIndex === index) nextActiveIndex = target;
  else if (activeProfileIndex === target) nextActiveIndex = index;

  context.setProfiles(reordered);
  context.setActiveProfileIndex(nextActiveIndex);
  context.setNotice(null);
}

function exportProfile(context: ProfilesContext): void {
  const synced = syncCurrentProfile(context);
  const profile = synced[context.activeProfileIndex];
  if (profile) ExportService.exportProfile(profile);
}

function exportAllProfiles(context: ProfilesContext): void {
  const synced = syncCurrentProfile(context);
  ExportService.exportProfiles(synced);
}

interface MergedProfiles {
  profiles: SccProfile[];
  added: number;
  updated: number;
}

function mergeProfiles(
  existing: SccProfile[],
  imported: SccProfile[],
): MergedProfiles {
  const profiles = [...existing];
  const indexByUid = new Map(
    profiles.map((profile, index) => [profile.uid, index]),
  );
  let added = 0;
  let updated = 0;

  for (const profile of imported) {
    const index = indexByUid.get(profile.uid);
    if (index === undefined) {
      indexByUid.set(profile.uid, profiles.length);
      profiles.push(profile);
      added += 1;
    } else {
      profiles[index] = profile;
      updated += 1;
    }
  }

  return { profiles, added, updated };
}

function createImportNotice(
  importedCount: number,
  added: number,
  updated: number,
  activeUpdated: boolean,
  t: Translate,
): NoticeData {
  const lines: string[] = [];
  if (added > 0) lines.push(t('Added: {count}', { count: added }));
  if (updated > 0) lines.push(t('Updated: {count}', { count: updated }));
  if (activeUpdated) {
    lines.push(t('The active profile was updated from the file.'));
  }

  return {
    tone: 'success',
    title: t(importedCount === 1 ? 'Profile loaded' : 'Profiles loaded'),
    text: lines.join('\n'),
  };
}

function importProfilesFile(
  context: ProfilesContext,
  event: React.ChangeEvent<HTMLInputElement>,
): void {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const content = loadEvent.target?.result;
    const imported =
      typeof content === 'string' ? ExportService.importProfiles(content) : null;
    if (!imported) {
      context.setNotice({
        tone: 'error',
        title: context.t('Could not load profile'),
        text: context.t('The file is damaged or has an unsupported format.'),
      });
      return;
    }

    const synced = syncCurrentProfile(context);
    const merged = mergeProfiles(synced, imported);
    const activeProfile = synced[context.activeProfileIndex];
    const activeUpdated = Boolean(
      activeProfile &&
        imported.some((profile) => profile.uid === activeProfile.uid),
    );

    context.setProfiles(merged.profiles);
    if (activeUpdated) {
      const mergedActive = merged.profiles[context.activeProfileIndex];
      if (mergedActive) applyProfilePayload(mergedActive, context.state);
    }
    context.setNotice(
      createImportNotice(
        imported.length,
        merged.added,
        merged.updated,
        activeUpdated,
        context.t,
      ),
    );
  };
  reader.onerror = () => {
    context.setNotice({
      tone: 'error',
      title: context.t('Could not read file'),
      text: context.t('Try selecting the file again.'),
    });
  };
  reader.readAsText(file);
}

export function useProfiles(state: ProfileState): ProfilesController {
  const { t } = useI18n();
  const hydration = useProfilesHydration(state);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  useProfilesAutosave(state, hydration);
  useProfilesPersistence(hydration);
  const history = useProfileHistory(
    state,
    hydration.profiles[hydration.activeProfileIndex],
    hydration.hydrated,
  );

  const context: ProfilesContext = { state, ...hydration, setNotice, t };

  return {
    profiles: hydration.profiles,
    activeProfileIndex: hydration.activeProfileIndex,
    hydrated: hydration.hydrated,
    selectProfile: (index) => selectProfile(context, index),
    addProfile: () => addProfile(context),
    deleteProfile: (index) => deleteProfile(context, index),
    moveProfile: (index, direction) => moveProfile(context, index, direction),
    exportProfile: () => exportProfile(context),
    exportAllProfiles: () => exportAllProfiles(context),
    importProfilesFile: (event) => importProfilesFile(context, event),
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    profilesNotice: notice,
    clearProfilesNotice: () => setNotice(null),
  };
}
