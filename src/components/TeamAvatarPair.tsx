import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar } from './Avatar';
import { colors } from '../theme/colors';
import type { Team } from '../types';

/**
 * Two small overlapping avatar circles for a team's players. When a player's name
 * matches a registered account (resolved once at tournament creation, see
 * services/tournaments.ts#resolvePlayerAvatar), their real profile color is used -
 * a lightweight way to show "this is a real linked player" without the cost of a
 * full 3D WebView avatar in list contexts with many teams on screen at once.
 */
export function TeamAvatarPair({ team, size = 28 }: { team: Team; size?: number }) {
  return (
    <View style={styles.wrapper}>
      <Avatar name={team.playerA} color={team.playerAAvatarColor} size={size} style={styles.front} />
      <Avatar
        name={team.playerB}
        color={team.playerBAvatarColor}
        size={size}
        style={[styles.back, { marginLeft: -size * 0.35, borderColor: colors.navyDeep, borderWidth: 2 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center' },
  front: { zIndex: 1 },
  back: { zIndex: 0 },
});
