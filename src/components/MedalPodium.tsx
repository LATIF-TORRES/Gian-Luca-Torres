import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { Team } from '../types';

function teamLabel(team?: Team) {
  return team ? `${team.playerA} / ${team.playerB}` : '—';
}

export function MedalPodium({
  gold,
  silver,
  bronze,
}: {
  gold?: Team;
  silver?: Team;
  bronze?: Team;
}) {
  return (
    <View style={styles.wrapper}>
      <PodiumStep place="🥈" label={teamLabel(silver)} color={colors.silver} height={64} />
      <PodiumStep place="🥇" label={teamLabel(gold)} color={colors.gold} height={88} />
      <PodiumStep place="🥉" label={teamLabel(bronze)} color={colors.bronze} height={48} />
    </View>
  );
}

function PodiumStep({ place, label, color, height }: { place: string; label: string; color: string; height: number }) {
  return (
    <View style={styles.step}>
      <Text style={styles.medalEmoji}>{place}</Text>
      <Text numberOfLines={2} style={styles.name}>
        {label}
      </Text>
      <View style={[styles.bar, { height, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginTop: 12 },
  step: { flex: 1, alignItems: 'center' },
  medalEmoji: { fontSize: 28, marginBottom: 4 },
  name: { color: colors.white, fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 8, minHeight: 32 },
  bar: { width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 },
});
