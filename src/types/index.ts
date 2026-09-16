export interface UserProfile {
  uid: string;
  username: string;
  usernameLower: string;
  avatarColor: string;
  avatarUrl: string | null;
  createdAt: number;
  stats: {
    tournamentsPlayed: number;
    tournamentsWon: number;
    matchesWon: number;
    matchesLost: number;
  };
  training?: {
    wins: number;
    losses: number;
  };
}

export interface Team {
  id: string;
  name: string;
  playerA: string;
  playerB: string;
  /** Populated at creation time when a player name matches a registered username. */
  playerAAvatarColor?: string | null;
  playerAAvatarUrl?: string | null;
  playerBAvatarColor?: string | null;
  playerBAvatarUrl?: string | null;
}

export interface Match {
  id: string;
  round: string;
  teamAId: string | null;
  teamBId: string | null;
  scoreA: number[] | null;
  scoreB: number[] | null;
  winnerId: string | null;
  status: 'pending' | 'ready' | 'completed';
  bracketSlot?: string;
  nextMatchId?: string | null;
  nextMatchSlot?: 'A' | 'B' | null;
}

export interface StandingRow {
  teamId: string;
  played: number;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
  gamesFor: number;
  gamesAgainst: number;
  points: number;
}

export interface Group {
  id: string;
  name: string;
  teamIds: string[];
  matches: Match[];
}

export type TournamentStatus = 'groups' | 'knockout' | 'completed';

export interface Tournament {
  id: string;
  name: string;
  code: string;
  createdBy: string;
  createdByUsername: string;
  createdAt: number;
  status: TournamentStatus;
  teamsPerGroupAdvance: number;
  teams: Team[];
  groups: Group[];
  knockout: Match[];
  medals: {
    gold: string | null;
    silver: string | null;
    bronze: string | null;
  };
}

export interface LeaderboardEntry {
  uid: string;
  username: string;
  avatarColor: string;
  avatarUrl: string | null;
  tournamentsWon: number;
  matchesWon: number;
  matchesLost: number;
}
