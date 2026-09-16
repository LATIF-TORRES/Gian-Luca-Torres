import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { findTournamentIdByCode } from '../services/tournaments';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinTournament'>;

export default function JoinTournamentScreen({ navigation }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setError(null);
    if (!code.trim()) {
      setError('Bitte gib einen Turnier-Code ein.');
      return;
    }
    setLoading(true);
    try {
      const tournamentId = await findTournamentIdByCode(code);
      if (!tournamentId) {
        setError('Kein Turnier mit diesem Code gefunden.');
        return;
      }
      navigation.replace('TournamentDetail', { tournamentId });
    } catch (e: any) {
      setError(e?.message ?? 'Beitritt fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.title}>Turnier beitreten</Text>
          <Text style={styles.subtitle}>Gib den 6-stelligen Code ein, den du vom Organisator bekommen hast.</Text>

          <Card>
            <TextField
              label="Turnier-Code"
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              placeholder="ABC123"
              autoCapitalize="characters"
              maxLength={6}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton label="Beitreten" onPress={handleJoin} loading={loading} style={styles.button} />
          </Card>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { color: colors.white, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.mist, textAlign: 'center', marginTop: 8, marginBottom: 24, fontSize: 13, lineHeight: 18 },
  error: { color: colors.danger, marginBottom: 12, fontSize: 13 },
  button: { marginTop: 8 },
});
