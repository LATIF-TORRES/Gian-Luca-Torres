import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';
import { createTournament } from '../services/dataLayer';
import { TOURNAMENT_PRESETS } from '../utils/tournamentPresets';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTournament'>;

interface TeamDraft {
  playerA: string;
  playerB: string;
}

export default function CreateTournamentScreen({ navigation }: Props) {
  const profile = useAuthStore((s) => s.profile);
  const [name, setName] = useState('');
  const [presetIndex, setPresetIndex] = useState(1);
  const preset = TOURNAMENT_PRESETS[presetIndex];
  const [teams, setTeams] = useState<TeamDraft[]>(() =>
    Array.from({ length: preset.teamCount }, () => ({ playerA: '', playerB: '' }))
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function selectPreset(index: number) {
    setPresetIndex(index);
    const nextPreset = TOURNAMENT_PRESETS[index];
    setTeams((prev) => {
      const next = [...prev];
      while (next.length < nextPreset.teamCount) next.push({ playerA: '', playerB: '' });
      return next.slice(0, nextPreset.teamCount);
    });
  }

  function updateTeam(index: number, field: keyof TeamDraft, value: string) {
    setTeams((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  async function handleSubmit() {
    setError(null);
    if (!profile) {
      setError('Bitte melde dich erneut an.');
      return;
    }
    if (!name.trim()) {
      setError('Bitte gib dem Turnier einen Namen.');
      return;
    }
    const incomplete = teams.some((t) => !t.playerA.trim() || !t.playerB.trim());
    if (incomplete) {
      setError('Bitte trage für jedes Team beide Spielernamen ein.');
      return;
    }

    setLoading(true);
    try {
      const tournamentId = await createTournament({
        name: name.trim(),
        teams: teams.map((t, i) => ({
          name: `Team ${i + 1}`,
          playerA: t.playerA.trim(),
          playerB: t.playerB.trim(),
        })),
        numGroups: preset.numGroups,
        teamsPerGroupAdvance: preset.teamsPerGroupAdvance,
        createdBy: profile.uid,
        createdByUsername: profile.username,
      });
      navigation.replace('TournamentDetail', { tournamentId });
    } catch (e: any) {
      setError(e?.message ?? 'Turnier konnte nicht erstellt werden.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Neues Turnier</Text>
        <Text style={styles.subtitle}>Olympisches Format: Gruppenphase → K.o.-Runde → Medaillenspiele</Text>

        <TextField label="Turniername" value={name} onChangeText={setName} placeholder="z.B. Sommer Cup 2026" />

        <Text style={styles.label}>Turniergröße</Text>
        <View style={styles.presetRow}>
          {TOURNAMENT_PRESETS.map((p, i) => (
            <Pressable key={p.teamCount} onPress={() => selectPreset(i)}>
              <View style={[styles.presetPill, i === presetIndex && styles.presetPillActive]}>
                <Text style={[styles.presetLabel, i === presetIndex && styles.presetLabelActive]}>{p.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        <Text style={styles.presetDescription}>{preset.description}</Text>

        <Text style={[styles.label, styles.teamsLabel]}>Teams (2v2)</Text>
        {teams.map((team, i) => (
          <Card key={i} style={styles.teamCard}>
            <Text style={styles.teamTitle}>Team {i + 1}</Text>
            <View style={styles.playerRow}>
              <View style={styles.playerField}>
                <TextField
                  label="Spieler A"
                  value={team.playerA}
                  onChangeText={(v) => updateTeam(i, 'playerA', v)}
                  placeholder="Name"
                />
              </View>
              <View style={styles.playerField}>
                <TextField
                  label="Spieler B"
                  value={team.playerB}
                  onChangeText={(v) => updateTeam(i, 'playerB', v)}
                  placeholder="Name"
                />
              </View>
            </View>
          </Card>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label="Turnier erstellen" onPress={handleSubmit} loading={loading} style={styles.submit} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  title: { color: colors.white, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.mist, marginTop: 6, marginBottom: 24, fontSize: 13, lineHeight: 18 },
  label: { color: colors.mist, fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  teamsLabel: { marginTop: 8 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  presetPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  presetPillActive: { backgroundColor: colors.court, borderColor: colors.court },
  presetLabel: { color: colors.white, fontWeight: '700', fontSize: 13 },
  presetLabelActive: { color: colors.navyDeep },
  presetDescription: { color: colors.mist, fontSize: 12, marginBottom: 20 },
  teamCard: { marginBottom: 12 },
  teamTitle: { color: colors.court, fontWeight: '800', marginBottom: 8, fontSize: 13, textTransform: 'uppercase' },
  playerRow: { flexDirection: 'row', gap: 12 },
  playerField: { flex: 1 },
  error: { color: colors.danger, marginBottom: 12, fontSize: 13 },
  submit: { marginTop: 8 },
});
