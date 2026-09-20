import * as firestoreImpl from './tournaments';
import * as localImpl from './localTournaments';
import { isGuestTournamentId } from './localTournaments';
import type { CreateTournamentInput } from './tournaments';
import type { Tournament } from '../types';

/**
 * Routes each call to the Firestore backend or the local (guest-mode) backend, so screens
 * only ever import from here and don't need to know which one is active. Dispatch is
 * stateless: a guest's teams/tournament IDs are self-describing (createdBy 'guest', ID
 * prefixed with GUEST_ID_PREFIX), so no extra flags need to be threaded through.
 */
export async function createTournament(input: CreateTournamentInput): Promise<string> {
  if (input.createdBy === 'guest') return localImpl.createTournament(input);
  return firestoreImpl.createTournament(input);
}

export function listenTournament(id: string, callback: (tournament: Tournament | null) => void): () => void {
  if (isGuestTournamentId(id)) return localImpl.listenTournament(id, callback);
  return firestoreImpl.listenTournament(id, callback);
}

export function listenMyTournaments(uid: string, callback: (tournaments: Tournament[]) => void): () => void {
  if (uid === 'guest') return localImpl.listenMyTournaments(uid, callback);
  return firestoreImpl.listenMyTournaments(uid, callback);
}

export async function updateGroupMatchScore(
  tournamentId: string,
  groupId: string,
  matchId: string,
  scoreA: number[],
  scoreB: number[]
): Promise<void> {
  if (isGuestTournamentId(tournamentId)) {
    return localImpl.updateGroupMatchScore(tournamentId, groupId, matchId, scoreA, scoreB);
  }
  return firestoreImpl.updateGroupMatchScore(tournamentId, groupId, matchId, scoreA, scoreB);
}

export async function startKnockoutStage(tournamentId: string): Promise<void> {
  if (isGuestTournamentId(tournamentId)) return localImpl.startKnockoutStage(tournamentId);
  return firestoreImpl.startKnockoutStage(tournamentId);
}

export async function updateKnockoutMatchScore(
  tournamentId: string,
  matchId: string,
  scoreA: number[],
  scoreB: number[]
): Promise<void> {
  if (isGuestTournamentId(tournamentId)) {
    return localImpl.updateKnockoutMatchScore(tournamentId, matchId, scoreA, scoreB);
  }
  return firestoreImpl.updateKnockoutMatchScore(tournamentId, matchId, scoreA, scoreB);
}

// Join-by-code and the global leaderboard are inherently online/shared features - guests
// never reach these (the UI hides them), so they always go straight to Firestore.
export const findTournamentIdByCode = firestoreImpl.findTournamentIdByCode;
export const fetchLeaderboard = firestoreImpl.fetchLeaderboard;
export type { CreateTournamentInput } from './tournaments';
