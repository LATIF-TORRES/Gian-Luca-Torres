import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { Avatar3D } from '../components/Avatar3D';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';
import { signOut, updateAvatarUrl } from '../services/auth';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Abmelden fehlgeschlagen.');
    }
  }

  async function handleAvatarReady(avatarUrl: string) {
    if (!profile) return;
    try {
      await updateAvatarUrl(profile.uid, avatarUrl);
      setProfile({ ...profile, avatarUrl });
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Avatar konnte nicht gespeichert werden.');
    }
  }

  if (!profile) return null;

  const winRate =
    profile.stats.matchesWon + profile.stats.matchesLost > 0
      ? Math.round((profile.stats.matchesWon / (profile.stats.matchesWon + profile.stats.matchesLost)) * 100)
      : 0;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar3D
            avatarUrl={profile.avatarUrl}
            fallbackName={profile.username}
            fallbackColor={profile.avatarColor}
            size={140}
          />
          <Text style={styles.username}>{profile.username}</Text>
          <PrimaryButton
            label={profile.avatarUrl ? '3D-Avatar bearbeiten' : '✨ Realistischen 3D-Avatar erstellen'}
            variant={profile.avatarUrl ? 'ghost' : 'accent'}
            onPress={() => navigation.navigate('AvatarCreator', { onAvatarReady: handleAvatarReady })}
            style={styles.avatarButton}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Turniersiege" value={profile.stats.tournamentsWon} accent="gold" />
          <StatCard label="Siege" value={profile.stats.matchesWon} accent="success" />
          <StatCard label="Niederlagen" value={profile.stats.matchesLost} accent="danger" />
          <StatCard label="Winrate" value={`${winRate}%`} accent="accent" />
        </View>

        {profile.training && (profile.training.wins > 0 || profile.training.losses > 0) && (
          <Card style={styles.trainingCard}>
            <Text style={styles.trainingLabel}>🤖 Trainingsbilanz gegen Bots</Text>
            <Text style={styles.trainingValue}>
              {profile.training.wins} Siege · {profile.training.losses} Niederlagen
            </Text>
          </Card>
        )}

        <PrimaryButton label="Abmelden" variant="ghost" onPress={handleSignOut} style={styles.signOut} />
      </ScrollView>
    </GradientBackground>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: 'gold' | 'success' | 'danger' | 'accent' }) {
  const colorMap = { gold: colors.gold, success: colors.success, danger: colors.danger, accent: colors.court };
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statValue, { color: colorMap[accent] }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  username: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 14 },
  avatarButton: { marginTop: 16, alignSelf: 'stretch' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '47%', alignItems: 'center', paddingVertical: 20 },
  statValue: { fontSize: 26, fontWeight: '900' },
  statLabel: { color: colors.mist, fontSize: 12, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  trainingCard: { alignItems: 'center', marginBottom: 24, paddingVertical: 16 },
  trainingLabel: { color: colors.mist, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  trainingValue: { color: colors.white, fontSize: 16, fontWeight: '800', marginTop: 6 },
  signOut: { marginTop: 8 },
});
