import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreakData } from '../types';

interface StreakState extends StreakData {
  resetStreak: () => void;
}

export const useStreakStore = create<StreakState>()(
  persist(
    () => ({
      current: 12,
      longest: 21,
      lastCompletedDate: new Date().toISOString().split('T')[0],
      resetStreak: () => {},
    }),
    {
      name: 'studyflow-streak',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
