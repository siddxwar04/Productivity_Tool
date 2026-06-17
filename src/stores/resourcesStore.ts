import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Resource } from '../types';
import { generateId } from '../utils/helpers';
import { deleteResourceFile } from '../services/resourceFiles';

interface ResourcesState {
  resources: Resource[];
  addResource: (r: Omit<Resource, 'id' | 'createdAt'>) => void;
  deleteResource: (id: string) => void;
  resetResources: () => void;
}

export const useResourcesStore = create<ResourcesState>()(
  persist(
    (set) => ({
      resources: [],
      addResource: (r) =>
        set((s) => ({
          resources: [{ ...r, id: generateId(), createdAt: new Date().toISOString() }, ...s.resources],
        })),
      deleteResource: (id) =>
        set((s) => {
          const target = s.resources.find((r) => r.id === id);
          if (target?.localUri) {
            void deleteResourceFile(target.localUri);
          }
          return { resources: s.resources.filter((r) => r.id !== id) };
        }),
      resetResources: () => set({ resources: [] }),
    }),
    { name: 'nexara-resources', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
