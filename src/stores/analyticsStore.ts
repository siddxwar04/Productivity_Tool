import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsData } from '../types';

interface AnalyticsState extends AnalyticsData {
  lastPomodoroMinutes: number;
  addStudyMinutes: (minutes: number) => void;
  recordPomodoro: (workMinutes?: number) => void;
  recordFlashcardReview: (count?: number) => void;
  resetTodayIfNeeded: (today: string) => void;
  resetAnalytics: () => void;
}

const defaults: AnalyticsData & { lastPomodoroMinutes: number } = {
  todayStudyMinutes: 0,
  totalStudyHours: 0,
  totalPomodoros: 0,
  dailyHistory: {},
  lastStudyDate: '',
  flashcardsReviewed: 0,
  lastPomodoroMinutes: 25,
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      ...defaults,
      addStudyMinutes: (minutes) => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        const isToday = state.lastStudyDate === today;
        const todayMinutes = isToday ? state.todayStudyMinutes + minutes : minutes;
        const dailyHistory = { ...state.dailyHistory, [today]: todayMinutes };
        set({
          todayStudyMinutes: todayMinutes,
          totalStudyHours: state.totalStudyHours + minutes / 60,
          dailyHistory,
          lastStudyDate: today,
        });
      },
      recordPomodoro: (workMinutes = 25) => {
        set((s) => ({
          totalPomodoros: s.totalPomodoros + 1,
          lastPomodoroMinutes: workMinutes,
        }));
      },
      recordFlashcardReview: (count = 1) => {
        set((s) => ({ flashcardsReviewed: s.flashcardsReviewed + count }));
      },
      resetTodayIfNeeded: (today) => {
        if (get().lastStudyDate !== today) {
          set({ todayStudyMinutes: 0, lastStudyDate: today });
        }
      },
      resetAnalytics: () => set({ ...defaults }),
    }),
    {
      name: 'nexara-analytics',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
