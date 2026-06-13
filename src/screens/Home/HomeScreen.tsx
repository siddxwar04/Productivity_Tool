import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HabitRing } from '../../components/ui/HabitRing';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useUserProfileStore } from '../../stores/userProfileStore';
import { useHabitsStore } from '../../stores/habitsStore';
import { useDeadlinesStore } from '../../stores/deadlinesStore';
import { useStreakStore } from '../../stores/streakStore';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { getGreeting, formatDate, formatCountdown, formatStudyTime } from '../../utils/helpers';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';

type HomeNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { colors } = useTheme();
  const displayName = useUserProfileStore((s) => s.displayName);
  const studyGoalHours = useUserProfileStore((s) => s.goals.studyHoursPerDay);
  const habits = useHabitsStore((s) => s.habits);
  const deadlines = useDeadlinesStore((s) => s.deadlines);
  const getUpcoming = useDeadlinesStore((s) => s.getUpcoming);
  const upcoming = useMemo(() => getUpcoming(3), [deadlines, getUpcoming]);
  const streak = useStreakStore((s) => s.current);
  const todayStudyMinutes = useAnalyticsStore((s) => s.todayStudyMinutes);

  const nextDeadline = upcoming[0];
  const goalMinutes = studyGoalHours * 60;
  const studyProgress = useMemo(
    () => Math.min(todayStudyMinutes / goalMinutes, 1),
    [todayStudyMinutes, goalMinutes],
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting(displayName)}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate()}</Text>
        </View>
      </View>

      {nextDeadline && (
        <Card style={{ marginBottom: 24, borderWidth: 1.5, borderColor: colors.primary }}>
          <Text style={[styles.focusLabel, { color: colors.primary }]}>Today's Focus</Text>
          <Text style={[styles.focusTitle, { color: colors.text }]}>{nextDeadline.title}</Text>
          <Text style={[styles.focusCountdown, { color: colors.textSecondary }]}>
            {formatCountdown(nextDeadline.dueAt)}
          </Text>
          <Button
            title="Start studying"
            onPress={() => navigation.navigate('Study', { screen: 'Pomodoro' })}
            style={styles.focusBtn}
          />
        </Card>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Habits today</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitScroll}>
        {habits.map((h) => (
          <HabitRing
            key={h.id}
            name={h.name}
            progress={h.completedToday / h.targetPerDay}
            color={h.color}
          />
        ))}
      </ScrollView>

      <View style={[styles.streakBanner, { backgroundColor: `${colors.streak}20` }]}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <View>
          <Text style={[styles.streakCount, { color: colors.streak }]}>{streak} day streak</Text>
          <Text style={[styles.streakSub, { color: colors.textSecondary }]}>Keep it going!</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming deadlines</Text>
      {upcoming.map((d) => (
        <View key={d.id} style={[styles.deadlineRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.priorityDot, {
            backgroundColor: d.priority === 'high' ? colors.error : d.priority === 'medium' ? colors.warning : colors.success,
          }]} />
          <View style={styles.deadlineInfo}>
            <Text style={[styles.deadlineTitle, { color: colors.text }]}>{d.title}</Text>
            <Text style={[styles.deadlineTime, { color: colors.textSecondary }]}>{formatCountdown(d.dueAt)}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick actions</Text>
      <View style={styles.quickActions}>
        {[
          { icon: 'add-circle-outline' as const, label: 'Task', action: () => navigation.navigate('Study', { screen: 'AddTask' }) },
          { icon: 'document-text-outline' as const, label: 'Note', action: () => navigation.navigate('Study', { screen: 'NoteEditor', params: {} }) },
          { icon: 'timer-outline' as const, label: 'Focus', action: () => navigation.navigate('Study', { screen: 'Pomodoro' }) },
          { icon: 'happy-outline' as const, label: 'Mood', action: () => navigation.navigate('LogMood') },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.quickBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={action.action}
          >
            <Ionicons name={action.icon} size={24} color={colors.primary} />
            <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.analyticsCard}>
        <Text style={[styles.analyticsTitle, { color: colors.text }]}>Today's study time</Text>
        <Text style={[styles.analyticsValue, { color: colors.primary }]}>
          {formatStudyTime(todayStudyMinutes)} / {formatStudyTime(goalMinutes)}
        </Text>
        <ProgressBar progress={studyProgress} color={colors.primary} height={10} />
        <Text style={[styles.analyticsSub, { color: colors.textSecondary }]}>
          {studyProgress >= 1 ? 'Daily goal reached! 🎉' : `${Math.round((1 - studyProgress) * goalMinutes)}m to go`}
        </Text>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '700' },
  date: { fontSize: 14, marginTop: 4 },
  focusCard: { marginBottom: 24, borderWidth: 1.5 },
  focusLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  focusTitle: { fontSize: 20, fontWeight: '700', marginTop: 6 },
  focusCountdown: { fontSize: 14, marginTop: 4, marginBottom: 16 },
  focusBtn: { alignSelf: 'flex-start' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  habitScroll: { marginBottom: 20, marginHorizontal: -4 },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    gap: 12,
  },
  streakEmoji: { fontSize: 32 },
  streakCount: { fontSize: 18, fontWeight: '700' },
  streakSub: { fontSize: 13 },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  deadlineInfo: { flex: 1 },
  deadlineTitle: { fontSize: 15, fontWeight: '600' },
  deadlineTime: { fontSize: 13, marginTop: 2 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  quickLabel: { fontSize: 11, fontWeight: '600' },
  analyticsCard: { marginTop: 4 },
  analyticsTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  analyticsValue: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  analyticsSub: { fontSize: 13, marginTop: 8 },
});
