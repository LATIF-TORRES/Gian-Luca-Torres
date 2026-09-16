import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { Avatar3D } from '../components/Avatar3D';
import { TimingMeter } from '../components/TimingMeter';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';
import { recordTrainingResult } from '../services/auth';
import {
  BOTS,
  applyPoint,
  createInitialMatchState,
  matchSetsSummary,
  pointLabel,
  resolvePoint,
  type BotProfile,
  type HitQuality,
  type LiveMatchState,
  type PointWinner,
} from '../utils/botEngine';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Training'>;
type Phase = 'select' | 'live' | 'result';

const QUALITY_LABEL: Record<HitQuality, string> = { perfect: 'PERFEKT! 🎯', good: 'Gut getroffen', miss: 'Verfehlt!' };

export default function TrainingScreen({ navigation }: Props) {
  const profile = useAuthStore((s) => s.profile);
  const [phase, setPhase] = useState<Phase>('select');
  const [bot, setBot] = useState<BotProfile | null>(null);
  const [match, setMatch] = useState<LiveMatchState>(createInitialMatchState());
  const [resetKey, setResetKey] = useState(0);
  const [awaiting, setAwaiting] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ quality: HitQuality; winner: PointWinner } | null>(null);
  const [saved, setSaved] = useState(false);

  function startMatch(selected: BotProfile) {
    setBot(selected);
    setMatch(createInitialMatchState());
    setLastPoint(null);
    setSaved(false);
    setResetKey((k) => k + 1);
    setPhase('live');
  }

  function handleHitResult(quality: HitQuality) {
    if (!bot || awaiting) return;
    setAwaiting(true);
    const winner = resolvePoint(bot, quality);
    setLastPoint({ quality, winner });

    setTimeout(() => {
      setMatch((current) => {
        const next = applyPoint(current, winner);
        if (next.phase === 'finished') {
          setPhase('result');
          if (profile && !saved) {
            setSaved(true);
            recordTrainingResult(profile.uid, next.winner === 'player').catch(() => {});
          }
        } else {
          setResetKey((k) => k + 1);
        }
        return next;
      });
      setAwaiting(false);
    }, 500);
  }

  function renderSelect() {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🤖 Training gegen Bots</Text>
        <Text style={styles.subtitle}>
          Triff den Ball im richtigen Moment: Tippe, wenn der Marker in der grünen Zone ist, um den Punkt zu
          gewinnen. Wähle deinen Gegner:
        </Text>
        {BOTS.map((b) => (
          <Pressable key={b.id} onPress={() => startMatch(b)}>
            <Card style={styles.botCard}>
              <Text style={styles.botEmoji}>{b.emoji}</Text>
              <View style={styles.botInfo}>
                <Text style={styles.botName}>{b.name}</Text>
                <Text style={styles.botTagline}>{b.tagline}</Text>
              </View>
              <Chip label="Trainieren" tone="accent" />
            </Card>
          </Pressable>
        ))}
        {profile?.training && (profile.training.wins > 0 || profile.training.losses > 0) && (
          <Text style={styles.recordText}>
            Deine Trainingsbilanz: {profile.training.wins} Siege · {profile.training.losses} Niederlagen
          </Text>
        )}
      </ScrollView>
    );
  }

  function renderLive() {
    if (!bot) return null;
    const sets = matchSetsSummary(match);
    const games = match.currentSetGames;
    const isTiebreak = match.phase === 'tiebreak';

    return (
      <View style={styles.content}>
        <View style={styles.matchHeader}>
          <View style={styles.matchSide}>
            <Avatar3D avatarUrl={profile?.avatarUrl} fallbackName={profile?.username ?? 'Du'} fallbackColor={profile?.avatarColor} size={64} />
            <Text style={styles.matchName}>Du</Text>
          </View>
          <Text style={styles.setsScore}>
            {sets.player} : {sets.bot}
          </Text>
          <View style={styles.matchSide}>
            <View style={[styles.botAvatarCircle, { backgroundColor: bot.color }]}>
              <Text style={styles.botAvatarEmoji}>{bot.emoji}</Text>
            </View>
            <Text style={styles.matchName}>{bot.name}</Text>
          </View>
        </View>

        <Card style={styles.scoreCard}>
          <Text style={styles.gamesLabel}>Spiele in diesem Satz</Text>
          <Text style={styles.gamesScore}>
            {games.player} : {games.bot}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.pointsLabel}>{isTiebreak ? 'Tiebreak' : 'Aktuelles Spiel'}</Text>
          <Text style={styles.pointsScore}>
            {isTiebreak ? `${match.tiebreakPoints.player} : ${match.tiebreakPoints.bot}` : `${pointLabel(match.currentGamePoints.player, match.currentGamePoints.bot)} : ${pointLabel(match.currentGamePoints.bot, match.currentGamePoints.player)}`}
          </Text>
        </Card>

        {match.completedSets.length > 0 && (
          <View style={styles.setsHistory}>
            {match.completedSets.map((s, i) => (
              <Chip key={i} label={`Satz ${i + 1}: ${s.player}-${s.bot}`} tone={s.player > s.bot ? 'success' : 'warning'} />
            ))}
          </View>
        )}

        <View style={styles.meterWrapper}>
          {lastPoint && (
            <Text style={[styles.feedback, lastPoint.winner === 'player' ? styles.feedbackWin : styles.feedbackLoss]}>
              {QUALITY_LABEL[lastPoint.quality]} · {lastPoint.winner === 'player' ? 'Punkt für dich!' : 'Punkt für ' + bot.name}
            </Text>
          )}
          <TimingMeter
            sweetSpotWidth={bot.sweetSpotWidth}
            goodSpotWidth={bot.goodSpotWidth}
            cycleMs={bot.cycleMs}
            active={!awaiting}
            resetKey={resetKey}
            onResult={handleHitResult}
          />
        </View>
      </View>
    );
  }

  function renderResult() {
    if (!bot) return null;
    const won = match.winner === 'player';
    return (
      <View style={styles.content}>
        <Text style={styles.resultEmoji}>{won ? '🏆' : '💪'}</Text>
        <Text style={styles.resultTitle}>{won ? 'Sieg!' : 'Niederlage'}</Text>
        <Text style={styles.resultSubtitle}>
          {won ? `Du hast ${bot.name} geschlagen!` : `${bot.name} war heute stärker. Nochmal versuchen?`}
        </Text>

        <Card style={styles.resultCard}>
          {match.completedSets.map((s, i) => (
            <View key={i} style={styles.resultSetRow}>
              <Text style={styles.resultSetLabel}>Satz {i + 1}</Text>
              <Text style={[styles.resultSetScore, s.player > s.bot ? styles.feedbackWin : styles.feedbackLoss]}>
                {s.player} : {s.bot}
              </Text>
            </View>
          ))}
        </Card>

        <PrimaryButton label={`Nochmal gegen ${bot.name}`} variant="accent" onPress={() => startMatch(bot)} style={styles.resultButton} />
        <PrimaryButton label="Anderen Bot wählen" variant="ghost" onPress={() => setPhase('select')} style={styles.resultButton} />
      </View>
    );
  }

  return (
    <GradientBackground>
      {phase === 'select' && renderSelect()}
      {phase === 'live' && renderLive()}
      {phase === 'result' && renderResult()}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, flexGrow: 1 },
  title: { color: colors.white, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.mist, marginTop: 8, marginBottom: 24, fontSize: 13, lineHeight: 19 },
  botCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 14 },
  botEmoji: { fontSize: 32 },
  botInfo: { flex: 1 },
  botName: { color: colors.white, fontWeight: '800', fontSize: 16 },
  botTagline: { color: colors.mist, fontSize: 12, marginTop: 2 },
  recordText: { color: colors.mist, textAlign: 'center', marginTop: 12, fontSize: 12 },

  matchHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  matchSide: { alignItems: 'center', flex: 1 },
  matchName: { color: colors.white, fontWeight: '700', fontSize: 13, marginTop: 8 },
  setsScore: { color: colors.gold, fontSize: 28, fontWeight: '900', paddingHorizontal: 12 },
  botAvatarCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  botAvatarEmoji: { fontSize: 28 },

  scoreCard: { alignItems: 'center', marginBottom: 16 },
  gamesLabel: { color: colors.mist, fontSize: 11, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
  gamesScore: { color: colors.white, fontSize: 22, fontWeight: '800', marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.cardBorder, alignSelf: 'stretch', marginVertical: 12 },
  pointsLabel: { color: colors.mist, fontSize: 11, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
  pointsScore: { color: colors.court, fontSize: 32, fontWeight: '900', marginTop: 4 },

  setsHistory: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 },

  meterWrapper: { marginTop: 'auto' },
  feedback: { textAlign: 'center', fontWeight: '800', marginBottom: 14, fontSize: 14 },
  feedbackWin: { color: colors.court },
  feedbackLoss: { color: colors.danger },

  resultEmoji: { fontSize: 64, textAlign: 'center', marginTop: 20 },
  resultTitle: { color: colors.white, fontSize: 28, fontWeight: '900', textAlign: 'center', marginTop: 12 },
  resultSubtitle: { color: colors.mist, textAlign: 'center', marginTop: 8, marginBottom: 24, fontSize: 14 },
  resultCard: { marginBottom: 24 },
  resultSetRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  resultSetLabel: { color: colors.mist, fontSize: 14 },
  resultSetScore: { fontSize: 15, fontWeight: '800' },
  resultButton: { marginBottom: 12 },
});
