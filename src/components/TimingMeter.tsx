import React, { useEffect } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import type { HitQuality } from '../utils/botEngine';

const BAR_HEIGHT = 54;
const MARKER_SIZE = 22;

export function TimingMeter({
  sweetSpotWidth,
  goodSpotWidth,
  cycleMs,
  active,
  resetKey,
  onResult,
}: {
  sweetSpotWidth: number;
  goodSpotWidth: number;
  cycleMs: number;
  active: boolean;
  resetKey: number;
  onResult: (quality: HitQuality) => void;
}) {
  const progress = useSharedValue(0);
  const [barWidth, setBarWidth] = React.useState(0);

  useEffect(() => {
    if (!active || barWidth === 0) return;
    progress.value = 0;
    progress.value = withRepeat(withTiming(1, { duration: cycleMs / 2, easing: Easing.linear }), -1, true);
    return () => {
      cancelAnimation(progress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, resetKey, barWidth, cycleMs]);

  function handleLayout(e: LayoutChangeEvent) {
    setBarWidth(e.nativeEvent.layout.width);
  }

  function handlePress() {
    if (!active) return;
    const value = progress.value;
    cancelAnimation(progress);
    const distanceFromCenter = Math.abs(value - 0.5) * 2;
    let quality: HitQuality = 'miss';
    if (distanceFromCenter <= sweetSpotWidth / 2 + 0.001) quality = 'perfect';
    else if (distanceFromCenter <= goodSpotWidth / 2 + 0.001) quality = 'good';
    onResult(quality);
  }

  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * Math.max(barWidth - MARKER_SIZE, 0) }],
  }));

  const sweetWidth = barWidth * sweetSpotWidth;
  const goodWidth = barWidth * goodSpotWidth;

  return (
    <Pressable onPress={handlePress} disabled={!active}>
      <View style={styles.track} onLayout={handleLayout}>
        <View style={[styles.zone, styles.goodZone, { width: goodWidth, left: (barWidth - goodWidth) / 2 }]} />
        <View style={[styles.zone, styles.sweetZone, { width: sweetWidth, left: (barWidth - sweetWidth) / 2 }]} />
        {barWidth > 0 && <Animated.View style={[styles.marker, markerStyle]} />}
      </View>
      <Text style={styles.hint}>{active ? 'Tippen zum Schlagen! 🎾' : ''}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  zone: { position: 'absolute', top: 0, bottom: 0, borderRadius: BAR_HEIGHT / 2 },
  goodZone: { backgroundColor: 'rgba(255,213,74,0.25)' },
  sweetZone: { backgroundColor: 'rgba(61,220,151,0.45)' },
  marker: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.navyDeep,
    top: (BAR_HEIGHT - MARKER_SIZE) / 2,
  },
  hint: { color: colors.mist, textAlign: 'center', marginTop: 10, fontSize: 12, fontWeight: '700' },
});
