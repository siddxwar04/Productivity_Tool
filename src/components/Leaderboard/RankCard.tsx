import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { TitleBadge } from './TitleBadge';
import { LeaderboardEntry } from '../../types/leaderboard';

const RANK_COLORS: Record<number, string> = {
  1: '#F9CA24',
  2: '#BDC3C7',
  3: '#E67E22',
};

interface Props {
  entry: LeaderboardEntry;
}

export function RankCard({ entry }: Props) {
  const { colors } = useTheme();

  const rankColor = RANK_COLORS[entry.rank] ?? colors.textMuted;
  const isTopThree = entry.rank <= 3;

  const rankChangeIcon = (): React.ReactNode => {
    if (entry.rankChangeVsLastWeek > 0) {
      return <Ionicons name="arrow-up" size={12} color="#10B981" />;
    }
    if (entry.rankChangeVsLastWeek < 0) {
      return <Ionicons name="arrow-down" size={12} color="#EF4444" />;
    }
    return <Text style={[styles.dash, { color: colors.textMuted }]}>—</Text>;
  };

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: entry.isCurrentUser
            ? `${colors.primary}10`
            : colors.surface,
          borderColor: colors.border,
          borderLeftColor: entry.isCurrentUser ? colors.primary : colors.border,
          borderLeftWidth: entry.isCurrentUser ? 3 : 1,
        },
      ]}
    >
      {/* Rank number */}
      <View style={styles.rankWrap}>
        <Text
          style={[
            styles.rankNum,
            { color: isTopThree ? rankColor : colors.textMuted },
            isTopThree && styles.rankNumBold,
          ]}
        >
          #{entry.rank}
        </Text>
      </View>

      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: entry.avatarColor }]}>
        <Text style={styles.avatarText}>{entry.avatarInitials}</Text>
      </View>

      {/* Name + badge */}
      <View style={styles.nameCol}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {entry.displayName}
        </Text>
        <TitleBadge title={entry.currentTitle} />
      </View>

      {/* Hours */}
      <Text style={[styles.hours, { color: colors.textSecondary }]}>
        {entry.hoursDisplay}
      </Text>

      {/* Rank change */}
      <View style={styles.changeWrap}>{rankChangeIcon()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingRight: 14,
    paddingLeft: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  rankWrap: {
    width: 32,
    alignItems: 'center',
  },
  rankNum: {
    fontSize: 13,
    fontWeight: '600',
  },
  rankNumBold: {
    fontWeight: '800',
    fontSize: 14,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  nameCol: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  hours: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 52,
    textAlign: 'right',
  },
  changeWrap: {
    width: 18,
    alignItems: 'center',
  },
  dash: {
    fontSize: 13,
    fontWeight: '700',
  },
});
