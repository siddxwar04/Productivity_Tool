export const NOTIFICATION_IDS = {
  HABIT_DAILY: 'habit-daily',
  MOOD_CHECKIN: 'mood-checkin',
  SLEEP_LOG: 'sleep-log',
  FLASHCARD_REVIEW: 'flashcard-review',
  DEADLINE_PREFIX: 'deadline-',
} as const;

export const NOTIFICATION_CHANNELS = {
  REMINDERS: 'reminders',
  DEADLINES: 'deadlines',
  SOCIAL: 'social',
} as const;
