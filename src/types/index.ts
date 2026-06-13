export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface UserGoals {
  targetGpa: number;
  studyHoursPerDay: number;
  bedtimeHour: number;
}

export interface UserProfile {
  displayName: string;
  university: string;
  course: string;
  subjectCount: number;
  avatarUri?: string;
  subjects: Subject[];
  goals: UserGoals;
  onboardingComplete: boolean;
  level: number;
  xp: number;
}

export interface Habit {
  id: string;
  name: string;
  targetPerDay: number;
  completedToday: number;
  color: string;
  streak: number;
}

export interface Deadline {
  id: string;
  title: string;
  subjectId?: string;
  dueAt: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
}

export interface StreakData {
  current: number;
  longest: number;
  lastCompletedDate: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  lastReviewed?: string;
  ease: number;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  subjectId?: string;
  color: string;
}

export interface GradeEntry {
  id: string;
  subjectId: string;
  assignment: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface PlannerBlock {
  id: string;
  title: string;
  subjectId?: string;
  dayOfWeek: number;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  color: string;
}

export interface MoodEntry {
  id: string;
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string;
  date: string;
}

export interface SleepEntry {
  id: string;
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  date: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'link' | 'pdf' | 'image' | 'note';
  url?: string;
  localUri?: string;
  subjectId?: string;
  createdAt: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  memberCount: number;
  subjectId?: string;
  lastMessage?: string;
}

export interface Peer {
  id: string;
  name: string;
  streak: number;
  studyHoursWeek: number;
  isPartner: boolean;
}

export interface ScheduleSuggestion {
  id: string;
  title: string;
  startHour: number;
  durationMinutes: number;
  reason: string;
}

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

export interface DeadlineReminders {
  oneWeek: boolean;
  oneDay: boolean;
  oneHour: boolean;
}

export interface TimedReminder {
  enabled: boolean;
  time: string;
}

export interface NotificationSettings {
  deadlineReminders: DeadlineReminders;
  habitDailyReminder: TimedReminder;
  pomodoroChime: boolean;
  breakReminders: boolean;
  moodCheckIn: TimedReminder;
  sleepLogReminder: TimedReminder;
  flashcardReview: TimedReminder;
  groupChat: boolean;
  accountabilityPartner: boolean;
  milestoneUnlocked: boolean;
}

export interface PomodoroSettings {
  workMinutes: number;
  shortBreak: number;
  longBreak: number;
}

export type AppearanceMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  pomodoro: PomodoroSettings;
  focusModeApps: string[];
  appearance: AppearanceMode;
}

export interface AnalyticsData {
  todayStudyMinutes: number;
  totalStudyHours: number;
  totalPomodoros: number;
  dailyHistory: Record<string, number>;
  lastStudyDate: string;
  flashcardsReviewed: number;
}

export interface FocusLockState {
  isFocusLocked: boolean;
  showExitModal: boolean;
  sessionLabel: string;
}
