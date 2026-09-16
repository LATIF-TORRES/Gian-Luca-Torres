export interface BotProfile {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  color: string;
  /** Fraction (0-1) of the timing bar counted as a "perfect" hit. */
  sweetSpotWidth: number;
  /** Fraction (0-1) of the timing bar counted as a "good" hit (includes the perfect zone). */
  goodSpotWidth: number;
  /** Milliseconds for one full sweep of the timing marker (harder bot = faster = less reaction time). */
  cycleMs: number;
  /** Chance the bot still returns/wins the point even after your "perfect" hit. */
  perfectCounterChance: number;
  /** Chance you win the point after a "good" (not perfect) hit. */
  goodWinChance: number;
}

export const BOTS: BotProfile[] = [
  {
    id: 'rookie',
    name: 'Rookie Rico',
    emoji: '🟢',
    tagline: 'Perfekt zum Aufwärmen',
    color: '#3DDC97',
    sweetSpotWidth: 0.32,
    goodSpotWidth: 0.58,
    cycleMs: 1500,
    perfectCounterChance: 0.05,
    goodWinChance: 0.75,
  },
  {
    id: 'amateur',
    name: 'Amateur Ana',
    emoji: '🟡',
    tagline: 'Solide Grundlagen',
    color: '#FFD54A',
    sweetSpotWidth: 0.22,
    goodSpotWidth: 0.46,
    cycleMs: 1150,
    perfectCounterChance: 0.15,
    goodWinChance: 0.55,
  },
  {
    id: 'pro',
    name: 'Pro Paco',
    emoji: '🟠',
    tagline: 'Fordert dich richtig',
    color: '#FF6A3D',
    sweetSpotWidth: 0.15,
    goodSpotWidth: 0.35,
    cycleMs: 850,
    perfectCounterChance: 0.25,
    goodWinChance: 0.4,
  },
  {
    id: 'champion',
    name: 'Champion Coco',
    emoji: '🔴',
    tagline: 'Nur für echte Profis',
    color: '#FF5470',
    sweetSpotWidth: 0.09,
    goodSpotWidth: 0.24,
    cycleMs: 650,
    perfectCounterChance: 0.35,
    goodWinChance: 0.28,
  },
];

export type HitQuality = 'perfect' | 'good' | 'miss';
export type PointWinner = 'player' | 'bot';

/** Resolves who wins a point given how well-timed the player's hit was. */
export function resolvePoint(bot: BotProfile, quality: HitQuality): PointWinner {
  if (quality === 'miss') return 'bot';
  if (quality === 'perfect') {
    return Math.random() < bot.perfectCounterChance ? 'bot' : 'player';
  }
  return Math.random() < bot.goodWinChance ? 'player' : 'bot';
}

export function pointLabel(mine: number, theirs: number): string {
  if (mine >= 3 && theirs >= 3) {
    if (mine === theirs) return '40';
    return mine > theirs ? 'Ad' : '40';
  }
  return ['0', '15', '30', '40'][Math.min(mine, 3)];
}

interface Score {
  player: number;
  bot: number;
}

export type MatchPhase = 'game' | 'tiebreak' | 'finished';

export interface LiveMatchState {
  phase: MatchPhase;
  completedSets: Score[];
  currentSetGames: Score;
  currentGamePoints: Score;
  tiebreakPoints: Score;
  winner: PointWinner | null;
  lastPointWinner: PointWinner | null;
}

export function createInitialMatchState(): LiveMatchState {
  return {
    phase: 'game',
    completedSets: [],
    currentSetGames: { player: 0, bot: 0 },
    currentGamePoints: { player: 0, bot: 0 },
    tiebreakPoints: { player: 0, bot: 0 },
    winner: null,
    lastPointWinner: null,
  };
}

function setsWon(sets: Score[], side: PointWinner): number {
  return sets.filter((s) => (side === 'player' ? s.player > s.bot : s.bot > s.player)).length;
}

/** Advances the match state machine by one point. Pure function - returns a new state. */
export function applyPoint(state: LiveMatchState, winner: PointWinner): LiveMatchState {
  if (state.phase === 'finished') return state;
  const next: LiveMatchState = {
    ...state,
    currentSetGames: { ...state.currentSetGames },
    currentGamePoints: { ...state.currentGamePoints },
    tiebreakPoints: { ...state.tiebreakPoints },
    completedSets: [...state.completedSets],
    lastPointWinner: winner,
  };

  function finishSet(setScore: Score) {
    next.completedSets.push(setScore);
    next.currentSetGames = { player: 0, bot: 0 };
    next.currentGamePoints = { player: 0, bot: 0 };
    next.tiebreakPoints = { player: 0, bot: 0 };
    next.phase = 'game';
    if (setsWon(next.completedSets, 'player') >= 2) {
      next.phase = 'finished';
      next.winner = 'player';
    } else if (setsWon(next.completedSets, 'bot') >= 2) {
      next.phase = 'finished';
      next.winner = 'bot';
    }
  }

  if (state.phase === 'tiebreak') {
    next.tiebreakPoints[winner] += 1;
    const { player, bot } = next.tiebreakPoints;
    if (Math.max(player, bot) >= 7 && Math.abs(player - bot) >= 2) {
      finishSet(winner === 'player' ? { player: 7, bot: 6 } : { player: 6, bot: 7 });
    }
    return next;
  }

  next.currentGamePoints[winner] += 1;
  const { player, bot } = next.currentGamePoints;
  const gameWon = Math.max(player, bot) >= 4 && Math.abs(player - bot) >= 2;
  if (gameWon) {
    const gameWinner: PointWinner = player > bot ? 'player' : 'bot';
    next.currentGamePoints = { player: 0, bot: 0 };
    next.currentSetGames[gameWinner] += 1;
    const games = next.currentSetGames;
    if (Math.max(games.player, games.bot) >= 6 && Math.abs(games.player - games.bot) >= 2) {
      finishSet({ ...games });
    } else if (games.player === 6 && games.bot === 6) {
      next.phase = 'tiebreak';
    }
  }

  return next;
}

export function matchSetsSummary(state: LiveMatchState): { player: number; bot: number } {
  return { player: setsWon(state.completedSets, 'player'), bot: setsWon(state.completedSets, 'bot') };
}
