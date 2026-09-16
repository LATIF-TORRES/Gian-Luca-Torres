import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AvatarCreator'>;

// See AvatarCreatorScreen.tsx for the native (WebView-based) version and notes on the
// "demo" subdomain. On web we're already in a real browser, so a plain <iframe> plus a
// native window "message" listener replaces the WebView + injected-JS bridge entirely.
const AVATAR_CREATOR_URL =
  'https://demo.readyplayer.me/avatar?frameApi&bodyType=fullbody&quickStart=false&clearCache';

export default function AvatarCreatorScreen({ navigation, route }: Props) {
  const [loading, setLoading] = useState(true);
  const onAvatarReady = route.params?.onAvatarReady;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      let data: any = event.data;
      try {
        if (typeof data === 'string') data = JSON.parse(data);
      } catch {
        return;
      }
      if (data?.eventName === 'v1.avatar.exported' && data?.data?.url) {
        onAvatarReady?.(data.data.url as string);
        navigation.goBack();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAvatarReady, navigation]);

  return (
    <View style={styles.container}>
      {React.createElement('iframe', {
        src: AVATAR_CREATOR_URL,
        allow: 'camera *; microphone *; clipboard-write',
        style: { border: 'none', width: '100%', height: '100%' },
        onLoad: () => setLoading(false),
      })}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.court} size="large" />
          <Text style={styles.loadingText}>3D-Avatar-Studio wird geladen…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navyDeep },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.navyDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: colors.mist, marginTop: 16, fontSize: 13 },
});
