import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GradeEntry } from '../types';
import { generateId } from '../utils/helpers';

interface GradesState {
  grades: GradeEntry[];
  addGrade: (g: Omit<GradeEntry, 'id'>) => void;
  deleteGrade: (id: string) => void;
  getSubjectGpa: (subjectId: string) => number;
  getOverallGpa: () => number;
  resetGrades: () => void;
}

export const useGradesStore = create<GradesState>()(
  persist(
    (set, get) => ({
      grades: [],
      addGrade: (g) => set((s) => ({ grades: [...s.grades, { ...g, id: generateId() }] })),
      deleteGrade: (id) => set((s) => ({ grades: s.grades.filter((g) => g.id !== id) })),
      getSubjectGpa: (subjectId) => {
        const entries = get().grades.filter((g) => g.subjectId === subjectId);
        if (!entries.length) return 0;
        const avg = entries.reduce((sum, g) => sum + (g.score / g.maxScore) * 10, 0) / entries.length;
        return Math.round(avg * 100) / 100;
      },
      getOverallGpa: () => {
        const entries = get().grades;
        if (!entries.length) return 0;
        const avg = entries.reduce((sum, g) => sum + (g.score / g.maxScore) * 10, 0) / entries.length;
        return Math.round(avg * 100) / 100;
      },
      resetGrades: () => set({ grades: [] }),
    }),
    { name: 'nexara-grades', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
