import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../types';
import { generateId, todayKey } from '../utils/helpers';

interface MoodState {
  entries: MoodEntry[];
  logMood: (mood: MoodEntry['mood'], note?: string) => void;
  getTodayMood: () => MoodEntry | undefined;
  getRecent: (days?: number) => MoodEntry[];
  resetMood: () => void;
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
        return get().entries.filter((e) => new Date(e.date) >= cutoff);
      },
      resetMood: () => set({ entries: [] }),
    }),
    { name: 'studyflow-mood', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
