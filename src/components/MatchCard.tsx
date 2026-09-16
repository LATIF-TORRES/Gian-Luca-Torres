import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Chip } from './Chip';
import { TeamAvatarPair } from './TeamAvatarPair';
import type { Match, Team } from '../types';

function teamLabel(team?: Team) {
  if (!team) return 'TBD';
  return `${team.playerA} / ${team.playerB}`;
}

export function MatchCard({
  match,
  teamsById,
  onPress,
}: {
  match: Match;
  teamsById: Record<string, Team>;
  onPress?: () => void;
}) {
  const teamA = match.teamAId ? teamsById[match.teamAId] : undefined;
  const teamB = match.teamBId ? teamsById[match.teamBId] : undefined;
  const canPlay = Boolean(match.teamAId && match.teamBId);
  const isDone = match.status === 'completed';

  return (
    <Pressable
      disabled={!canPlay || !onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && canPlay ? styles.pressed : null]}
    >
      <Row
        team={teamA}
        winner={isDone && match.winnerId === match.teamAId}
        scores={match.scoreA}
        opponentScores={match.scoreB}
      />
      <View style={styles.divider} />
      <Row
        team={teamB}
        winner={isDone && match.winnerId === match.teamBId}
        scores={match.scoreB}
        opponentScores={match.scoreA}
      />
      {!isDone && (
        <View style={styles.statusRow}>
          <Chip label={canPlay ? 'Bereit' : 'Wartet'} tone={canPlay ? 'accent' : 'neutral'} />
        </View>
      )}
    </Pressable>
  );
}

function Row({
  team,
  winner,
  scores,
  opponentScores,
}: {
  team?: Team;
  winner: boolean;
  scores: number[] | null;
  opponentScores: number[] | null;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.nameGroup}>
        {team && <TeamAvatarPair team={team} size={24} />}
        <Text numberOfLines={1} style={[styles.name, !team && styles.placeholder, winner && styles.winnerName]}>
          {teamLabel(team)}
        </Text>
      </View>
      {scores && opponentScores ? (
        <View style={styles.sets}>
          {scores.map((s, i) => (
            <Text key={i} style={[styles.set, s > opponentScores[i] && styles.setWon]}>
              {s}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    minWidth: 220,
  },
  pressed: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  nameGroup: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 8, paddingRight: 8 },
  name: { color: colors.white, fontSize: 14, fontWeight: '600', flexShrink: 1 },
  placeholder: { color: colors.mist, fontStyle: 'italic' },
  winnerName: { color: colors.court, fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 2 },
  sets: { flexDirection: 'row', gap: 6 },
  set: { color: colors.mist, fontWeight: '700', fontSize: 13, minWidth: 14, textAlign: 'center' },
  setWon: { color: colors.court },
  statusRow: { marginTop: 8, alignItems: 'flex-start' },
});
