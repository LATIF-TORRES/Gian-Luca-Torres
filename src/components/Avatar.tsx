import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export function Avatar({
  name,
  color,
  size = 44,
  style,
}: {
  name: string;
  color?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color ?? colors.orange },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.navyDeep, fontWeight: '800' },
});
