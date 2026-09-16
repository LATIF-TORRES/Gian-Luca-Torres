import {
  type DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  advanceBracket,
  allGroupsComplete,
  buildKnockoutBracket,
  createGroups,
  decideWinner,
  generateId,
  generateTournamentCode,
  getMedals,
  orderQualifiers,
} from '../utils/tournamentEngine';
import type { LeaderboardEntry, Team, Tournament } from '../types';

function assertDb() {
  if (!db) {
    throw new Error('Firebase ist noch nicht konfiguriert. Bitte .env-Datei ausfüllen (siehe .env.example).');
  }
  return db;
}

async function findUidByUsername(name: string): Promise<string | null> {
  const database = assertDb();
  const snap = await getDoc(doc(database, 'usernames', name.trim().toLowerCase()));
  return snap.exists() ? ((snap.data().uid as string) ?? null) : null;
}

/**
 * If `name` matches a registered username, returns that player's real avatar so their
 * teams show their actual profile color/3D avatar instead of a generic placeholder.
 */
async function resolvePlayerAvatar(name: string): Promise<{ avatarColor?: string; avatarUrl?: string | null }> {
  const database = assertDb();
  const uid = await findUidByUsername(name);
  if (!uid) return {};
  const snap = await getDoc(doc(database, 'users', uid));
  if (!snap.exists()) return {};
  const data = snap.data();
  return { avatarColor: data.avatarColor, avatarUrl: data.avatarUrl ?? null };
}

async function bumpStats(playerNames: string[], field: 'matchesWon' | 'matchesLost' | 'tournamentsWon', amount = 1) {
  const database = assertDb();
  await Promise.allSettled(
    playerNames.map(async (name) => {
      const uid = await findUidByUsername(name);
      if (!uid) return;
      await updateDoc(doc(database, 'users', uid), { [`stats.${field}`]: increment(amount) });
    })
  );
}

function teamPlayers(team: Team | undefined): string[] {
  if (!team) return [];
  return [team.playerA, team.playerB].filter(Boolean);
}

export interface CreateTournamentInput {
  name: string;
  teams: { name: string; playerA: string; playerB: string }[];
  numGroups: number;
  teamsPerGroupAdvance: number;
  createdBy: string;
  createdByUsername: string;
}

export async function createTournament(input: CreateTournamentInput): Promise<string> {
  const database = assertDb();
  const teams: Team[] = await Promise.all(
    input.teams.map(async (t) => {
      const [avatarA, avatarB] = await Promise.all([resolvePlayerAvatar(t.playerA), resolvePlayerAvatar(t.playerB)]);
      return {
        id: generateId('team'),
        ...t,
        playerAAvatarColor: avatarA.avatarColor ?? null,
        playerAAvatarUrl: avatarA.avatarUrl ?? null,
        playerBAvatarColor: avatarB.avatarColor ?? null,
        playerBAvatarUrl: avatarB.avatarUrl ?? null,
      };
    })
  );
  const groups = createGroups(teams, input.numGroups);
  const code = generateTournamentCode();

  const ref = doc(collection(database, 'tournaments'));
  const tournament: Tournament = {
    id: ref.id,
    name: input.name,
    code,
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

  await setDoc(ref, tournament);
  await setDoc(doc(database, 'tournamentCodes', code), { tournamentId: ref.id });
  return ref.id;
}

export async function findTournamentIdByCode(code: string): Promise<string | null> {
  const database = assertDb();
  const snap = await getDoc(doc(database, 'tournamentCodes', code.trim().toUpperCase()));
  return snap.exists() ? ((snap.data().tournamentId as string) ?? null) : null;
}

export function listenTournament(id: string, callback: (tournament: Tournament | null) => void): () => void {
  const database = assertDb();
  return onSnapshot(doc(database, 'tournaments', id), (snap) => {
    callback(snap.exists() ? (snap.data() as Tournament) : null);
  });
}

export function listenMyTournaments(uid: string, callback: (tournaments: Tournament[]) => void): () => void {
  const database = assertDb();
  const q = query(collection(database, 'tournaments'), where('createdBy', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as Tournament));
  });
}

