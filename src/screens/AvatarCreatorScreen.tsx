import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AvatarCreator'>;

// "demo" is Ready Player Me's public test subdomain - fine for development.
// For production, register a free subdomain at https://studio.readyplayer.me
// and swap it in here so avatars are tied to your own RPM application.
const AVATAR_CREATOR_URL =
  'https://demo.readyplayer.me/avatar?frameApi&bodyType=fullbody&quickStart=false&clearCache';

// Ready Player Me posts window.postMessage events describing creator state.
// We forward every message to React Native and look for the "avatar exported" one,
// which carries the final GLB URL of the realistic 3D avatar the user just built.
const INJECTED_JS = `
  window.addEventListener('message', (event) => {
    let json = event.data;
    try {
      if (typeof event.data === 'string') json = JSON.parse(event.data);
    } catch (e) {
      return;
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(json));
  });
  true;
`;

export default function AvatarCreatorScreen({ navigation, route }: Props) {
  const [loading, setLoading] = useState(true);
  const onAvatarReady = route.params?.onAvatarReady;

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.eventName === 'v1.avatar.exported' && data?.data?.url) {
        onAvatarReady?.(data.data.url as string);
        navigation.goBack();
      }
    } catch {
      // Not a JSON message we care about (e.g. RPM analytics pings) - ignore.
    }
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: AVATAR_CREATOR_URL }}
        injectedJavaScript={INJECTED_JS}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
      />
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
  webview: { flex: 1, backgroundColor: colors.navyDeep },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.navyDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: colors.mist, marginTop: 16, fontSize: 13 },
});
