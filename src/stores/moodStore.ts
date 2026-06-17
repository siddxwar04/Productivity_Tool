import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../types';
import { generateId, todayKey } from '../utils/helpers';
import { dayLabelShort } from '../utils/moodHelpers';

interface MoodState {
  entries: MoodEntry[];
  logMood: (mood: MoodEntry['mood'], note?: string) => void;
  getTodayMood: () => MoodEntry | undefined;
  getRecent: (days?: number) => MoodEntry[];
  getLast7Days: () => MoodDayTrend[];
  resetMood: () => void;
}

export interface MoodDayTrend {
  date: string;
  mood: MoodEntry['mood'] | null;
  label: string;
}

const MOOD_EMOJI = ['😫', '😕', '😐', '🙂', '😄'];

export { MOOD_EMOJI };

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      logMood: (mood, note) => {
        const date = todayKey();
        set((s) => ({
          entries: [
            { id: generateId(), mood, note, date },
            ...s.entries.filter((e) => e.date !== date),
          ],
        }));
      },
      getTodayMood: () => get().entries.find((e) => e.date === todayKey()),
      getRecent: (days = 7) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffKey = cutoff.toISOString().split('T')[0];
        return get().entries.filter((e) => e.date >= cutoffKey);
      },
      getLast7Days: () => {
        const result: MoodDayTrend[] = [];
        for (let i = 6; i >= 0; i -= 1) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateKey = d.toISOString().split('T')[0];
          const entry = get().entries.find((e) => e.date === dateKey);
          result.push({
            date: dateKey,
            mood: entry?.mood ?? null,
            label: dayLabelShort(d),
          });
        }
        return result;
      },
      resetMood: () => set({ entries: [] }),
    }),
    { name: 'studyflow-mood', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
