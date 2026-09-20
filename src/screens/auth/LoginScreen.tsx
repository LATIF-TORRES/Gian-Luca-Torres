import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../../components/GradientBackground';
import { Card } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { isFirebaseConfigured } from '../../services/firebase';
import { loginWithUsername, mapAuthError } from '../../services/auth';
import { enterGuestMode, loadGuestProfile } from '../../services/guestAuth';
import { useAuthStore } from '../../store/useAuthStore';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setGuest = useAuthStore((s) => s.setGuest);

  useEffect(() => {
    loadGuestProfile().then((profile) => {
      if (profile) setGuestName(profile.username);
    });
  }, []);

  async function handleLogin() {
    setError(null);
    if (!username || !password) {
      setError('Bitte Benutzername und Passwort eingeben.');
      return;
    }
    setLoading(true);
    try {
      await loginWithUsername(username, password);
    } catch (e: any) {
      setError(e?.code ? mapAuthError(e.code) : e?.message ?? 'Login fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestStart() {
    setGuestError(null);
    if (!guestName.trim()) {
      setGuestError('Bitte gib einen Namen ein.');
      return;
    }
    setGuestLoading(true);
    try {
      const profile = await enterGuestMode(guestName.trim());
      setProfile(profile);
      setGuest(true);
    } catch (e: any) {
      setGuestError(e?.message ?? 'Gastmodus konnte nicht gestartet werden.');
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>🏆 PADEL ARENA</Text>
          <Text style={styles.subtitle}>Olympisches Turniersystem für Padel-Teams</Text>

          <Card style={styles.guestCard}>
            <Text style={styles.guestTitle}>🎮 Sofort loslegen</Text>
            <Text style={styles.guestSubtitle}>
              Ohne Konto, ohne Internet, ohne Firebase – alles bleibt nur auf diesem Gerät gespeichert.
            </Text>
            {guestOpen ? (
              <>
                <TextField label="Dein Name" value={guestName} onChangeText={setGuestName} placeholder="z.B. Alex" />
                {guestError ? <Text style={styles.error}>{guestError}</Text> : null}
                <PrimaryButton label="Loslegen" variant="accent" onPress={handleGuestStart} loading={guestLoading} />
              </>
            ) : (
              <PrimaryButton label="Gastmodus starten" variant="accent" onPress={() => setGuestOpen(true)} />
            )}
          </Card>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>oder mit Online-Konto</Text>
            <View style={styles.dividerLine} />
          </View>

          <Card style={styles.card}>
            {!isFirebaseConfigured && (
              <Text style={styles.warning}>
                Firebase ist noch nicht konfiguriert. Trage deine Zugangsdaten in die .env-Datei ein (siehe
                .env.example), um dich online anzumelden – der Gastmodus oben funktioniert aber schon jetzt.
              </Text>
            )}
            <TextField label="Benutzername" value={username} onChangeText={setUsername} placeholder="dein_username" />
            <TextField
              label="Passwort"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton label="Einloggen" onPress={handleLogin} loading={loading} style={styles.button} />
          </Card>

          <PrimaryButton
            variant="ghost"
            label="Noch kein Konto? Jetzt registrieren"
            onPress={() => navigation.navigate('Register')}
            style={styles.registerButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logo: { color: colors.court, fontSize: 30, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  subtitle: { color: colors.mist, textAlign: 'center', marginTop: 8, marginBottom: 28, fontSize: 14 },
  guestCard: { marginBottom: 20 },
  guestTitle: { color: colors.white, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  guestSubtitle: { color: colors.mist, fontSize: 12, lineHeight: 17, marginBottom: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.cardBorder },
  dividerText: { color: colors.mist, fontSize: 12 },
  card: { marginBottom: 20 },
  button: { marginTop: 8 },
  registerButton: {},
  error: { color: colors.danger, marginBottom: 12, fontSize: 13 },
  warning: { color: colors.gold, fontSize: 12, marginBottom: 16, lineHeight: 18 },
});
