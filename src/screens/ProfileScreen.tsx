import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';
import { signOut } from '../services/auth';

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Abmelden fehlgeschlagen.');
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
          <Avatar name={profile.username} color={profile.avatarColor} size={84} />
          <Text style={styles.username}>{profile.username}</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Turniersiege" value={profile.stats.tournamentsWon} accent="gold" />
          <StatCard label="Siege" value={profile.stats.matchesWon} accent="success" />
          <StatCard label="Niederlagen" value={profile.stats.matchesLost} accent="danger" />
          <StatCard label="Winrate" value={`${winRate}%`} accent="accent" />
        </View>

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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '47%', alignItems: 'center', paddingVertical: 20 },
  statValue: { fontSize: 26, fontWeight: '900' },
  statLabel: { color: colors.mist, fontSize: 12, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  signOut: { marginTop: 8 },
});
