// Real tennis/padel scoring (games, deuce/advantage, tiebreak, best-of-3 sets), ported
// from the Padel Arena app's botEngine.ts - pure logic, no UI/framework dependency.
export type PointWinner = 'player' | 'opponent';
export type MatchPhase = 'game' | 'tiebreak' | 'finished';

interface Score {
  player: number;
  opponent: number;
}

export interface LiveMatchState {
  phase: MatchPhase;
  completedSets: Score[];
  currentSetGames: Score;
  currentGamePoints: Score;
  tiebreakPoints: Score;
  winner: PointWinner | null;
}

export function createInitialMatchState(): LiveMatchState {
  return {
    phase: 'game',
    completedSets: [],
    currentSetGames: { player: 0, opponent: 0 },
    currentGamePoints: { player: 0, opponent: 0 },
    tiebreakPoints: { player: 0, opponent: 0 },
    winner: null,
  };
}

function setsWon(sets: Score[], side: PointWinner): number {
  return sets.filter((s) => (side === 'player' ? s.player > s.opponent : s.opponent > s.player)).length;
}

export function pointLabel(mine: number, theirs: number): string {
  if (mine >= 3 && theirs >= 3) {
    if (mine === theirs) return '40';
    return mine > theirs ? 'Ad' : '40';
  }
  return ['0', '15', '30', '40'][Math.min(mine, 3)];
}

export function applyPoint(state: LiveMatchState, winner: PointWinner): LiveMatchState {
  if (state.phase === 'finished') return state;
  const next: LiveMatchState = {
    ...state,
    currentSetGames: { ...state.currentSetGames },
    currentGamePoints: { ...state.currentGamePoints },
    tiebreakPoints: { ...state.tiebreakPoints },
    completedSets: [...state.completedSets],
  };

  function finishSet(setScore: Score) {
    next.completedSets.push(setScore);
    next.currentSetGames = { player: 0, opponent: 0 };
    next.currentGamePoints = { player: 0, opponent: 0 };
    next.tiebreakPoints = { player: 0, opponent: 0 };
    next.phase = 'game';
    if (setsWon(next.completedSets, 'player') >= 2) {
      next.phase = 'finished';
      next.winner = 'player';
    } else if (setsWon(next.completedSets, 'opponent') >= 2) {
      next.phase = 'finished';
      next.winner = 'opponent';
    }
  }

  if (state.phase === 'tiebreak') {
    next.tiebreakPoints[winner] += 1;
    const { player, opponent } = next.tiebreakPoints;
    if (Math.max(player, opponent) >= 7 && Math.abs(player - opponent) >= 2) {
      finishSet(winner === 'player' ? { player: 7, opponent: 6 } : { player: 6, opponent: 7 });
    }
    return next;
  }

  next.currentGamePoints[winner] += 1;
  const { player, opponent } = next.currentGamePoints;
  const gameWon = Math.max(player, opponent) >= 4 && Math.abs(player - opponent) >= 2;
  if (gameWon) {
    const gameWinner: PointWinner = player > opponent ? 'player' : 'opponent';
    next.currentGamePoints = { player: 0, opponent: 0 };
    next.currentSetGames[gameWinner] += 1;
    const games = next.currentSetGames;
    if (Math.max(games.player, games.opponent) >= 6 && Math.abs(games.player - games.opponent) >= 2) {
      finishSet({ ...games });
    } else if (games.player === 6 && games.opponent === 6) {
      next.phase = 'tiebreak';
    }
  }

  return next;
}

export function matchSetsSummary(state: LiveMatchState): { player: number; opponent: number } {
  return { player: setsWon(state.completedSets, 'player'), opponent: setsWon(state.completedSets, 'opponent') };
}
