import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const TONES = {
  neutral: { bg: 'rgba(255,255,255,0.10)', fg: colors.mist },
  success: { bg: 'rgba(61,220,151,0.16)', fg: colors.success },
  warning: { bg: 'rgba(255,213,74,0.16)', fg: colors.gold },
  accent: { bg: 'rgba(198,241,53,0.16)', fg: colors.court },
} as const;

export function Chip({ label, tone = 'neutral' }: { label: string; tone?: keyof typeof TONES }) {
  const t = TONES[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      <Text style={[styles.label, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 12, fontWeight: '700' },
});
