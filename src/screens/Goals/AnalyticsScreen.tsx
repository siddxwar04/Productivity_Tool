import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

export function AnalyticsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const todayStudyMinutes = useAnalyticsStore((s) => s.todayStudyMinutes);
  const totalStudyHours = useAnalyticsStore((s) => s.totalStudyHours);
  const totalPomodoros = useAnalyticsStore((s) => s.totalPomodoros);
  const dailyHistory = useAnalyticsStore((s) => s.dailyHistory);
  const goalHours = useUserProfileStore((s) => s.goals.studyHoursPerDay);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), minutes: dailyHistory[key] ?? 0 };
  });
  const maxMin = Math.max(...last7.map((d) => d.minutes), goalHours * 60, 1);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Analytics" onBack={() => navigation.goBack()} />
      <View style={styles.statsRow}>
        {[
          { label: 'Today', value: formatStudyTime(todayStudyMinutes) },
          { label: 'Total hours', value: `${totalStudyHours.toFixed(1)}h` },
          { label: 'Pomodoros', value: String(totalPomodoros) },
        ].map((s) => (
          <View key={s.label} style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: colors.primary }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>
      <Card>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Last 7 days</Text>
        <View style={styles.chart}>
          {last7.map((d) => (
            <View key={d.label} style={styles.barCol}>
              <View style={[styles.barTrack, { backgroundColor: colors.surfaceSecondary }]}>
                <View style={[styles.barFill, { height: `${(d.minutes / maxMin) * 100}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.barLabel, { color: colors.textMuted }]}>{d.label}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.goalLine, { color: colors.textSecondary }]}>Daily goal: {goalHours}h</Text>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  stat: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 4 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { width: '100%', height: 100, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, marginTop: 6 },
  goalLine: { fontSize: 13, marginTop: 12, textAlign: 'center' },
});
