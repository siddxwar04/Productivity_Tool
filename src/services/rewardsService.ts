import { useUserProfileStore } from '../stores/userProfileStore';
import { useRewardsStore } from '../stores/rewardsStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useStreakStore } from '../stores/streakStore';
import * as Notifications from 'expo-notifications';
import { useNotificationSettingsStore } from '../stores/notificationSettingsStore';

export type RewardEvent =
  | 'pomodoro_complete'
  | 'habit_streak_7'
  | 'study_10_hours'
  | 'study_50_hours'
  | 'flashcard_100'
  | 'join_group'
  | 'gpa_goal_set'
  | 'level_5'
  | 'night_study'
  | 'early_study';

const EVENT_XP: Record<RewardEvent, number> = {
  pomodoro_complete: 10,
  habit_streak_7: 75,
  study_10_hours: 50,
  study_50_hours: 200,
  flashcard_100: 80,
  join_group: 60,
  gpa_goal_set: 30,
  level_5: 150,
  night_study: 40,
  early_study: 40,
};

const EVENT_MILESTONE: Partial<Record<RewardEvent, string>> = {
  pomodoro_complete: 'first_pomodoro',
  habit_streak_7: 'first_habit',
  study_10_hours: 'ten_hours',
  study_50_hours: 'fifty_hours',
  flashcard_100: 'flashcard_pro',
  join_group: 'social_butterfly',
  gpa_goal_set: 'gpa_goal',
  level_5: 'level_five',
  night_study: 'night_owl',
  early_study: 'early_bird',
};

import { todayKey } from '../utils/helpers';

export function recordStudyActivity(minutes: number): void {
  const analytics = useAnalyticsStore.getState();
  const streak = useStreakStore.getState();
  const today = todayKey();

  analytics.addStudyMinutes(minutes);

  if (streak.lastCompletedDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    const continued = streak.lastCompletedDate === yesterdayKey;
    const newCurrent = continued ? streak.current + 1 : 1;
    useStreakStore.setState({
      current: newCurrent,
      longest: Math.max(streak.longest, newCurrent),
      lastCompletedDate: today,
    });
    if (newCurrent >= 7) triggerReward('habit_streak_7');
    if (newCurrent >= 7) unlockMilestone('week_streak');
    if (newCurrent >= 30) unlockMilestone('month_streak');
  }

  const hours = useAnalyticsStore.getState().totalStudyHours;
  if (hours >= 10) triggerReward('study_10_hours');
  if (hours >= 50) triggerReward('study_50_hours');

  const hour = new Date().getHours();
  if (hour >= 22) triggerReward('night_study');
  if (hour < 7) triggerReward('early_study');
}

export function triggerReward(event: RewardEvent): void {
  const milestoneId = EVENT_MILESTONE[event];
  useUserProfileStore.getState().addXp(EVENT_XP[event]);
  if (milestoneId) unlockMilestone(milestoneId);
}

export function unlockMilestone(id: string): void {
  const rewards = useRewardsStore.getState();
  if (rewards.unlockedMilestoneIds.includes(id)) return;
  rewards.unlockMilestone(id);
  const milestone = rewards.getMilestones().find((m) => m.id === id);
  if (milestone) useUserProfileStore.getState().addXp(milestone.xpReward);

  const settings = useNotificationSettingsStore.getState();
  if (settings.milestoneUnlocked) {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Milestone unlocked!',
        body: `${milestone?.icon ?? '🏆'} ${milestone?.title ?? 'Achievement'}`,
        sound: true,
      },
      trigger: null,
    });
  }

  const level = useUserProfileStore.getState().level;
  if (level >= 5) triggerReward('level_5');
}

export function onPomodoroComplete(workMinutes = 25): void {
  useAnalyticsStore.getState().recordPomodoro(workMinutes);
  recordStudyActivity(workMinutes);
  triggerReward('pomodoro_complete');
}