export async function updateGroupMatchScore(
  tournamentId: string,
  groupId: string,
  matchId: string,
  scoreA: number[],
  scoreB: number[]
): Promise<void> {
  const database = assertDb();
  const ref = doc(database, 'tournaments', tournamentId);
  let playersA: string[] = [];
  let playersB: string[] = [];
  let winnerIsA = false;

  await runTransaction(database, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Turnier nicht gefunden.');
    const tournament = snap.data() as Tournament;
    const group = tournament.groups.find((g) => g.id === groupId);
    if (!group) throw new Error('Gruppe nicht gefunden.');
    const match = group.matches.find((m) => m.id === matchId);
    if (!match || !match.teamAId || !match.teamBId) throw new Error('Match nicht gefunden.');

    const winnerId = decideWinner(match, scoreA, scoreB);
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.winnerId = winnerId;
    match.status = 'completed';

    winnerIsA = winnerId === match.teamAId;
    playersA = teamPlayers(tournament.teams.find((t) => t.id === match.teamAId));
    playersB = teamPlayers(tournament.teams.find((t) => t.id === match.teamBId));

    tx.update(ref, { groups: tournament.groups });
  });

  await Promise.allSettled([
    bumpStats(winnerIsA ? playersA : playersB, 'matchesWon'),
    bumpStats(winnerIsA ? playersB : playersA, 'matchesLost'),
  ]);
}

export async function startKnockoutStage(tournamentId: string): Promise<void> {
  const database = assertDb();
  const ref = doc(database, 'tournaments', tournamentId);

  await runTransaction(database, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Turnier nicht gefunden.');
    const tournament = snap.data() as Tournament;
    if (!allGroupsComplete(tournament.groups)) {
      throw new Error('Noch nicht alle Gruppenspiele wurden eingetragen.');
    }
    const qualifiers = orderQualifiers(tournament.groups, tournament.teamsPerGroupAdvance);
    const knockout = buildKnockoutBracket(qualifiers);
    tx.update(ref, { status: 'knockout', knockout });
  });
}

export async function updateKnockoutMatchScore(
  tournamentId: string,
  matchId: string,
  scoreA: number[],
  scoreB: number[]
): Promise<void> {
  const database = assertDb();
  const ref = doc(database, 'tournaments', tournamentId);
  let playersA: string[] = [];
  let playersB: string[] = [];
  let winnerIsA = false;
  let goldPlayers: string[] = [];
  let justCompleted = false;

  await runTransaction(database, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Turnier nicht gefunden.');
    const tournament = snap.data() as Tournament;
    const match = tournament.knockout.find((m) => m.id === matchId);
    if (!match || !match.teamAId || !match.teamBId) throw new Error('Match nicht gefunden.');

    const winnerId = decideWinner(match, scoreA, scoreB);
    winnerIsA = winnerId === match.teamAId;
    playersA = teamPlayers(tournament.teams.find((t) => t.id === match.teamAId));
    playersB = teamPlayers(tournament.teams.find((t) => t.id === match.teamBId));

    const knockout = advanceBracket(tournament.knockout, matchId, scoreA, scoreB);
    const update: Partial<Tournament> = { knockout };

    const final = knockout.find((m) => m.round === 'Finale');
    if (final?.status === 'completed') {
      const medals = getMedals(knockout);
      update.medals = medals;
      update.status = 'completed';
      justCompleted = true;
      if (medals.gold) {
        goldPlayers = teamPlayers(tournament.teams.find((t) => t.id === medals.gold));
      }
    }

    tx.update(ref, update as DocumentData);
  });

  const statUpdates: Promise<void>[] = [
    bumpStats(winnerIsA ? playersA : playersB, 'matchesWon'),
    bumpStats(winnerIsA ? playersB : playersA, 'matchesLost'),
  ];
  if (justCompleted && goldPlayers.length) {
    statUpdates.push(bumpStats(goldPlayers, 'tournamentsWon'));
  }
  await Promise.allSettled(statUpdates);
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const database = assertDb();
  const q = query(collection(database, 'users'), orderBy('stats.tournamentsWon', 'desc'), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: data.uid,
      username: data.username,
      avatarColor: data.avatarColor,
      avatarUrl: data.avatarUrl ?? null,
      tournamentsWon: data.stats?.tournamentsWon ?? 0,
      matchesWon: data.stats?.matchesWon ?? 0,
      matchesLost: data.stats?.matchesLost ?? 0,
    } satisfies LeaderboardEntry;
  });
}
