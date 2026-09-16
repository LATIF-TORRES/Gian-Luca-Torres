import { create } from 'zustand';
import type { Tournament } from '../types';

interface TournamentListState {
  myTournaments: Tournament[];
  loading: boolean;
  setMyTournaments: (tournaments: Tournament[]) => void;
  setLoading: (value: boolean) => void;
}

export const useTournamentStore = create<TournamentListState>((set) => ({
  myTournaments: [],
  loading: true,
  setMyTournaments: (tournaments) => set({ myTournaments: tournaments }),
  setLoading: (value) => set({ loading: value }),
}));
