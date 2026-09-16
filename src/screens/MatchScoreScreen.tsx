import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { NumberStepper } from '../components/NumberStepper';
import { colors } from '../theme/colors';
import { listenTournament, updateGroupMatchScore, updateKnockoutMatchScore } from '../services/tournaments';
import { decideWinner } from '../utils/tournamentEngine';
import type { RootStackParamList } from '../navigation/types';
import type { Match, Tournament } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MatchScore'>;

const MAX_SETS = 3;

export default function MatchScoreScreen({ route, navigation }: Props) {
  const { tournamentId, matchId, scope, groupId } = route.params;
  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined);
  const [setsA, setSetsA] = useState<number[]>([0, 0]);
  const [setsB, setSetsB] = useState<number[]>([0, 0]);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = listenTournament(tournamentId, setTournament);
    return unsubscribe;
  }, [tournamentId]);

  const match: Match | undefined = useMemo(() => {
    if (!tournament) return undefined;
    if (scope === 'group') {
      const group = tournament.groups.find((g) => g.id === groupId);
      return group?.matches.find((m) => m.id === matchId);
    }
    return tournament.knockout.find((m) => m.id === matchId);
  }, [tournament, scope, groupId, matchId]);

  useEffect(() => {
    if (match && !initialized) {
      if (match.scoreA && match.scoreB) {
        setSetsA(match.scoreA);
        setSetsB(match.scoreB);
      }
      setInitialized(true);
    }
  }, [match, initialized]);

  if (tournament === undefined || !match) {
    return (
      <GradientBackground>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Lade Match…</Text>
        </View>
      </GradientBackground>
    );
  }

  const teamA = tournament!.teams.find((t) => t.id === match.teamAId);
  const teamB = tournament!.teams.find((t) => t.id === match.teamBId);
  const winnerId = decideWinner(match, setsA, setsB);

  function addSet() {
    if (setsA.length >= MAX_SETS) return;
    setSetsA((s) => [...s, 0]);
    setSetsB((s) => [...s, 0]);
  }

  function removeSet() {
    if (setsA.length <= 1) return;
    setSetsA((s) => s.slice(0, -1));
    setSetsB((s) => s.slice(0, -1));
  }

  async function handleSave() {
    if (!winnerId) {
      Alert.alert('Unentschieden', 'Es muss ein eindeutiges Ergebnis geben (kein Satz-Gleichstand).');
      return;
    }
    setSaving(true);
    try {
      if (scope === 'group' && groupId) {
        await updateGroupMatchScore(tournamentId, groupId, matchId, setsA, setsB);
      } else {
        await updateKnockoutMatchScore(tournamentId, matchId, setsA, setsB);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Ergebnis konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{match.round}</Text>
        <Text style={styles.subtitle}>Trage das Satz-Ergebnis ein</Text>

        <Card style={styles.card}>
          <View style={styles.teamHeaderRow}>
            <Text style={[styles.teamName, winnerId === teamA?.id && styles.winner]} numberOfLines={2}>
              {teamA ? `${teamA.playerA} / ${teamA.playerB}` : '—'}
            </Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={[styles.teamName, styles.teamNameRight, winnerId === teamB?.id && styles.winner]} numberOfLines={2}>
              {teamB ? `${teamB.playerA} / ${teamB.playerB}` : '—'}
            </Text>
          </View>

          {setsA.map((_, i) => (
            <View key={i} style={styles.setRow}>
              <Text style={styles.setLabel}>Satz {i + 1}</Text>
              <View style={styles.steppers}>
                <NumberStepper value={setsA[i]} onChange={(v) => setSetsA((s) => s.map((x, idx) => (idx === i ? v : x)))} />
                <Text style={styles.dash}>–</Text>
                <NumberStepper value={setsB[i]} onChange={(v) => setSetsB((s) => s.map((x, idx) => (idx === i ? v : x)))} />
              </View>
            </View>
          ))}

          <View style={styles.setActions}>
            <PrimaryButton variant="ghost" label="− Satz entfernen" onPress={removeSet} disabled={setsA.length <= 1} style={styles.smallButton} />
            <PrimaryButton variant="ghost" label="+ Satz hinzufügen" onPress={addSet} disabled={setsA.length >= MAX_SETS} style={styles.smallButton} />
          </View>
        </Card>

        {winnerId && (
          <Text style={styles.winnerText}>
            🏆 {winnerId === teamA?.id ? `${teamA?.playerA} / ${teamA?.playerB}` : `${teamB?.playerA} / ${teamB?.playerB}`} gewinnt
          </Text>
        )}

        <PrimaryButton label="Ergebnis speichern" onPress={handleSave} loading={saving} variant="accent" style={styles.saveButton} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.mist },
  title: { color: colors.white, fontSize: 22, fontWeight: '900' },
  subtitle: { color: colors.mist, marginTop: 6, marginBottom: 20, fontSize: 13 },
  card: { marginBottom: 20 },
  teamHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  teamName: { color: colors.white, fontWeight: '700', fontSize: 14, flex: 1 },
  teamNameRight: { textAlign: 'right' },
  winner: { color: colors.court },
  vs: { color: colors.mist, marginHorizontal: 10, fontSize: 12 },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  setLabel: { color: colors.mist, fontSize: 13, fontWeight: '600' },
  steppers: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dash: { color: colors.mist, fontSize: 16 },
  setActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  smallButton: { flex: 1 },
  winnerText: { color: colors.gold, textAlign: 'center', fontWeight: '800', marginBottom: 16, fontSize: 15 },
  saveButton: {},
});
