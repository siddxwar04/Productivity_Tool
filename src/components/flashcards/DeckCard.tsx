import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ProgressBar } from '../ui/ProgressBar';
import { FlashcardDeckStats } from '../../types/flashcard';
import { formatRelativeDate } from '../../services/flashcards/flashcardStats';

interface DeckCardProps {
  name: string;
  color: string;
  categoryIcon: string;
  stats: FlashcardDeckStats;
  onPress: () => void;
}

export function DeckCard({ name, color, categoryIcon, stats, onPress }: DeckCardProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.topRow}>
          <View style={[styles.iconBox, { backgroundColor: `${color}22` }]}>
            <Text style={styles.icon}>{categoryIcon}</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {stats.totalCards} cards · {stats.dueCount} due
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>

        <View style={styles.statsRow}>
          <StatPill label="Mastered" value={`${stats.masteredCards}`} colors={colors} />
          <StatPill label="Progress" value={`${stats.progressPercent}%`} colors={colors} accent={color} />
          <StatPill label="Studied" value={formatRelativeDate(stats.lastStudiedAt)} colors={colors} />
        </View>

        <ProgressBar progress={stats.progressPercent / 100} color={color} height={6} />
      </Animated.View>
    </Pressable>
  );
}

function StatPill({
  label,
  value,
  colors,
  accent,
}: {
  label: string;
  value: string;
  colors: { text: string; textSecondary: string };
  accent?: string;
}) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.pillValue, { color: accent ?? colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  titleBlock: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  pill: { flex: 1 },
  pillLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  pillValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
});
