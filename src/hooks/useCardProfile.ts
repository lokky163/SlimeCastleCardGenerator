import { useProfileState } from './useProfileState';
import { useProfileStorage } from './useProfileStorage';
import { useProfileTransfer } from './useProfileTransfer';

export function useCardProfile() {
  const state = useProfileState();
  const transfer = useProfileTransfer(state);
  useProfileStorage(state);

  return {
    ...state,
    ...transfer,
  };
}

export type CardProfile = ReturnType<typeof useCardProfile>;
