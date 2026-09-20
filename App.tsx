import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { GradientBackground } from './src/components/GradientBackground';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { subscribeToAuthChanges, fetchUserProfile } from './src/services/auth';
import { colors } from './src/theme/colors';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.navyDeep,
    card: colors.navyDeep,
    text: colors.white,
    border: colors.cardBorder,
    primary: colors.court,
  },
};

export default function App() {
  const { initializing, firebaseUser, isGuest, setInitializing, setFirebaseUser, setProfile } = useAuthStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setFirebaseUser(user);
      if (user) {
        const profile = await fetchUserProfile(user.uid);
        setProfile(profile);
      } else if (!useAuthStore.getState().isGuest) {
        // A stray Firebase "signed out" event (e.g. a background token refresh) should
        // never kick an active local guest session back to the login screen.
        setProfile(null);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <GradientBackground>
        <View style={styles.splash}>
          <Text style={styles.splashTitle}>🏆 PADEL ARENA</Text>
          <ActivityIndicator color={colors.court} style={styles.spinner} />
        </View>
        <StatusBar style="light" />
      </GradientBackground>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          {firebaseUser || isGuest ? <RootNavigator /> : <AuthNavigator />}
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splashTitle: { color: colors.court, fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  spinner: { marginTop: 24 },
});
