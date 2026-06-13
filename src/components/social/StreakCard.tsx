import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface StreakCardProps {
  friendName: string;
  streakCount: number;
  onPress?: () => void;
}

function StreakCardComponent({ friendName, streakCount, onPress }: StreakCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={styles.flame}>🔥</Text>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Group streak with {friendName}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Keep studying daily to maintain it
        </Text>
      </View>
      <View style={styles.countWrap}>
        <Text style={[styles.count, { color: colors.streak }]}>{streakCount}</Text>
        <Text style={styles.countFlame}>🔥</Text>
      </View>
    </TouchableOpacity>
  );
}

export const StreakCard = memo(StreakCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  flame: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  countWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  count: {
    fontSize: 22,
    fontWeight: '800',
  },
  countFlame: {
    fontSize: 16,
  },
});
