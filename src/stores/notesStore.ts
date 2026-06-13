import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types';
import { generateId } from '../utils/helpers';

interface NotesState {
  notes: Note[];
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  resetNotes: () => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      addNote: (n) => {
        const now = new Date().toISOString();
        const id = generateId();
        set((s) => ({
          notes: [{ ...n, id, createdAt: now, updatedAt: now }, ...s.notes],
        }));
        return id;
      },
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((note) =>
            note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note,
          ),
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      getNote: (id) => get().notes.find((n) => n.id === id),
      resetNotes: () => set({ notes: [] }),
    }),
    { name: 'studyflow-notes', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
