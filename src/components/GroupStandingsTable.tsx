import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { computeStandings } from '../utils/tournamentEngine';
import { TeamAvatarPair } from './TeamAvatarPair';
import type { Group, Team } from '../types';

export function GroupStandingsTable({
  group,
  teamsById,
  qualifySlots,
}: {
  group: Group;
  teamsById: Record<string, Team>;
  qualifySlots: number;
}) {
  const standings = computeStandings(group);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.teamCol]}>Team</Text>
        <Text style={styles.headerCell}>Sp</Text>
        <Text style={styles.headerCell}>S</Text>
        <Text style={styles.headerCell}>N</Text>
        <Text style={styles.headerCell}>Sätze</Text>
        <Text style={styles.headerCell}>Pkt</Text>
      </View>
      {standings.map((row, index) => {
        const team = teamsById[row.teamId];
        const qualifies = index < qualifySlots;
        return (
          <View key={row.teamId} style={[styles.dataRow, qualifies && styles.qualifiedRow]}>
            <View style={[styles.teamCol, styles.teamCell]}>
              {team && <TeamAvatarPair team={team} size={20} />}
              <Text numberOfLines={1} style={[styles.cell, styles.teamName]}>
                {index + 1}. {team ? `${team.playerA} / ${team.playerB}` : '—'}
              </Text>
            </View>
            <Text style={styles.cell}>{row.played}</Text>
            <Text style={styles.cell}>{row.wins}</Text>
            <Text style={styles.cell}>{row.losses}</Text>
            <Text style={styles.cell}>
              {row.setsFor}:{row.setsAgainst}
            </Text>
            <Text style={[styles.cell, styles.points]}>{row.points}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 8 },
  headerRow: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  headerCell: { flex: 1, color: colors.mist, fontSize: 11, fontWeight: '700', textAlign: 'center', textTransform: 'uppercase' },
  teamCol: { flex: 3 },
  teamCell: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  qualifiedRow: { backgroundColor: 'rgba(198,241,53,0.08)' },
  cell: { flex: 1, color: colors.white, fontSize: 13, textAlign: 'center' },
  teamName: { textAlign: 'left' },
  points: { color: colors.court, fontWeight: '800' },
});
