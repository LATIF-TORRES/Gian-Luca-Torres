import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Avatar } from './Avatar';
import { colors } from '../theme/colors';

/**
 * Web counterpart to Avatar3D.tsx. react-native-webview has no web implementation (it
 * renders a "does not support this platform" placeholder there), but on web we're
 * already inside a real browser DOM, so we can render Google's <model-viewer> custom
 * element directly - no WebView needed at all. Metro automatically picks this file over
 * Avatar3D.tsx when bundling for the web platform.
 */
let scriptPromise: Promise<void> | null = null;
function ensureModelViewerScript(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    if (customElements.get('model-viewer')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function Avatar3D({
  avatarUrl,
  fallbackName,
  fallbackColor,
  size = 140,
  style,
}: {
  avatarUrl?: string | null;
  fallbackName: string;
  fallbackColor?: string | null;
  size?: number;
  style?: any;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!avatarUrl) return;
    let cancelled = false;
    ensureModelViewerScript().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [avatarUrl]);

  if (!avatarUrl) {
    return (
      <View style={[{ width: size, height: size }, style]}>
        <Avatar name={fallbackName} color={fallbackColor} size={size} />
      </View>
    );
  }

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: colors.navyLight },
        style,
      ]}
    >
      {ready &&
        React.createElement('model-viewer', {
          src: avatarUrl,
          'camera-orbit': '0deg 85deg 2.2m',
          'field-of-view': '30deg',
          'auto-rotate': true,
          autoplay: true,
          'rotation-per-second': '18deg',
          exposure: '1.1',
          'shadow-intensity': '0.6',
          'interaction-prompt': 'none',
          'disable-zoom': true,
          'disable-pan': true,
          'disable-tap': true,
          style: { width: '100%', height: '100%' },
        })}
    </View>
  );
}
