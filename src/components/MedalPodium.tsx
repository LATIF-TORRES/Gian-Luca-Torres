import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Avatar3D } from './Avatar3D';
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
      <PodiumStep place="🥈" team={silver} color={colors.silver} height={64} avatarSize={56} />
      <PodiumStep place="🥇" team={gold} color={colors.gold} height={88} avatarSize={72} />
      <PodiumStep place="🥉" team={bronze} color={colors.bronze} height={48} avatarSize={48} />
    </View>
  );
}

function PodiumStep({
  place,
  team,
  color,
  height,
  avatarSize,
}: {
  place: string;
  team?: Team;
  color: string;
  height: number;
  avatarSize: number;
}) {
  return (
    <View style={styles.step}>
      {team && (
        <View style={styles.avatarRow}>
          <Avatar3D avatarUrl={team.playerAAvatarUrl} fallbackName={team.playerA} fallbackColor={team.playerAAvatarColor} size={avatarSize} />
          <Avatar3D
            avatarUrl={team.playerBAvatarUrl}
            fallbackName={team.playerB}
            fallbackColor={team.playerBAvatarColor}
            size={avatarSize}
            style={styles.secondAvatar}
          />
        </View>
      )}
      <Text style={styles.medalEmoji}>{place}</Text>
      <Text numberOfLines={2} style={styles.name}>
        {teamLabel(team)}
      </Text>
      <View style={[styles.bar, { height, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginTop: 12 },
  step: { flex: 1, alignItems: 'center' },
  avatarRow: { flexDirection: 'row', marginBottom: 8 },
  secondAvatar: { marginLeft: -10 },
  medalEmoji: { fontSize: 28, marginBottom: 4 },
  name: { color: colors.white, fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 8, minHeight: 32 },
  bar: { width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 },
});
