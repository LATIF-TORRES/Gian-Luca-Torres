import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../../components/GradientBackground';
import { Card } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { registerWithUsername, validateUsername } from '../../services/auth';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError(null);
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }
    setLoading(true);
    try {
      await registerWithUsername(username, password);
    } catch (e: any) {
      setError(e?.message ?? 'Registrierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Konto erstellen</Text>
          <Text style={styles.subtitle}>Wähle deinen einzigartigen Online-Benutzernamen für Turniere.</Text>

          <Card style={styles.card}>
            <TextField label="Benutzername" value={username} onChangeText={setUsername} placeholder="dein_username" />
            <TextField
              label="Passwort"
              value={password}
              onChangeText={setPassword}
              placeholder="mind. 6 Zeichen"
              secureTextEntry
            />
            <TextField
              label="Passwort bestätigen"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton label="Registrieren" onPress={handleRegister} loading={loading} style={styles.button} />
          </Card>

          <PrimaryButton
            variant="ghost"
            label="Zurück zum Login"
            onPress={() => navigation.navigate('Login')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  title: { color: colors.white, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.mist, textAlign: 'center', marginTop: 8, marginBottom: 28, fontSize: 14 },
  card: { marginBottom: 20 },
  button: { marginTop: 8 },
  error: { color: colors.danger, marginBottom: 12, fontSize: 13 },
});
