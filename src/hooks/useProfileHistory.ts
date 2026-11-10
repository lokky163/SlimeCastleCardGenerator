import { useEffect, useRef, useState } from 'react';
import { createProfilePayload } from '../services/ProfileConfig';
import type { SccProfile } from '../services/ProfilesSchema';
import type { ProfileState } from './useProfileState';
import { applyProfilePayload } from './useProfileTransfer';

/** How many edit steps are kept for undo. */
const HISTORY_LIMIT = 50;

/** Continuous edits (typing, dragging a color) are merged into one step. */
const COMMIT_DELAY_MS = 400;

/**
 * Changes made by undo/redo must not be recorded as new steps. The window
 * also absorbs the layout sync effects that follow an applied snapshot.
 */
const APPLY_SUPPRESS_MS = 700;

export interface ProfileHistoryController {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

function sameProfile(left: SccProfile, right: SccProfile): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

export function useProfileHistory(
  state: ProfileState,
  activeProfile: SccProfile | undefined,
  hydrated: boolean,
): ProfileHistoryController {
  const pastRef = useRef<SccProfile[]>([]);
  const futureRef = useRef<SccProfile[]>([]);
  const currentRef = useRef<SccProfile | null>(null);
  const uidRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const suppressUntilRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = () => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  };

  useEffect(() => {
    if (!hydrated || !activeProfile) return;

    const uid = activeProfile.uid;
    const snapshot = createProfilePayload(state, uid);

    if (uidRef.current !== uid) {
      uidRef.current = uid;
      pastRef.current = [];
      futureRef.current = [];
      currentRef.current = snapshot;
      suppressUntilRef.current = 0;
      syncFlags();
      return;
    }

    if (Date.now() < suppressUntilRef.current) {
      currentRef.current = snapshot;
      return;
    }

    // A fresh edit invalidates redo immediately, before the debounce fires.
    if (
      currentRef.current &&
      !sameProfile(currentRef.current, snapshot) &&
      futureRef.current.length > 0
    ) {
      futureRef.current = [];
      syncFlags();
    }

    if (timerRef.current !== null) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;

      const previous = currentRef.current;
      currentRef.current = snapshot;
      if (!previous || sameProfile(previous, snapshot)) return;

      pastRef.current = [...pastRef.current, previous].slice(-HISTORY_LIMIT);
      syncFlags();
    }, COMMIT_DELAY_MS);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state, hydrated, activeProfile]);

  const commitPending = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!hydrated || !activeProfile) return;

    const snapshot = createProfilePayload(state, activeProfile.uid);
    if (currentRef.current && currentRef.current.uid !== activeProfile.uid) {
      pastRef.current = [];
      futureRef.current = [];
      currentRef.current = snapshot;
      uidRef.current = activeProfile.uid;
      syncFlags();
      return;
    }

    const previous = currentRef.current;
    currentRef.current = snapshot;
    if (!previous || sameProfile(previous, snapshot)) return;

    pastRef.current = [...pastRef.current, previous].slice(-HISTORY_LIMIT);
    futureRef.current = [];
    syncFlags();
  };

  const undo = () => {
    if (!hydrated || !activeProfile) return;

    commitPending();

    const previous = pastRef.current.pop();
    if (!previous || previous.uid !== activeProfile.uid) return;

    if (currentRef.current) futureRef.current.push(currentRef.current);
    currentRef.current = previous;
    suppressUntilRef.current = Date.now() + APPLY_SUPPRESS_MS;
    applyProfilePayload(previous, state);
    syncFlags();
  };

  const redo = () => {
    if (!hydrated || !activeProfile) return;

    commitPending();

    const next = futureRef.current.pop();
    if (!next || next.uid !== activeProfile.uid) return;

    if (currentRef.current) pastRef.current.push(currentRef.current);
    currentRef.current = next;
    suppressUntilRef.current = Date.now() + APPLY_SUPPRESS_MS;
    applyProfilePayload(next, state);
    syncFlags();
  };

  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  undoRef.current = undo;
  redoRef.current = redo;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      if (event.isComposing || isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undoRef.current();
      } else if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault();
        redoRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { undo, redo, canUndo, canRedo };
}
