import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deadline } from '../types';
import { generateId } from '../utils/helpers';
import { rescheduleAllNotifications } from '../services/notifications/notificationService';

interface DeadlinesState {
  deadlines: Deadline[];
  getUpcoming: (limit?: number) => Deadline[];
  addDeadline: (d: Omit<Deadline, 'id'>) => void;
  updateDeadline: (id: string, patch: Partial<Deadline>) => void;
  deleteDeadline: (id: string) => void;
  toggleComplete: (id: string) => void;
  resetDeadlines: () => void;
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

const seedDeadlines: Deadline[] = [
  { id: 'd1', title: 'Calculus Problem Set 4', subjectId: 's1', dueAt: daysFromNow(1), priority: 'high', completed: false },
  { id: 'd2', title: 'History Essay Draft', subjectId: 's2', dueAt: daysFromNow(3), priority: 'medium', completed: false },
  { id: 'd3', title: 'Chemistry Lab Report', subjectId: 's3', dueAt: daysFromNow(5), priority: 'high', completed: false },
];

export const useDeadlinesStore = create<DeadlinesState>()(
  persist(
    (set, get) => ({
      deadlines: seedDeadlines,
      getUpcoming: (limit = 3) =>
        get()
          .deadlines.filter((d) => !d.completed)
          .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
          .slice(0, limit),
      addDeadline: (d) => {
        set((s) => ({ deadlines: [...s.deadlines, { ...d, id: generateId() }] }));
        rescheduleAllNotifications();
      },
      updateDeadline: (id, patch) => {
        set((s) => ({
          deadlines: s.deadlines.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        }));
        rescheduleAllNotifications();
      },
      deleteDeadline: (id) => {
        set((s) => ({ deadlines: s.deadlines.filter((d) => d.id !== id) }));
        rescheduleAllNotifications();
      },
      toggleComplete: (id) => {
        set((s) => ({
          deadlines: s.deadlines.map((d) =>
            d.id === id ? { ...d, completed: !d.completed } : d,
          ),
        }));
      },
      resetDeadlines: () => set({ deadlines: seedDeadlines }),
    }),
    {
      name: 'nexara-deadlines',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
