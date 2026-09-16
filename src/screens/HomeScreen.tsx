import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Avatar3D } from '../components/Avatar3D';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';
import { useTournamentStore } from '../store/useTournamentStore';
import { listenMyTournaments } from '../services/tournaments';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import type { Tournament } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const STATUS_LABEL: Record<Tournament['status'], string> = {
  groups: 'Gruppenphase',
  knockout: 'K.o.-Runde',
  completed: 'Abgeschlossen',
};

const STATUS_TONE: Record<Tournament['status'], 'accent' | 'warning' | 'success'> = {
  groups: 'accent',
  knockout: 'warning',
  completed: 'success',
};

export default function HomeScreen({ navigation }: Props) {
  const profile = useAuthStore((s) => s.profile);
  const { myTournaments, loading, setMyTournaments, setLoading } = useTournamentStore();

  useEffect(() => {
    if (!profile?.uid) return;
    setLoading(true);
    const unsubscribe = listenMyTournaments(profile.uid, (tournaments) => {
      setMyTournaments(tournaments);
      setLoading(false);
    });
    return unsubscribe;
  }, [profile?.uid]);

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Willkommen zurück,</Text>
            <Text style={styles.username}>{profile?.username ?? '...'}</Text>
          </View>
          <Avatar3D
            avatarUrl={profile?.avatarUrl}
            fallbackName={profile?.username ?? '?'}
            fallbackColor={profile?.avatarColor}
            size={52}
          />
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="+ Neues Turnier"
            onPress={() => navigation.navigate('CreateTournament')}
            style={styles.actionButton}
          />
          <PrimaryButton
            label="Mit Code beitreten"
            variant="ghost"
            onPress={() => navigation.navigate('JoinTournament')}
            style={styles.actionButton}
          />
        </View>

        <Text style={styles.sectionTitle}>Meine Turniere</Text>

        {loading ? (
          <Text style={styles.empty}>Lade Turniere…</Text>
        ) : myTournaments.length === 0 ? (
          <Card>
            <Text style={styles.empty}>
              Noch keine Turniere. Erstelle dein erstes olympisches Padel-Turnier mit Gruppenphase und
              K.o.-Runde!
            </Text>
          </Card>
        ) : (
          myTournaments.map((t) => (
            <Pressable key={t.id} onPress={() => navigation.navigate('TournamentDetail', { tournamentId: t.id })}>
              <Card style={styles.tournamentCard}>
                <View style={styles.tournamentRow}>
                  <Text style={styles.tournamentName}>{t.name}</Text>
                  <Chip label={STATUS_LABEL[t.status]} tone={STATUS_TONE[t.status]} />
                </View>
                <Text style={styles.tournamentMeta}>
                  {t.teams.length} Teams · Code {t.code}
                </Text>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { color: colors.mist, fontSize: 14 },
  username: { color: colors.white, fontSize: 24, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  actionButton: { flex: 1 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  empty: { color: colors.mist, lineHeight: 20 },
  tournamentCard: { marginBottom: 12 },
  tournamentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tournamentName: { color: colors.white, fontSize: 16, fontWeight: '700', flexShrink: 1, paddingRight: 8 },
  tournamentMeta: { color: colors.mist, fontSize: 13 },
});
