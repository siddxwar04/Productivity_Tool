import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MILESTONES } from '../constants/milestones';
import { Milestone } from '../types';

interface RewardsState {
  unlockedMilestoneIds: string[];
  getMilestones: () => Milestone[];
  unlockMilestone: (id: string) => void;
  resetRewards: () => void;
}

const defaultUnlocked = ['first_pomodoro', 'ten_hours', 'gpa_goal'];

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      unlockedMilestoneIds: defaultUnlocked,
      getMilestones: () =>
        MILESTONES.map((m) => ({
          ...m,
          unlockedAt: get().unlockedMilestoneIds.includes(m.id)
            ? new Date().toISOString()
            : undefined,
        })),
      unlockMilestone: (id) =>
        set((s) => ({
          unlockedMilestoneIds: s.unlockedMilestoneIds.includes(id)
            ? s.unlockedMilestoneIds
            : [...s.unlockedMilestoneIds, id],
        })),
      resetRewards: () => set({ unlockedMilestoneIds: [] }),
    }),
    {
      name: 'nexara-rewards',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
