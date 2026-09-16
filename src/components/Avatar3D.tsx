import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { Avatar } from './Avatar';
import { colors } from '../theme/colors';

/**
 * Renders a realistic, rigged 3D avatar (GLB, e.g. from Ready Player Me) using Google's
 * <model-viewer> web component inside a WebView. We use this instead of three.js/expo-gl
 * because expo-gl does not yet support React Native's New Architecture (mandatory since
 * Expo SDK 55) and renders a black screen there - WebView + model-viewer is the reliable
 * path recommended by Ready Player Me's own React Native integration example.
 */
export function Avatar3D({
  avatarUrl,
  fallbackName,
  fallbackColor,
  size = 140,
  style,
}: {
  avatarUrl?: string | null;
  fallbackName: string;
  fallbackColor?: string;
  size?: number;
  style?: ViewStyle;
}) {
  if (!avatarUrl) {
    return (
      <View style={[{ width: size, height: size }, style]}>
        <Avatar name={fallbackName} color={fallbackColor} size={size} />
      </View>
    );
  }

  const safeUrl = avatarUrl.replace(/"/g, '%22');
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <style>
          html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; height: 100%; }
          model-viewer { width: 100%; height: 100%; --poster-color: transparent; background-color: transparent; }
        </style>
        <script type="module" src="https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js"></script>
      </head>
      <body>
        <model-viewer
          src="${safeUrl}"
          camera-orbit="0deg 85deg 2.2m"
          field-of-view="30deg"
          auto-rotate
          autoplay
          rotation-per-second="18deg"
          exposure="1.1"
          shadow-intensity="0.6"
          interaction-prompt="none"
          disable-zoom
          disable-pan
          disable-tap
        ></model-viewer>
      </body>
    </html>
  `;

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        pointerEvents="none"
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: colors.navyLight,
  },
  webview: { backgroundColor: 'transparent' },
});
