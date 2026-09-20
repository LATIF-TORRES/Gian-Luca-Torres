import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { GroupStandingsTable } from '../components/GroupStandingsTable';
import { MatchCard } from '../components/MatchCard';
import { BracketView } from '../components/BracketView';
import { MedalPodium } from '../components/MedalPodium';
import { colors } from '../theme/colors';
import { listenTournament, startKnockoutStage } from '../services/dataLayer';
import { isGuestTournamentId } from '../services/localTournaments';
import { allGroupsComplete } from '../utils/tournamentEngine';
import type { RootStackParamList } from '../navigation/types';
import type { Match, Tournament } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TournamentDetail'>;
type Tab = 'groups' | 'knockout' | 'podium';

export default function TournamentDetailScreen({ route, navigation }: Props) {
  const { tournamentId } = route.params;
  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('groups');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const unsubscribe = listenTournament(tournamentId, (t) => {
      setTournament(t);
      setTab((current) => (current === 'groups' && t?.status !== 'groups' ? (t?.status === 'completed' ? 'podium' : 'knockout') : current));
    });
    return unsubscribe;
  }, [tournamentId]);

  const teamsById = useMemo(() => {
    const map: Record<string, Tournament['teams'][number]> = {};
    tournament?.teams.forEach((t) => (map[t.id] = t));
    return map;
  }, [tournament]);

  if (tournament === undefined) {
    return (
      <GradientBackground>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Lade Turnier…</Text>
        </View>
      </GradientBackground>
    );
  }

  if (tournament === null) {
    return (
      <GradientBackground>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Turnier nicht gefunden.</Text>
        </View>
      </GradientBackground>
    );
  }

  const groupsDone = allGroupsComplete(tournament.groups);

  function openMatch(match: Match, scope: 'group' | 'knockout', groupId?: string) {
    if (!match.teamAId || !match.teamBId) return;
    navigation.navigate('MatchScore', { tournamentId, matchId: match.id, scope, groupId });
  }

  async function handleStartKnockout() {
    setStarting(true);
    try {
      await startKnockoutStage(tournamentId);
      setTab('knockout');
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'K.o.-Runde konnte nicht gestartet werden.');
    } finally {
      setStarting(false);
    }
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{tournament.name}</Text>
        <View style={styles.metaRow}>
          {isGuestTournamentId(tournament.id) ? (
            <Chip label="🔒 Nur auf diesem Gerät" tone="neutral" />
          ) : (
            <Chip label={`Code: ${tournament.code}`} tone="neutral" />
          )}
          <Chip
            label={tournament.status === 'groups' ? 'Gruppenphase' : tournament.status === 'knockout' ? 'K.o.-Runde' : 'Abgeschlossen'}
            tone={tournament.status === 'completed' ? 'success' : 'accent'}
          />
        </View>

        <View style={styles.tabs}>
          <TabButton label="Gruppen" active={tab === 'groups'} onPress={() => setTab('groups')} />
          <TabButton
            label="K.o.-Runde"
            active={tab === 'knockout'}
            onPress={() => setTab('knockout')}
            disabled={tournament.knockout.length === 0}
          />
          <TabButton
            label="Podium"
            active={tab === 'podium'}
            onPress={() => setTab('podium')}
            disabled={tournament.status !== 'completed'}
          />
        </View>

        {tab === 'groups' && (
          <View>
            {tournament.groups.map((group) => (
              <Card key={group.id} style={styles.groupCard}>
                <Text style={styles.groupTitle}>{group.name}</Text>
                <GroupStandingsTable group={group} teamsById={teamsById} qualifySlots={tournament.teamsPerGroupAdvance} />
                <Text style={styles.matchesLabel}>Spiele</Text>
                {group.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    teamsById={teamsById}
                    onPress={() => openMatch(match, 'group', group.id)}
                  />
                ))}
              </Card>
            ))}

            {tournament.status === 'groups' && (
              <PrimaryButton
                label={groupsDone ? 'K.o.-Runde starten 🏆' : 'Alle Gruppenspiele eintragen, um fortzufahren'}
                onPress={handleStartKnockout}
                disabled={!groupsDone}
                loading={starting}
                variant="accent"
                style={styles.startButton}
              />
            )}
          </View>
        )}

        {tab === 'knockout' && (
          <BracketView
            knockout={tournament.knockout}
            teamsById={teamsById}
            onSelectMatch={(match) => openMatch(match, 'knockout')}
          />
        )}

        {tab === 'podium' && (
          <Card>
            <Text style={styles.groupTitle}>🏆 Endstand</Text>
            <MedalPodium
              gold={tournament.medals.gold ? teamsById[tournament.medals.gold] : undefined}
              silver={tournament.medals.silver ? teamsById[tournament.medals.silver] : undefined}
              bronze={tournament.medals.bronze ? teamsById[tournament.medals.bronze] : undefined}
            />
          </Card>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

function TabButton({
  label,
  active,
  onPress,
  disabled,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.tabButtonWrapper}>
      <View style={[styles.tabButton, active && styles.tabButtonActive, disabled && styles.tabButtonDisabled]}>
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.mist },
  title: { color: colors.white, fontSize: 24, fontWeight: '900' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tabButtonWrapper: { flex: 1 },
  tabButton: {
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabButtonActive: { backgroundColor: colors.court, borderColor: colors.court },
  tabButtonDisabled: { opacity: 0.4 },
  tabLabel: { color: colors.white, fontWeight: '700', fontSize: 13 },
  tabLabelActive: { color: colors.navyDeep },
  groupCard: { marginBottom: 16 },
  groupTitle: { color: colors.court, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  matchesLabel: { color: colors.mist, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 14, marginBottom: 8 },
  startButton: { marginTop: 8 },
});
