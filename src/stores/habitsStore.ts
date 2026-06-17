import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types';
import { generateId } from '../utils/helpers';

interface HabitsState {
  habits: Habit[];
  lastResetDate: string;
  toggleHabitProgress: (id: string) => void;
  addHabit: (h: Omit<Habit, 'id' | 'completedToday' | 'streak'>) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  resetDailyIfNeeded: (today: string) => void;
  resetHabits: () => void;
}

const seedHabits: Habit[] = [
  { id: 'h1', name: 'Read', targetPerDay: 1, completedToday: 0, color: '#6366F1', streak: 3 },
  { id: 'h2', name: 'Exercise', targetPerDay: 1, completedToday: 0, color: '#10B981', streak: 5 },
  { id: 'h3', name: 'Review notes', targetPerDay: 2, completedToday: 0, color: '#F59E0B', streak: 2 },
];

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: seedHabits,
      lastResetDate: '',
      toggleHabitProgress: (id) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const next = h.completedToday >= h.targetPerDay ? 0 : h.completedToday + 1;
            const completed = next >= h.targetPerDay;
            return {
              ...h,
              completedToday: next,
              streak: completed ? h.streak + 1 : h.streak,
            };
          }),
        })),
      addHabit: (h) =>
        set((s) => ({
          habits: [...s.habits, { ...h, id: generateId(), completedToday: 0, streak: 0 }],
        })),
      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      resetDailyIfNeeded: (today) => {
        if (get().lastResetDate === today) return;
        set((s) => ({
          lastResetDate: today,
          habits: s.habits.map((h) => ({ ...h, completedToday: 0 })),
        }));
      },
      resetHabits: () => set({ habits: seedHabits, lastResetDate: '' }),
    }),
    {
      name: 'nexara-habits',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
