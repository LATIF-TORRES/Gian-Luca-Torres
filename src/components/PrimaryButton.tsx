import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isGhost = variant === 'ghost';
  const gradientColors = variant === 'accent' ? gradients.accent : gradients.primary;

  return (
    <AnimatedPressable
      disabled={disabled || loading}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12 });
      }}
      onPress={onPress}
      style={[animatedStyle, style, { opacity: disabled ? 0.5 : 1 }]}
    >
      {isGhost ? (
        <Animated.View style={[styles.base, styles.ghost]}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.ghostLabel}>{label}</Text>
          )}
        </Animated.View>
      ) : (
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.base}>
          {loading ? (
            <ActivityIndicator color={colors.navyDeep} />
          ) : (
            <Text style={styles.label}>{label}</Text>
          )}
        </LinearGradient>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    color: colors.navyDeep,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  ghostLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
