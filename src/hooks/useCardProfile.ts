import { useProfileState } from './useProfileState';
import { useProfileTransfer } from './useProfileTransfer';
import { useProfiles } from './useProfiles';

export function useCardProfile() {
  const state = useProfileState();
  const transfer = useProfileTransfer(state);
  const profiles = useProfiles(state);

  return {
    ...state,
    ...transfer,
    ...profiles,
  };
}

export type CardProfile = ReturnType<typeof useCardProfile>;
