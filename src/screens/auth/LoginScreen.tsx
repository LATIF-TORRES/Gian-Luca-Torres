import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../../components/GradientBackground';
import { Card } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { isFirebaseConfigured } from '../../services/firebase';
import { loginWithUsername, mapAuthError } from '../../services/auth';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.logo}>🏆 PADEL ARENA</Text>
          <Text style={styles.subtitle}>Olympisches Turniersystem für Padel-Teams</Text>

          <Card style={styles.card}>
            {!isFirebaseConfigured && (
              <Text style={styles.warning}>
                Firebase ist noch nicht konfiguriert. Trage deine Zugangsdaten in die .env-Datei ein (siehe
                .env.example), um dich anzumelden.
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
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logo: { color: colors.court, fontSize: 30, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  subtitle: { color: colors.mist, textAlign: 'center', marginTop: 8, marginBottom: 32, fontSize: 14 },
  card: { marginBottom: 20 },
  button: { marginTop: 8 },
  registerButton: {},
  error: { color: colors.danger, marginBottom: 12, fontSize: 13 },
  warning: { color: colors.gold, fontSize: 12, marginBottom: 16, lineHeight: 18 },
});
