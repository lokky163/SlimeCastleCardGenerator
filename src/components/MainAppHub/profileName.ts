import type { SccProfile } from '../../services/ProfilesSchema';

export function profileName(profile: SccProfile, emptyLabel: string): string {
  return profile.playerName.trim() || emptyLabel;
}
