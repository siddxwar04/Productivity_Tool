import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings } from '../types';
import { rescheduleAllNotifications } from '../services/notifications/notificationService';

const defaultNotificationSettings: NotificationSettings = {
  deadlineReminders: { oneWeek: true, oneDay: true, oneHour: true },
  habitDailyReminder: { enabled: true, time: '08:00' },
  pomodoroChime: true,
  breakReminders: true,
  moodCheckIn: { enabled: true, time: '20:00' },
  sleepLogReminder: { enabled: true, time: '07:30' },
  flashcardReview: { enabled: false, time: '18:00' },
  groupChat: true,
  accountabilityPartner: true,
  milestoneUnlocked: true,
};

interface NotificationSettingsState extends NotificationSettings {
  updateSettings: (partial: Partial<NotificationSettings>) => Promise<void>;
  updateDeadlineReminders: (partial: Partial<NotificationSettings['deadlineReminders']>) => Promise<void>;
  updateTimedReminder: (
    key: 'habitDailyReminder' | 'moodCheckIn' | 'sleepLogReminder' | 'flashcardReview',
    value: NotificationSettings[typeof key],
  ) => Promise<void>;
  resetNotifications: () => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set, get) => ({
      ...defaultNotificationSettings,
      updateSettings: async (partial) => {
        set(partial);
        await rescheduleAllNotifications();
      },
      updateDeadlineReminders: async (partial) => {
        const current = get().deadlineReminders;
        set({ deadlineReminders: { ...current, ...partial } });
        await rescheduleAllNotifications();
      },
      updateTimedReminder: async (key, value) => {
        set({ [key]: value });
        await rescheduleAllNotifications();
      },
      resetNotifications: () => set({ ...defaultNotificationSettings }),
    }),
    {
      name: 'nexara-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export { defaultNotificationSettings };
