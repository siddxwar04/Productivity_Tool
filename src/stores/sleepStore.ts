import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepEntry } from '../types';
import { generateId, todayKey } from '../utils/helpers';

interface SleepState {
  entries: SleepEntry[];
  logSleep: (hours: number, quality: SleepEntry['quality']) => void;
  getTodaySleep: () => SleepEntry | undefined;
  getAverageHours: (days?: number) => number;
  resetSleep: () => void;
}

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      entries: [],
      logSleep: (hours, quality) => {
        const date = todayKey();
        set((s) => ({
          entries: [
            { id: generateId(), hours, quality, date },
            ...s.entries.filter((e) => e.date !== date),
          ],
        }));
      },
      getTodaySleep: () => get().entries.find((e) => e.date === todayKey()),
      getAverageHours: (days = 7) => {
        const recent = get().entries.slice(0, days);
        if (!recent.length) return 0;
        return Math.round((recent.reduce((s, e) => s + e.hours, 0) / recent.length) * 10) / 10;
      },
      resetSleep: () => set({ entries: [] }),
    }),
    { name: 'nexara-sleep', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
