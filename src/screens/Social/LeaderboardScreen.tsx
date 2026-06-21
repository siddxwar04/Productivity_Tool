import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PodiumView } from '../../components/Leaderboard/PodiumView';
import { RankCard } from '../../components/Leaderboard/RankCard';
import { getFriendsLeaderboard, subscribeToLeaderboard } from '../../services/leaderboardService';
import { LeaderboardEntry } from '../../types/leaderboard';
import { SocialStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SocialStackParamList, 'Leaderboard'>;

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useWeeklyCountdown() {
  const [text, setText] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const day = now.getUTCDay(); // 0=Sun
      const daysToNextMonday = day === 0 ? 1 : 8 - day;
      const nextMonday = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + daysToNextMonday,
        ),
      );
      const diffMs = nextMonday.getTime() - now.getTime();
      const totalSec = Math.max(0, Math.floor(diffMs / 1000));
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);

      if (days > 0) setText(`${days}d ${hours}h`);
      else if (hours > 0) setText(`${hours}h ${mins}m`);
      else setText(`${mins}m`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return text;
}

// ─── Week range string ────────────────────────────────────────────────────────

function getWeekRange(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysToMonday),
  );
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export function LeaderboardScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const countdown = useWeeklyCountdown();
  const weekRange = getWeekRange();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    const data = await getFriendsLeaderboard();
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const unsub = subscribeToLeaderboard(() => load());
    return unsub;
  }, [load]);

  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const friendCount = entries.filter((e) => !e.isCurrentUser).length;

  const visible = showAll ? entries : entries.slice(0, PAGE_SIZE);

  const headerRight = (
    <View style={styles.headerIcons}>
      <TouchableOpacity
        onPress={() => navigation.navigate('SocialHub')}
        hitSlop={{ top: 10, bottom: 10, left: 6, right: 4 }}
      >
        <Ionicons name="people-outline" size={20} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Friends')}
        hitSlop={{ top: 10, bottom: 10, left: 4, right: 6 }}
      >
        <Ionicons name="person-add-outline" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Leaderboard" right={headerRight} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (friendCount < 1) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Leaderboard" right={headerRight} />
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="trophy-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No one to compete with yet!
          </Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Add friends to see the leaderboard and compete for the top spot each week.
          </Text>
          <TouchableOpacity
            style={[styles.inviteBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Friends')}
          >
            <Ionicons name="person-add-outline" size={16} color="#FFF" />
            <Text style={styles.inviteBtnText}>Add friends</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader title="Leaderboard" right={headerRight} />

      {/* ── Week header card ────────────────────────────────────────────────── */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          This week's leaderboard
        </Text>
        <Text style={[styles.weekRange, { color: colors.textSecondary }]}>
          {weekRange}
        </Text>

        <View style={styles.chipsRow}>
          {countdown ? (
            <View style={[styles.chip, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                Resets in {countdown}
              </Text>
            </View>
          ) : null}

          {currentUserEntry ? (
            <View style={[styles.chip, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="person" size={13} color={colors.primary} />
              <Text style={[styles.chipText, { color: colors.primary }]}>
                You are #{currentUserEntry.rank} this week
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Podium (top-3) ──────────────────────────────────────────────────── */}
      {entries.length >= 3 && <PodiumView entries={entries} />}

      {/* ── Full rankings ───────────────────────────────────────────────────── */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>RANKINGS</Text>

      {visible.map((entry) => (
        <RankCard key={entry.userId} entry={entry} />
      ))}

      {!showAll && entries.length > PAGE_SIZE && (
        <TouchableOpacity
          style={[styles.showMoreBtn, { borderColor: colors.border }]}
          activeOpacity={0.75}
          onPress={() => setShowAll(true)}
        >
          <Text style={[styles.showMoreText, { color: colors.primary }]}>
            Show {entries.length - PAGE_SIZE} more
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  weekRange: {
    fontSize: 13,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  inviteBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
