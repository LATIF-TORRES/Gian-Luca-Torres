import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../types';

/**
 * Guest mode: a fully local "account" with no Firebase project needed at all. The profile
 * lives only in this device's AsyncStorage (localStorage on web) - no login, no server, no
 * payment details, no internet connection required. Tournaments created this way are
 * handled by localTournaments.ts and never leave the device.
 */
const GUEST_PROFILE_KEY = 'padel_guest_profile';
const AVATAR_COLORS = ['#FF6A3D', '#3DDC97', '#C6F135', '#FFD54A', '#5AC8FA', '#FF5470'];

export const GUEST_UID = 'guest';

function createGuestProfile(username: string): UserProfile {
  return {
    uid: GUEST_UID,
    username,
    usernameLower: username.toLowerCase(),
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    avatarUrl: null,
    createdAt: Date.now(),
    stats: { tournamentsPlayed: 0, tournamentsWon: 0, matchesWon: 0, matchesLost: 0 },
    training: { wins: 0, losses: 0 },
  };
}

export async function loadGuestProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export async function saveGuestProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
}

/** Enters (or resumes/renames) the on-device guest session. Never touches Firebase. */
export async function enterGuestMode(username: string): Promise<UserProfile> {
  const existing = await loadGuestProfile();
  const profile: UserProfile = existing
    ? { ...existing, username, usernameLower: username.toLowerCase() }
    : createGuestProfile(username);
  await saveGuestProfile(profile);
  return profile;
}
