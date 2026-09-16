export interface TournamentPreset {
  teamCount: number;
  numGroups: number;
  teamsPerGroupAdvance: number;
  label: string;
  description: string;
}

export const TOURNAMENT_PRESETS: TournamentPreset[] = [
  {
    teamCount: 4,
    numGroups: 2,
    teamsPerGroupAdvance: 1,
    label: '4 Teams',
    description: '2 Gruppen à 2 Teams → direkt das Finale',
  },
  {
    teamCount: 6,
    numGroups: 2,
    teamsPerGroupAdvance: 2,
    label: '6 Teams',
    description: '2 Gruppen à 3 Teams → Halbfinale, Finale & Bronze',
  },
  {
    teamCount: 8,
    numGroups: 2,
    teamsPerGroupAdvance: 2,
    label: '8 Teams',
    description: '2 Gruppen à 4 Teams → Halbfinale, Finale & Bronze',
  },
  {
    teamCount: 12,
    numGroups: 4,
    teamsPerGroupAdvance: 2,
    label: '12 Teams',
    description: '4 Gruppen à 3 Teams → Viertelfinale bis Finale & Bronze',
  },
  {
    teamCount: 16,
    numGroups: 4,
    teamsPerGroupAdvance: 2,
    label: '16 Teams',
    description: '4 Gruppen à 4 Teams → Viertelfinale bis Finale & Bronze',
  },
];
