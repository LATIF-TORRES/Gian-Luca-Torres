import type { Group, Match, StandingRow, Team, Tournament } from '../types';

const ROUND_NAMES: Record<number, string> = {
  1: 'Finale',
  2: 'Halbfinale',
  4: 'Viertelfinale',
  8: 'Achtelfinale',
  16: 'Sechzehntelfinale',
};

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateTournamentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Splits teams evenly into `numGroups` round-robin groups and creates the group-stage matches. */
export function createGroups(teams: Team[], numGroups: number): Group[] {
  const groups: Group[] = Array.from({ length: numGroups }, (_, i) => ({
    id: generateId('group'),
    name: `Gruppe ${String.fromCharCode(65 + i)}`,
    teamIds: [],
    matches: [],
  }));

  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  shuffled.forEach((team, i) => {
    groups[i % numGroups].teamIds.push(team.id);
  });

  for (const group of groups) {
    group.matches = roundRobinMatches(group.teamIds);
  }

  return groups;
}

function roundRobinMatches(teamIds: string[]): Match[] {
  const matches: Match[] = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      matches.push({
        id: generateId('match'),
        round: 'Gruppenphase',
        teamAId: teamIds[i],
        teamBId: teamIds[j],
        scoreA: null,
        scoreB: null,
        winnerId: null,
        status: 'ready',
      });
    }
  }
  return matches;
}

/** Determines the winner of a set-based match. Winner = side that won more sets. */
export function decideWinner(match: Pick<Match, 'teamAId' | 'teamBId'>, scoreA: number[], scoreB: number[]): string | null {
  let setsA = 0;
  let setsB = 0;
  for (let i = 0; i < scoreA.length; i++) {
    if (scoreA[i] > scoreB[i]) setsA++;
    else if (scoreB[i] > scoreA[i]) setsB++;
  }
  if (setsA === setsB) return null;
  return setsA > setsB ? match.teamAId : match.teamBId;
}

export function computeStandings(group: Group): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const teamId of group.teamIds) {
    rows.set(teamId, {
      teamId,
      played: 0,
      wins: 0,
      losses: 0,
      setsFor: 0,
      setsAgainst: 0,
      gamesFor: 0,
      gamesAgainst: 0,
      points: 0,
    });
  }

  for (const match of group.matches) {
    if (match.status !== 'completed' || !match.scoreA || !match.scoreB || !match.teamAId || !match.teamBId) continue;
    const rowA = rows.get(match.teamAId);
    const rowB = rows.get(match.teamBId);
    if (!rowA || !rowB) continue;

    let setsA = 0;
    let setsB = 0;
    for (let i = 0; i < match.scoreA.length; i++) {
      rowA.gamesFor += match.scoreA[i];
      rowA.gamesAgainst += match.scoreB[i];
      rowB.gamesFor += match.scoreB[i];
      rowB.gamesAgainst += match.scoreA[i];
      if (match.scoreA[i] > match.scoreB[i]) setsA++;
      else if (match.scoreB[i] > match.scoreA[i]) setsB++;
    }
    rowA.setsFor += setsA;
    rowA.setsAgainst += setsB;
    rowB.setsFor += setsB;
    rowB.setsAgainst += setsA;
    rowA.played++;
    rowB.played++;

    if (match.winnerId === match.teamAId) {
      rowA.wins++;
      rowA.points += 1;
      rowB.losses++;
    } else if (match.winnerId === match.teamBId) {
      rowB.wins++;
      rowB.points += 1;
      rowA.losses++;
    }
  }

  return Array.from(rows.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.setsFor - a.setsAgainst;
    const diffB = b.setsFor - b.setsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    const gDiffA = a.gamesFor - a.gamesAgainst;
    const gDiffB = b.gamesFor - b.gamesAgainst;
    return gDiffB - gDiffA;
  });
}

export function isGroupComplete(group: Group): boolean {
  return group.matches.every((m) => m.status === 'completed');
}

export function allGroupsComplete(groups: Group[]): boolean {
  return groups.every(isGroupComplete);
}

/** Standard bracket seed order, e.g. for n=8: [1,8,4,5,2,7,3,6]. Adjacent pairs meet in round 1. */
function seedOrder(n: number): number[] {
  if (n === 1) return [1];
  const prev = seedOrder(n / 2);
  const result: number[] = [];
  for (const s of prev) {
    result.push(s, n + 1 - s);
  }
  return result;
}

export function roundNameForSize(size: number): string {
  return ROUND_NAMES[size] ?? `Runde der ${size * 2}`;
}

/**
 * Builds the full single-elimination knockout bracket (including a bronze-medal match
 * between the two semifinal losers, mirroring the Olympic tournament format) from the
 * ranked group-stage qualifiers. `qualifiers` must already be ordered by seed
 * (all group winners first, then all runners-up, etc.) and its length must be a power of 2.
 */
