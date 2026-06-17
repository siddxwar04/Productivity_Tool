import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { useStreakStore } from '../../stores/streakStore';
import { GoalsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GoalsStackParamList, 'Streaks'>;

export function StreaksScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const current = useStreakStore((s) => s.current);
  const longest = useStreakStore((s) => s.longest);
  const lastDate = useStreakStore((s) => s.lastCompletedDate);

  const statRows = [
    { icon: 'trophy-outline' as const, label: 'Longest streak', value: `${longest} days`, color: '#F59E0B' },
    { icon: 'calendar-outline' as const, label: 'Last study day', value: lastDate || 'None yet', color: colors.primary },
  ];

  return (
    <ScreenWrapper>
      <ScreenHeader title="Streaks" onBack={() => navigation.goBack()} />

      <View style={[styles.hero, { backgroundColor: `${colors.streak}18`, borderColor: `${colors.streak}30`, borderWidth: 1 }]}>
        <Text style={styles.fireEmoji}>🔥</Text>
        <Text style={[styles.current, { color: colors.streak }]}>{current}</Text>
        <Text style={[styles.unit, { color: colors.streak }]}>day streak</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Current streak</Text>
      </View>

      <Card style={styles.statsCard}>
        {statRows.map((row, i) => (
          <View
            key={row.label}
            style={[
              styles.statRow,
              i < statRows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${row.color}18` }]}>
              <Ionicons name={row.icon} size={18} color={row.color} />
            </View>
            <View style={styles.statText}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{row.value}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <View style={styles.tipRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}18` }]}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.tip, { color: colors.textSecondary }]}>
            Complete a Pomodoro or study session each day to keep your streak alive.
          </Text>
        </View>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  fireEmoji: { fontSize: 48, marginBottom: 4 },
  current: { fontSize: 56, fontWeight: '800', lineHeight: 64 },
  unit: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  label: { fontSize: 14 },
  statsCard: { marginBottom: 12 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: { flex: 1 },
  statLabel: { fontSize: 12, marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '700' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  tip: { flex: 1, fontSize: 14, lineHeight: 20 },
});
