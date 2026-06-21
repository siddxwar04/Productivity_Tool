import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Exam, getDaysLeft } from '../types/exam';
import { scheduleLocalNotification } from '../services/notificationService';
import { useUserProfileStore } from './userProfileStore';

function generateExamId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sortExamsByDate(exams: Exam[]): Exam[] {
  return [...exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

function getFirstName(): string {
  const displayName = useUserProfileStore.getState().displayName.trim();
  if (!displayName) return 'there';
  return displayName.split(/\s+/)[0] ?? 'there';
}

function triggerAt9Am(examDate: string, daysBefore: number): Date {
  const date = new Date(examDate);
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() - daysBefore);
  return date;
}

function notificationContent(
  exam: Exam,
  daysBefore: number,
  name: string,
): { title: string; body: string } {
  switch (daysBefore) {
    case 30:
      return {
        title: '📚 Exam reminder',
        body: `📚 ${exam.title} in 30 days — perfect time to start building your notes, ${name}!`,
      };
    case 15:
      return {
        title: 'Stay on track',
        body: `Hey ${name}! ${exam.title} is 15 days away. Steady progress today goes a long way 💪`,
      };
    case 7:
      return {
        title: 'One week away',
        body: `${exam.title} in one week, ${name}. Your focus this week will make the difference 🧠`,
      };
    case 3:
      return {
        title: 'Almost there',
        body: `3 days to ${exam.title} — rest well, eat well, and review smart. You're ready ✨`,
      };
    case 1:
      return {
        title: 'Tomorrow\'s the day',
        body: `Tomorrow is ${exam.title}, ${name}. Trust your preparation — you've got this 🎯`,
      };
    default:
      return {
        title: '🌟 Exam day',
        body: `Today is ${exam.title} day! Take a breath, you've prepared for this moment 🌟`,
      };
  }
}

const EXAM_NOTIFICATION_OFFSETS = [30, 15, 7, 3, 1, 0] as const;

interface ExamState {
  exams: Exam[];
  notificationIds: Record<string, string[]>;
  isLoading: boolean;
  setLoading: (v: boolean) => void;
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => Promise<void>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  getUpcomingExams: () => Exam[];
  getNextExam: () => Exam | null;
  scheduleNotificationsForExam: (exam: Exam) => Promise<void>;
  cancelNotificationsForExam: (id: string) => Promise<void>;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      exams: [],
      notificationIds: {},
      isLoading: true,
      setLoading: (v) => set({ isLoading: v }),

      getUpcomingExams: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return sortExamsByDate(
          get().exams.filter((exam) => {
            const examDay = new Date(exam.date);
            examDay.setHours(0, 0, 0, 0);
            return examDay.getTime() >= today.getTime();
          }),
        );
      },

      getNextExam: () => {
        const upcoming = get().getUpcomingExams();
        return upcoming[0] ?? null;
      },

      cancelNotificationsForExam: async (id) => {
        const ids = get().notificationIds[id] ?? [];
        await Promise.all(
          ids.map(async (notificationId) => {
            try {
              await Notifications.cancelScheduledNotificationAsync(notificationId);
            } catch {
              // ignore cancel failures
            }
          }),
        );
        set((state) => {
          const next = { ...state.notificationIds };
          delete next[id];
          return { notificationIds: next };
        });
      },

      scheduleNotificationsForExam: async (exam) => {
        await get().cancelNotificationsForExam(exam.id);
        if (!exam.notificationsEnabled) return;

        const name = getFirstName();
        const daysLeft = getDaysLeft(exam.date);
        const now = new Date();
        const scheduledIds: string[] = [];

        for (const daysBefore of EXAM_NOTIFICATION_OFFSETS) {
          if (daysLeft < daysBefore) continue;

          const triggerDate = triggerAt9Am(exam.date, daysBefore);
          if (triggerDate <= now) continue;

          const { title, body } = notificationContent(exam, daysBefore, name);
          try {
            const notificationId = await scheduleLocalNotification({
              title,
              body,
              triggerDate,
            });
            scheduledIds.push(notificationId);
          } catch (error) {
            console.error('[examStore] scheduleNotificationsForExam failed:', error);
          }
        }

        set((state) => ({
          notificationIds: {
            ...state.notificationIds,
            [exam.id]: scheduledIds,
          },
        }));
      },

      addExam: async (examInput) => {
        const exam: Exam = {
          ...examInput,
          id: generateExamId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          exams: sortExamsByDate([...state.exams, exam]),
        }));
        try {
          await get().scheduleNotificationsForExam(exam);
        } catch (error) {
          console.error('[examStore] addExam notification scheduling failed:', error);
        }
      },

      updateExam: async (id, updates) => {
        let updatedExam: Exam | undefined;
        set((state) => {
          const exams = sortExamsByDate(
            state.exams.map((exam) => {
              if (exam.id !== id) return exam;
              updatedExam = { ...exam, ...updates };
              return updatedExam;
            }),
          );
          return { exams };
        });
        if (updatedExam) {
          try {
            await get().scheduleNotificationsForExam(updatedExam);
          } catch (error) {
            console.error('[examStore] updateExam notification scheduling failed:', error);
          }
        }
      },

      deleteExam: async (id) => {
        await get().cancelNotificationsForExam(id);
        set((state) => ({
          exams: state.exams.filter((exam) => exam.id !== id),
        }));
      },
    }),
    {
      name: 'nexara-exams',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        exams: state.exams,
        notificationIds: state.notificationIds,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    },
  ),
);
