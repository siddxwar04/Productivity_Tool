import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useNotificationSettingsStore } from '../../stores/notificationSettingsStore';
import { useDeadlinesStore } from '../../stores/deadlinesStore';
import { NOTIFICATION_CHANNELS, NOTIFICATION_IDS } from './notificationTypes';
import { parseTimeString } from '../../utils/helpers';

const DEFAULT_TIMEOUT_MS = 8000;
const RESCHEDULE_TIMEOUT_MS = 15000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  operation: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operation} timed out after ${ms}ms`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

/** Scheduled local notifications are supported on iOS/Android only. */
export function isNotificationSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn(
      '[notificationService] Notifications are not supported on this platform; skipping permission request.',
    );
    return false;
  }

  try {
    const { status: existing } = await withTimeout(
      Notifications.getPermissionsAsync(),
      DEFAULT_TIMEOUT_MS,
      'getPermissionsAsync',
    );
    if (existing === 'granted') {
      return true;
    }

    const { status } = await withTimeout(
      Notifications.requestPermissionsAsync(),
      DEFAULT_TIMEOUT_MS,
      'requestPermissionsAsync',
    );
    return status === 'granted';
  } catch (error) {
    console.error('[notificationService] requestNotificationPermissions failed:', error);
    return false;
  }
}

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await withTimeout(
      Promise.all([
        Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.REMINDERS, {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
        }),
        Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DEADLINES, {
          name: 'Deadlines',
          importance: Notifications.AndroidImportance.HIGH,
        }),
        Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.SOCIAL, {
          name: 'Social',
          importance: Notifications.AndroidImportance.DEFAULT,
        }),
      ]),
      DEFAULT_TIMEOUT_MS,
      'setNotificationChannelAsync',
    );
  } catch (error) {
    console.error('[notificationService] setupNotificationChannels failed:', error);
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
  if (!isNotificationSupported()) {
    return;
  }

  try {
    await withTimeout(
      Notifications.cancelAllScheduledNotificationsAsync(),
      DEFAULT_TIMEOUT_MS,
      'cancelAllScheduledNotificationsAsync',
    );
  } catch (error) {
    console.error('[notificationService] cancelAllScheduledNotifications failed:', error);
  }
}

export async function rescheduleAllNotifications(): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('[notificationService] Skipping reschedule on unsupported platform.');
    return;
  }

  try {
    await withTimeout(rescheduleAllNotificationsInternal(), RESCHEDULE_TIMEOUT_MS, 'rescheduleAllNotifications');
  } catch (error) {
    console.error('[notificationService] rescheduleAllNotifications failed:', error);
  }
}

async function rescheduleAllNotificationsInternal(): Promise<void> {
  const settings = useNotificationSettingsStore.getState();
  await cancelAllScheduledNotifications();

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

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
