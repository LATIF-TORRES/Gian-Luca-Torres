import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { colors } from '../theme/colors';
import { fetchLeaderboard } from '../services/tournaments';
import type { LeaderboardEntry } from '../types';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchLeaderboard();
      setEntries(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

        {loading ? (
          <Text style={styles.empty}>Lade Rangliste…</Text>
        ) : entries.length === 0 ? (
          <Card>
            <Text style={styles.empty}>Noch keine Turniere abgeschlossen. Spiel dich an die Spitze!</Text>
          </Card>
        ) : (
          entries.map((entry, index) => (
            <Card key={entry.uid} style={styles.row}>
              <Text style={styles.rank}>{MEDALS[index] ?? `${index + 1}.`}</Text>
              <Avatar name={entry.username} color={entry.avatarColor} size={40} />
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
