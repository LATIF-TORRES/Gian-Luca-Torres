import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  advanceBracket,
  allGroupsComplete,
  buildKnockoutBracket,
  createGroups,
  decideWinner,
  generateId,
  getMedals,
  orderQualifiers,
} from '../utils/tournamentEngine';
import type { Team, Tournament } from '../types';
import type { CreateTournamentInput } from './tournaments';

/**
 * Fully local, device-only tournament backend for guest mode (no Firebase project needed).
 * Mirrors tournaments.ts's function signatures so screens can go through the dataLayer
 * facade without caring which backend actually stores the data. Persists to AsyncStorage
 * (localStorage on web) and notifies subscribers immediately after each write, standing in
 * for Firestore's onSnapshot since everything happens on a single device/session anyway.
 */
const STORAGE_KEY = 'padel_guest_tournaments';
export const GUEST_ID_PREFIX = 'guest_tournament_';

export function isGuestTournamentId(id: string): boolean {
  return id.startsWith(GUEST_ID_PREFIX);
}

let cache: Tournament[] | null = null;
const tournamentSubscribers = new Map<string, Set<(t: Tournament | null) => void>>();
const listSubscribers = new Set<(list: Tournament[]) => void>();

async function loadAll(): Promise<Tournament[]> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Tournament[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function sortedByNewest(list: Tournament[]): Tournament[] {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

async function saveAll(tournaments: Tournament[]): Promise<void> {
  cache = tournaments;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
  const sorted = sortedByNewest(tournaments);
  listSubscribers.forEach((cb) => cb(sorted));
}

function notifyTournament(tournament: Tournament): void {
  tournamentSubscribers.get(tournament.id)?.forEach((cb) => cb(tournament));
}

export async function createTournament(input: CreateTournamentInput): Promise<string> {
  const teams: Team[] = input.teams.map((t) => ({
    id: generateId('team'),
    ...t,
    playerAAvatarColor: null,
    playerAAvatarUrl: null,
    playerBAvatarColor: null,
    playerBAvatarUrl: null,
  }));
  const groups = createGroups(teams, input.numGroups);
  const id = generateId(GUEST_ID_PREFIX);

  const tournament: Tournament = {
    id,
    name: input.name,
    code: '------',
    createdBy: input.createdBy,
    createdByUsername: input.createdByUsername,
    createdAt: Date.now(),
    status: 'groups',
    teamsPerGroupAdvance: input.teamsPerGroupAdvance,
    teams,
    groups,
    knockout: [],
    medals: { gold: null, silver: null, bronze: null },
  };

  const all = await loadAll();
  all.push(tournament);
  await saveAll(all);
  return id;
}

export function listenTournament(id: string, callback: (tournament: Tournament | null) => void): () => void {
  if (!tournamentSubscribers.has(id)) tournamentSubscribers.set(id, new Set());
  tournamentSubscribers.get(id)!.add(callback);
  loadAll().then((all) => callback(all.find((t) => t.id === id) ?? null));
  return () => {
    tournamentSubscribers.get(id)?.delete(callback);
  };
}

export function listenMyTournaments(_uid: string, callback: (tournaments: Tournament[]) => void): () => void {
  listSubscribers.add(callback);
  loadAll().then((all) => callback(sortedByNewest(all)));
  return () => {
    listSubscribers.delete(callback);
  };
}

async function updateTournament(id: string, updater: (tournament: Tournament) => Tournament): Promise<void> {
  const all = await loadAll();
  const index = all.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Turnier nicht gefunden.');
  const updated = updater(all[index]);
  all[index] = updated;
  await saveAll(all);
  notifyTournament(updated);
}

export async function updateGroupMatchScore(
  tournamentId: string,
  groupId: string,
  matchId: string,
  scoreA: number[],
  scoreB: number[]
): Promise<void> {
  await updateTournament(tournamentId, (tournament) => ({
    ...tournament,
    groups: tournament.groups.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        matches: group.matches.map((match) => {
          if (match.id !== matchId || !match.teamAId || !match.teamBId) return match;
          const winnerId = decideWinner(match, scoreA, scoreB);
          return { ...match, scoreA, scoreB, winnerId, status: 'completed' as const };
        }),
      };
    }),
  }));
}

export async function startKnockoutStage(tournamentId: string): Promise<void> {
  await updateTournament(tournamentId, (tournament) => {
    if (!allGroupsComplete(tournament.groups)) {
      throw new Error('Noch nicht alle Gruppenspiele wurden eingetragen.');
    }
    const qualifiers = orderQualifiers(tournament.groups, tournament.teamsPerGroupAdvance);
    const knockout = buildKnockoutBracket(qualifiers);
    return { ...tournament, status: 'knockout', knockout };
  });
}

export async function updateKnockoutMatchScore(
  tournamentId: string,
  matchId: string,
  scoreA: number[],
  scoreB: number[]
): Promise<void> {
  await updateTournament(tournamentId, (tournament) => {
    const knockout = advanceBracket(tournament.knockout, matchId, scoreA, scoreB);
    const final = knockout.find((m) => m.round === 'Finale');
    if (final?.status === 'completed') {
      return { ...tournament, knockout, medals: getMedals(knockout), status: 'completed' as const };
    }
    return { ...tournament, knockout };
  });
}
