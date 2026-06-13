import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useNotificationSettingsStore } from '../../stores/notificationSettingsStore';
import { useDeadlinesStore } from '../../stores/deadlinesStore';
import { NOTIFICATION_CHANNELS, NOTIFICATION_IDS } from './notificationTypes';
import { parseTimeString } from '../../utils/helpers';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.REMINDERS, {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DEADLINES, {
      name: 'Deadlines',
      importance: Notifications.AndroidImportance.HIGH,
    });
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.SOCIAL, {
      name: 'Social',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

async function scheduleDailyNotification(
  id: string,
  title: string,
  body: string,
  time: string,
  channelId: string,
): Promise<void> {
  const { hour, minute } = parseTimeString(time);
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? channelId : undefined,
    },
  });
}

async function scheduleDeadlineNotifications(): Promise<void> {
  const settings = useNotificationSettingsStore.getState();
  const deadlines = useDeadlinesStore.getState().deadlines.filter((d) => !d.completed);

  for (const deadline of deadlines) {
    const due = new Date(deadline.dueAt);
    const offsets = [
      { enabled: settings.deadlineReminders.oneWeek, ms: 7 * 24 * 60 * 60 * 1000, label: '1 week' },
      { enabled: settings.deadlineReminders.oneDay, ms: 24 * 60 * 60 * 1000, label: '1 day' },
      { enabled: settings.deadlineReminders.oneHour, ms: 60 * 60 * 1000, label: '1 hour' },
    ];

    for (const offset of offsets) {
      if (!offset.enabled) continue;
      const triggerDate = new Date(due.getTime() - offset.ms);
      if (triggerDate <= new Date()) continue;

      const id = `${NOTIFICATION_IDS.DEADLINE_PREFIX}${deadline.id}-${offset.label}`;
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: `Deadline in ${offset.label}`,
          body: `"${deadline.title}" is due soon!`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: Platform.OS === 'android' ? NOTIFICATION_CHANNELS.DEADLINES : undefined,
        },
      });
    }
  }
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function rescheduleAllNotifications(): Promise<void> {
  const settings = useNotificationSettingsStore.getState();
  await cancelAllScheduledNotifications();

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  if (settings.habitDailyReminder.enabled) {
    await scheduleDailyNotification(
      NOTIFICATION_IDS.HABIT_DAILY,
      'Daily habits',
      'Time to check off your study habits!',
      settings.habitDailyReminder.time,
      NOTIFICATION_CHANNELS.REMINDERS,
    );
  }

  if (settings.moodCheckIn.enabled) {
    await scheduleDailyNotification(
      NOTIFICATION_IDS.MOOD_CHECKIN,
      'Mood check-in',
      'How are you feeling today? Log your mood.',
      settings.moodCheckIn.time,
      NOTIFICATION_CHANNELS.REMINDERS,
    );
  }

  if (settings.sleepLogReminder.enabled) {
    await scheduleDailyNotification(
      NOTIFICATION_IDS.SLEEP_LOG,
      'Sleep log',
      'Log last night\'s sleep to track your wellness.',
      settings.sleepLogReminder.time,
      NOTIFICATION_CHANNELS.REMINDERS,
    );
  }

  if (settings.flashcardReview.enabled) {
    await scheduleDailyNotification(
      NOTIFICATION_IDS.FLASHCARD_REVIEW,
      'Flashcard review',
      'Your flashcards are ready for review!',
      settings.flashcardReview.time,
      NOTIFICATION_CHANNELS.REMINDERS,
    );
  }

  await scheduleDeadlineNotifications();
}
