import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../types';

interface AuthState {
  initializing: boolean;
  firebaseUser: User | null;
  profile: UserProfile | null;
  isGuest: boolean;
  setInitializing: (value: boolean) => void;
  setFirebaseUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setGuest: (value: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  initializing: true,
  firebaseUser: null,
  profile: null,
  isGuest: false,
  setInitializing: (value) => set({ initializing: value }),
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setProfile: (profile) => set({ profile }),
  setGuest: (value) => set({ isGuest: value }),
  reset: () => set({ firebaseUser: null, profile: null, isGuest: false }),
}));
