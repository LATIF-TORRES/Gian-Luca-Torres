export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  CreateTournament: undefined;
  JoinTournament: undefined;
  TournamentDetail: { tournamentId: string };
  MatchScore: { tournamentId: string; matchId: string; scope: 'group' | 'knockout'; groupId?: string };
};
