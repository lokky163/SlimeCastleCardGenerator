import type { ProfileState } from '../hooks/useProfileState';
import { serializeModules } from './SccSerialization';
import { SCC_FILE_TYPE, SCC_VERSION, type SccPayload } from './SccSchema';
import type { SccProfile } from './ProfilesSchema';

export function createConfigPayload(state: ProfileState): SccPayload {
  return {
    fileType: SCC_FILE_TYPE,
    version: SCC_VERSION,
    playerName: state.playerName.trim(),
    settings: {
      bgColor: state.bgColor,
      exportSelection: state.exportSelection,
    },
    modules: serializeModules(state),
  };
}

export function toProfilePayload(payload: SccPayload): SccProfile {
  return {
    playerName: payload.playerName,
    settings: payload.settings,
    modules: payload.modules,
  };
}

export function createProfilePayload(state: ProfileState): SccProfile {
  return toProfilePayload(createConfigPayload(state));
}