export function buildKnockoutBracket(qualifiers: { teamId: string }[]): Match[] {
  const n = qualifiers.length;
  if (n < 2 || (n & (n - 1)) !== 0) {
    throw new Error('Die Anzahl der qualifizierten Teams muss eine Zweierpotenz sein (2, 4, 8, 16).');
  }

  const order = seedOrder(n);
  const matches: Match[] = [];
  let currentRoundTeamIds: (string | null)[] = order.map((seed) => qualifiers[seed - 1].teamId);
  let roundSize = n;
  let roundsBySize: Record<number, Match[]> = {};

  while (roundSize >= 1) {
    const roundName = roundNameForSize(roundSize);
    const roundMatches: Match[] = [];
    if (roundSize === n) {
      for (let i = 0; i < currentRoundTeamIds.length; i += 2) {
        roundMatches.push({
          id: generateId('match'),
          round: roundName,
          teamAId: currentRoundTeamIds[i],
          teamBId: currentRoundTeamIds[i + 1],
          scoreA: null,
          scoreB: null,
          winnerId: null,
          status: 'ready',
        });
      }
    } else {
      const prevRound = roundsBySize[roundSize * 2];
      for (let i = 0; i < prevRound.length; i += 2) {
        roundMatches.push({
          id: generateId('match'),
          round: roundName,
          teamAId: null,
          teamBId: null,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          status: 'pending',
        });
      }
      prevRound.forEach((m, idx) => {
        const target = roundMatches[Math.floor(idx / 2)];
        m.nextMatchId = target.id;
        m.nextMatchSlot = idx % 2 === 0 ? 'A' : 'B';
      });
    }
    roundsBySize[roundSize] = roundMatches;
    matches.push(...roundMatches);
    if (roundSize === 1) break;
    roundSize = roundSize / 2;
  }

  if (n >= 4) {
    const semifinals = roundsBySize[2];
    const bronzeMatch: Match = {
      id: generateId('match'),
      round: 'Spiel um Bronze',
      teamAId: null,
      teamBId: null,
      scoreA: null,
      scoreB: null,
      winnerId: null,
      status: 'pending',
    };
    matches.push(bronzeMatch);
  }

  return matches;
}

/** Orders group qualifiers into overall seed order: all 1st places, then all 2nd places, etc. */
export function orderQualifiers(groups: Group[], perGroup: number): { teamId: string }[] {
  const byRank: string[][] = Array.from({ length: perGroup }, () => []);
  for (const group of groups) {
    const standings = computeStandings(group);
    for (let rank = 0; rank < perGroup; rank++) {
      if (standings[rank]) byRank[rank].push(standings[rank].teamId);
    }
  }
  return byRank.flat().map((teamId) => ({ teamId }));
}

/**
 * Applies a completed match result to the bracket: sets the winner, and pushes that
 * winner (and, for the semifinals, the loser into the bronze match) into the next match.
 */
export function advanceBracket(knockout: Match[], matchId: string, scoreA: number[], scoreB: number[]): Match[] {
  const updated = knockout.map((m) => ({ ...m }));
  const match = updated.find((m) => m.id === matchId);
  if (!match || !match.teamAId || !match.teamBId) return updated;

  const winnerId = decideWinner(match, scoreA, scoreB);
  if (!winnerId) return updated;
  const loserId = winnerId === match.teamAId ? match.teamBId : match.teamAId;

  match.scoreA = scoreA;
  match.scoreB = scoreB;
  match.winnerId = winnerId;
  match.status = 'completed';

  if (match.nextMatchId) {
    const next = updated.find((m) => m.id === match.nextMatchId);
    if (next) {
      if (match.nextMatchSlot === 'A') next.teamAId = winnerId;
      else next.teamBId = winnerId;
      if (next.teamAId && next.teamBId) next.status = 'ready';
    }
  }

  if (match.round === 'Halbfinale') {
    const bronze = updated.find((m) => m.round === 'Spiel um Bronze');
    if (bronze) {
      if (!bronze.teamAId) bronze.teamAId = loserId;
      else bronze.teamBId = loserId;
      if (bronze.teamAId && bronze.teamBId) bronze.status = 'ready';
    }
  }

  return updated;
}

export function getMedals(knockout: Match[]): { gold: string | null; silver: string | null; bronze: string | null } {
  const final = knockout.find((m) => m.round === 'Finale');
  const bronzeMatch = knockout.find((m) => m.round === 'Spiel um Bronze');
  const gold = final?.status === 'completed' ? final.winnerId : null;
  const silver =
    final?.status === 'completed'
      ? final.winnerId === final.teamAId
        ? final.teamBId
        : final.teamAId
      : null;
  const bronze = bronzeMatch?.status === 'completed' ? bronzeMatch.winnerId : null;
  return { gold, silver, bronze };
}

export function isTournamentComplete(tournament: Pick<Tournament, 'knockout'>): boolean {
  const final = tournament.knockout.find((m) => m.round === 'Finale');
  return final?.status === 'completed';
}
