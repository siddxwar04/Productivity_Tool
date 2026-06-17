import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useUserProfileStore } from '../../stores/userProfileStore';
import { formatStudyTime } from '../../utils/helpers';
import { GoalsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GoalsStackParamList, 'Analytics'>;

const STAT_CONFIG = [
  { key: 'today', icon: 'time-outline' as const, color: '#6366F1', label: 'Today' },
  { key: 'total', icon: 'library-outline' as const, color: '#10B981', label: 'Total hours' },
  { key: 'pomodoros', icon: 'timer-outline' as const, color: '#F59E0B', label: 'Pomodoros' },
] as const;

export function AnalyticsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const todayStudyMinutes = useAnalyticsStore((s) => s.todayStudyMinutes);
  const totalStudyHours = useAnalyticsStore((s) => s.totalStudyHours);
  const totalPomodoros = useAnalyticsStore((s) => s.totalPomodoros);
  const dailyHistory = useAnalyticsStore((s) => s.dailyHistory);
  const goalHours = useUserProfileStore((s) => s.goals.studyHoursPerDay);

  const statValues: Record<string, string> = {
    today: formatStudyTime(todayStudyMinutes),
    total: `${totalStudyHours.toFixed(1)}h`,
    pomodoros: String(totalPomodoros),
  };

  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      return {
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        minutes: dailyHistory[key] ?? 0,
      };
    });
  }, [dailyHistory]);

  const maxMin = useMemo(
    () => Math.max(...last7.map((d) => d.minutes), goalHours * 60, 1),
    [last7, goalHours],
  );

  return (
    <ScreenWrapper>
      <ScreenHeader title="Analytics" onBack={() => navigation.goBack()} />

      <View style={styles.statsRow}>
        {STAT_CONFIG.map((cfg) => (
          <View
            key={cfg.key}
            style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.statIcon, { backgroundColor: `${cfg.color}18` }]}>
              <Ionicons name={cfg.icon} size={18} color={cfg.color} />
            </View>
            <Text style={[styles.statVal, { color: cfg.color }]}>{statValues[cfg.key]}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{cfg.label}</Text>
          </View>
        ))}
      </View>

      <Card>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Last 7 days</Text>
          <View style={styles.goalChip}>
            <Ionicons name="flag-outline" size={12} color={colors.primary} />
            <Text style={[styles.goalChipText, { color: colors.primary }]}>Goal: {goalHours}h/day</Text>
          </View>
        </View>
        <View style={styles.chart}>
          {last7.map((d) => {
            const pct = d.minutes / maxMin;
            const isGoalMet = d.minutes >= goalHours * 60;
            return (
              <View key={d.label} style={styles.barCol}>
                <View style={[styles.barTrack, { backgroundColor: colors.surfaceSecondary }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${pct * 100}%`,
                        backgroundColor: isGoalMet ? '#10B981' : colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.textMuted }]}>{d.label}</Text>
              </View>
            );
          })}
        </View>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '500' },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99,102,241,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  goalChipText: { fontSize: 11, fontWeight: '600' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, marginTop: 6 },
});
