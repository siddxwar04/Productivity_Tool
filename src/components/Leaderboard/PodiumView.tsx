import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { TitleBadge } from './TitleBadge';
import { LeaderboardEntry } from '../../types/leaderboard';

const ENTRANCE_DELAYS: Record<1 | 2 | 3, number> = { 3: 0, 2: 150, 1: 300 };

// ─── Podium block ─────────────────────────────────────────────────────────────

const BLOCK_HEIGHTS = { 1: 80, 2: 64, 3: 52 };
const RING_COLORS: Record<number, string> = {
  1: '#F9CA24',
  2: '#BDC3C7',
  3: '#E67E22',
};
const GLOW_COLORS: Record<number, string> = {
  1: 'rgba(234, 179, 8, 0.15)',
  2: 'rgba(148, 163, 184, 0.15)',
  3: 'rgba(180, 83, 9, 0.15)',
};
const ICONS: Record<number, keyof typeof Ionicons.glyphMap> = {
  1: 'trophy',
  2: 'ribbon',
  3: 'star',
};

function PodiumBlock({ entry, rank }: { entry: LeaderboardEntry; rank: 1 | 2 | 3 }) {
  const { colors } = useTheme();
  const ringColor = RING_COLORS[rank];
  const glowColor = GLOW_COLORS[rank];
  const blockH = BLOCK_HEIGHTS[rank];
  const isFirst = rank === 1;

  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateY = useRef(new Animated.Value(20)).current;
  const floatTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 400,
        delay: ENTRANCE_DELAYS[rank],
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(entranceTranslateY, {
        toValue: 0,
        duration: 400,
        delay: ENTRANCE_DELAYS[rank],
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [entranceOpacity, entranceTranslateY, rank]);

  useEffect(() => {
    if (!isFirst) return;

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatTranslateY, {
          toValue: -6,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatTranslateY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatTranslateY, isFirst]);

  const blockContent = (
    <>
      {/* Crown / medal icon */}
      <View style={styles.iconAbove}>
        <Ionicons name={ICONS[rank]} size={isFirst ? 20 : 16} color={ringColor} />
      </View>

      {/* Avatar with ring */}
      <View style={[styles.avatarRing, { borderColor: ringColor }]}>
        <View style={[styles.avatar, { backgroundColor: entry.avatarColor }, isFirst && styles.avatarLarge]}>
          <Text style={[styles.avatarText, isFirst && styles.avatarTextLarge]}>
            {entry.avatarInitials}
          </Text>
        </View>
      </View>

      {/* Name */}
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {entry.displayName}
      </Text>

      {/* Hours */}
      <Text style={[styles.hours, { color: colors.textSecondary }]}>
        {entry.hoursDisplay}
      </Text>

      {/* Title badge */}
      <View style={styles.badgeWrap}>
        <TitleBadge title={entry.currentTitle} />
      </View>

      {/* Podium stand */}
      <View
        style={[
          styles.stand,
          {
            height: blockH,
            backgroundColor: `${ringColor}22`,
            borderColor: `${ringColor}55`,
          },
        ]}
      >
        <Text style={[styles.standRank, { color: ringColor }]}>#{rank}</Text>
      </View>
    </>
  );

  const entranceStyle = {
    backgroundColor: glowColor,
    opacity: entranceOpacity,
    transform: [{ translateY: entranceTranslateY }],
  };

  if (isFirst) {
    return (
      <Animated.View style={[styles.blockWrap, styles.blockCenter, entranceStyle]}>
        <Animated.View style={{ width: '100%', alignItems: 'center', transform: [{ translateY: floatTranslateY }] }}>
          {blockContent}
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.blockWrap, entranceStyle]}>
      {blockContent}
    </Animated.View>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface Props {
  entries: LeaderboardEntry[];
}

export function PodiumView({ entries }: Props) {
  if (entries.length < 3) return null;

  const first  = entries.find((e) => e.rank === 1)!;
  const second = entries.find((e) => e.rank === 2)!;
  const third  = entries.find((e) => e.rank === 3)!;

  return (
    <View style={styles.container}>
      {/* 2nd | 1st | 3rd */}
      <View style={styles.podium}>
        <PodiumBlock entry={second} rank={2} />
        <PodiumBlock entry={first}  rank={1} />
        <PodiumBlock entry={third}  rank={3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  blockWrap: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 110,
    borderRadius: 16,
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  blockCenter: {
    flex: 1.1,
    maxWidth: 120,
  },
  iconAbove: {
    marginBottom: 4,
  },
  avatarRing: {
    borderWidth: 2.5,
    borderRadius: 100,
    padding: 2,
    marginBottom: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  avatarTextLarge: {
    fontSize: 18,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  hours: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  badgeWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  stand: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  standRank: {
    fontSize: 14,
    fontWeight: '900',
  },
});
