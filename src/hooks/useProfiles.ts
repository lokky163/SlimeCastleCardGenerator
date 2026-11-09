import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { ExportService } from '../services/ExportService';
import { createProfilePayload } from '../services/ProfileConfig';
import type { SccProfile } from '../services/ProfilesSchema';
import { loadProfiles, saveProfiles } from '../services/ProfilesStorage';
import { createEmptyProfile } from '../services/profileDefaults';
import { applyProfilePayload } from './useProfileTransfer';
import type { ProfileState } from './useProfileState';

export interface ProfilesNotice {
  tone: 'success' | 'error';
  text: string;
}

export interface ProfilesController {
  profiles: SccProfile[];
  activeProfileIndex: number;
  selectProfile: (index: number) => void;
  addProfile: () => void;
  deleteProfile: (index: number) => void;
  moveProfile: (index: number, direction: ProfilesMoveDirection) => void;
  exportAllProfiles: () => void;
  importAllProfilesFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  profilesNotice: ProfilesNotice | null;
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

interface ProfilesContext extends ProfilesHydration {
  state: ProfileState;
  setNotice: Dispatch<SetStateAction<ProfilesNotice | null>>;
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

    const current = createProfilePayload(state);
    setProfiles((previous) => {
      const stored = previous[activeProfileIndex];
      if (!stored || sameProfile(stored, current)) return previous;
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

function syncCurrentProfile(context: ProfilesContext): void {
  const current = createProfilePayload(context.state);
  context.setProfiles((previous) =>
    replaceProfile(previous, context.activeProfileIndex, current),
  );
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
  const { profiles, activeProfileIndex, setProfiles, setActiveProfileIndex } =
    context;
  if (!profiles[index]) return;

  const current = createProfilePayload(context.state);
  const synced = replaceProfile(profiles, activeProfileIndex, current);
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

  const current = createProfilePayload(context.state);
  const synced = replaceProfile(profiles, activeProfileIndex, current);
  const reordered = [...synced];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  let nextActiveIndex = activeProfileIndex;
  if (activeProfileIndex === index) nextActiveIndex = target;
  else if (activeProfileIndex === target) nextActiveIndex = index;

  context.setProfiles(reordered);
  context.setActiveProfileIndex(nextActiveIndex);
  context.setNotice(null);
}

function exportAllProfiles(context: ProfilesContext): void {
  const current = createProfilePayload(context.state);
  const synced = replaceProfile(
    context.profiles,
    context.activeProfileIndex,
    current,
  );

  context.setProfiles(synced);
  ExportService.exportProfiles(synced);
}

function importAllProfilesFile(
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
        text: 'Ошибка при чтении файла профилей',
      });
      return;
    }

    const current = createProfilePayload(context.state);
    context.setProfiles((previous) => [
      ...replaceProfile(previous, context.activeProfileIndex, current),
      ...imported,
    ]);
    context.setNotice({
      tone: 'success',
      text: `Добавлено профилей: ${imported.length}`,
    });
  };
  reader.onerror = () => {
    context.setNotice({ tone: 'error', text: 'Не удалось прочитать файл' });
  };
  reader.readAsText(file);
}

export function useProfiles(state: ProfileState): ProfilesController {
  const hydration = useProfilesHydration(state);
  const [notice, setNotice] = useState<ProfilesNotice | null>(null);

  useProfilesAutosave(state, hydration);
  useProfilesPersistence(hydration);

  const context: ProfilesContext = { state, ...hydration, setNotice };

  return {
    profiles: hydration.profiles,
    activeProfileIndex: hydration.activeProfileIndex,
    selectProfile: (index) => selectProfile(context, index),
    addProfile: () => addProfile(context),
    deleteProfile: (index) => deleteProfile(context, index),
    moveProfile: (index, direction) => moveProfile(context, index, direction),
    exportAllProfiles: () => exportAllProfiles(context),
    importAllProfilesFile: (event) => importAllProfilesFile(context, event),
    profilesNotice: notice,
    clearProfilesNotice: () => setNotice(null),
  };
}
