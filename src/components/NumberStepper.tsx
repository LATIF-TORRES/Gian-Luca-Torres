import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 7,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        style={[styles.btn, value <= min && styles.btnDisabled]}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
      >
        <Text style={styles.btnLabel}>–</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        style={[styles.btn, value >= max && styles.btnDisabled]}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
      >
        <Text style={styles.btnLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.35 },
  btnLabel: { color: colors.white, fontSize: 20, fontWeight: '700', lineHeight: 22 },
  value: { color: colors.white, fontSize: 22, fontWeight: '800', minWidth: 28, textAlign: 'center' },
});
