import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Avatar3D } from '../components/Avatar3D';
import { colors } from '../theme/colors';
import { fetchLeaderboard } from '../services/dataLayer';
import { useAuthStore } from '../store/useAuthStore';
import type { LeaderboardEntry } from '../types';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (isGuest) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await fetchLeaderboard();
      setEntries(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isGuest]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.court}
          />
        }
      >
        <Text style={styles.title}>Rangliste</Text>
        <Text style={styles.subtitle}>Die erfolgreichsten Spieler:innen der Padel Arena</Text>

        {isGuest ? (
          <Card>
            <Text style={styles.empty}>
              🔒 Die Rangliste ist ein Online-Feature und vergleicht registrierte Konten. Im Gastmodus gibt es
              keine anderen Spieler:innen zum Vergleichen – lege dir jederzeit ein kostenloses Online-Konto an,
              um mitzumachen.
            </Text>
          </Card>
        ) : loading ? (
          <Text style={styles.empty}>Lade Rangliste…</Text>
        ) : entries.length === 0 ? (
          <Card>
            <Text style={styles.empty}>Noch keine Turniere abgeschlossen. Spiel dich an die Spitze!</Text>
          </Card>
        ) : (
          entries.map((entry, index) => (
            <Card key={entry.uid} style={styles.row}>
              <Text style={styles.rank}>{MEDALS[index] ?? `${index + 1}.`}</Text>
              {index < 3 ? (
                <Avatar3D avatarUrl={entry.avatarUrl} fallbackName={entry.username} fallbackColor={entry.avatarColor} size={40} />
              ) : (
                <Avatar name={entry.username} color={entry.avatarColor} size={40} />
              )}
              <View style={styles.info}>
                <Text style={styles.username}>{entry.username}</Text>
                <Text style={styles.stats}>
                  {entry.tournamentsWon} Turniersiege · {entry.matchesWon}S / {entry.matchesLost}N
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { color: colors.white, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.mist, marginTop: 6, marginBottom: 24, fontSize: 13 },
  empty: { color: colors.mist, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
  rank: { width: 30, fontSize: 16, textAlign: 'center' },
  info: { flex: 1 },
  username: { color: colors.white, fontWeight: '800', fontSize: 15 },
  stats: { color: colors.mist, fontSize: 12, marginTop: 2 },
});
