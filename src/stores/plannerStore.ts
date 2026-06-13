import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlannerBlock } from '../types';
import { generateId } from '../utils/helpers';

interface PlannerState {
  blocks: PlannerBlock[];
  addBlock: (b: Omit<PlannerBlock, 'id'>) => void;
  updateBlock: (id: string, patch: Partial<PlannerBlock>) => void;
  deleteBlock: (id: string) => void;
  getBlocksForDay: (dayOfWeek: number) => PlannerBlock[];
  resetPlanner: () => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      blocks: [],
      addBlock: (b) => set((s) => ({ blocks: [...s.blocks, { ...b, id: generateId() }] })),
      updateBlock: (id, patch) =>
        set((s) => ({ blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      deleteBlock: (id) => set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) })),
      getBlocksForDay: (day) =>
        get().blocks.filter((b) => b.dayOfWeek === day).sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute)),
      resetPlanner: () => set({ blocks: [] }),
    }),
    { name: 'studyflow-planner', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
