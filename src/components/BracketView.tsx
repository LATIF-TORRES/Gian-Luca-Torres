import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { MatchCard } from './MatchCard';
import type { Match, Team } from '../types';

const CARD_HEIGHT = 96;
const GAP = 12;

export function BracketView({
  knockout,
  teamsById,
  onSelectMatch,
}: {
  knockout: Match[];
  teamsById: Record<string, Team>;
  onSelectMatch: (match: Match) => void;
}) {
  const columns = useMemo(() => {
    const mainRounds: { round: string; matches: Match[] }[] = [];
    let bronze: Match | null = null;
    for (const match of knockout) {
      if (match.round === 'Spiel um Bronze') {
        bronze = match;
        continue;
      }
      const existing = mainRounds.find((r) => r.round === match.round);
      if (existing) existing.matches.push(match);
      else mainRounds.push({ round: match.round, matches: [match] });
    }
    return { mainRounds, bronze };
  }, [knockout]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {columns.mainRounds.map((col, roundIndex) => {
        const gapMultiplier = Math.pow(2, roundIndex);
        const topOffset = ((gapMultiplier - 1) * (CARD_HEIGHT + GAP)) / 2;
        const isFinal = col.round === 'Finale';
        return (
          <View key={col.round} style={styles.column}>
            <Text style={[styles.roundTitle, isFinal && styles.finalTitle]}>
              {isFinal ? '🥇 ' : ''}
              {col.round}
            </Text>
            <View style={{ marginTop: topOffset }}>
              {col.matches.map((match, i) => (
                <View
                  key={match.id}
                  style={{ marginBottom: i === col.matches.length - 1 ? 0 : (gapMultiplier * 2 - 1) * (CARD_HEIGHT + GAP) }}
                >
                  <MatchCard match={match} teamsById={teamsById} onPress={() => onSelectMatch(match)} />
                </View>
              ))}
            </View>
          </View>
        );
      })}
      {columns.bronze ? (
        <View style={styles.column}>
          <Text style={styles.bronzeTitle}>🥉 Spiel um Bronze</Text>
          <MatchCard match={columns.bronze} teamsById={teamsById} onPress={() => onSelectMatch(columns.bronze!)} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingVertical: 12, paddingRight: 24 },
  column: { width: 240, marginRight: 20 },
  roundTitle: {
    color: colors.mist,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  finalTitle: { color: colors.gold },
  bronzeTitle: {
    color: colors.bronze,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
});
