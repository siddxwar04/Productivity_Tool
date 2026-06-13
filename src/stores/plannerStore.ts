import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlannerBlock } from '../types';
import { generateId } from '../utils/helpers';
import { findConflicts } from '../services/planner/plannerUtils';

interface PlannerState {
  blocks: PlannerBlock[];
  addBlock: (b: Omit<PlannerBlock, 'id'>) => string;
  updateBlock: (id: string, patch: Partial<PlannerBlock>) => boolean;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => string | null;
  moveBlock: (id: string, dayOfWeek: number, startHour: number, startMinute: number) => boolean;
  toggleBlockComplete: (id: string) => void;
  getBlocksForDay: (dayOfWeek: number) => PlannerBlock[];
  resetPlanner: () => void;
}

function normalizeBlock(block: Omit<PlannerBlock, 'id'>): Omit<PlannerBlock, 'id'> {
  const title = block.title.trim();
  return {
    priority: 'medium',
    completed: false,
    ...block,
    title,
    subject: (block.subject ?? title).trim(),
  };
}

function canPlaceBlock(
  blocks: PlannerBlock[],
  candidate: Pick<PlannerBlock, 'id' | 'dayOfWeek' | 'startHour' | 'startMinute' | 'durationMinutes'>,
): boolean {
  return findConflicts(blocks, candidate).length === 0;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      blocks: [],

      addBlock: (b) => {
        const id = generateId();
        const normalized = normalizeBlock(b);
        if (!canPlaceBlock(get().blocks, { ...normalized, id })) {
          return '';
        }
        set((s) => ({ blocks: [...s.blocks, { ...normalized, id }] }));
        return id;
      },

      updateBlock: (id, patch) => {
        const current = get().blocks.find((b) => b.id === id);
        if (!current) {
          return false;
        }
        const next = { ...current, ...patch };
        if (!canPlaceBlock(get().blocks, next)) {
          return false;
        }
        set((s) => ({
          blocks: s.blocks.map((b) => (b.id === id ? next : b)),
        }));
        return true;
      },

      deleteBlock: (id) => set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) })),

      duplicateBlock: (id) => {
        const source = get().blocks.find((b) => b.id === id);
        if (!source) {
          return null;
        }

        let offsetMinutes = 60;
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const startMinutes = source.startHour * 60 + source.startMinute + offsetMinutes;
          const newId = get().addBlock({
            ...source,
            title: `${source.title} (copy)`,
            subject: `${source.subject ?? source.title} (copy)`,
            startHour: Math.floor(startMinutes / 60),
            startMinute: startMinutes % 60,
            completed: false,
          });
          if (newId) {
            return newId;
          }
          offsetMinutes += 30;
        }

        return null;
      },

      moveBlock: (id, dayOfWeek, startHour, startMinute) => {
        return get().updateBlock(id, { dayOfWeek, startHour, startMinute });
      },

      toggleBlockComplete: (id) =>
        set((s) => ({
          blocks: s.blocks.map((b) =>
            b.id === id ? { ...b, completed: !b.completed } : b,
          ),
        })),

      getBlocksForDay: (day) =>
        get()
          .blocks.filter((b) => b.dayOfWeek === day)
          .sort(
            (a, b) =>
              a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute),
          ),

      resetPlanner: () => set({ blocks: [] }),
    }),
    { name: 'studyflow-planner', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
