import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ProgressBar } from '../ui/ProgressBar';
import { WeeklyPlannerAnalytics } from '../../types/planner';
import { formatDuration } from '../../services/planner/plannerUtils';

interface PlannerAnalyticsPanelProps {
  analytics: WeeklyPlannerAnalytics;
}

export function PlannerAnalyticsPanel({ analytics }: PlannerAnalyticsPanelProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <Metric label="Study hours" value={`${analytics.totalStudyHours}h`} colors={colors} />
        <Metric label="Completed" value={`${analytics.completionPercent}%`} colors={colors} accent={colors.success} />
        <Metric label="Conflicts" value={String(analytics.conflictCount)} colors={colors} accent={analytics.conflictCount > 0 ? colors.error : colors.text} />
      </View>

      <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>
        Weekly goal {analytics.totalStudyHours}h / {analytics.weeklyGoalHours}h
      </Text>
      <ProgressBar progress={analytics.goalProgressPercent / 100} color={colors.primary} height={8} />

      {analytics.hoursPerSubject.length > 0 ? (
        <View style={styles.subjectRow}>
          {analytics.hoursPerSubject.slice(0, 4).map((item) => (
            <View key={item.subject} style={[styles.subjectChip, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={[styles.subjectText, { color: colors.text }]} numberOfLines={1}>
                {item.subject} · {formatDuration(item.minutes)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Metric({
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
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: accent ?? colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14, gap: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { fontSize: 18, fontWeight: '800' },
  metricLabel: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  goalLabel: { fontSize: 12, fontWeight: '600' },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subjectChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, maxWidth: '48%' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  subjectText: { fontSize: 11, fontWeight: '600', flexShrink: 1 },
});
