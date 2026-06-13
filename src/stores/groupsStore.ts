import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudyGroup } from '../types';
import { generateId } from '../utils/helpers';
import { triggerReward } from '../services/rewardsService';

interface GroupsState {
  groups: StudyGroup[];
  joinedIds: string[];
  joinGroup: (id: string) => void;
  leaveGroup: (id: string) => void;
  addGroup: (g: Omit<StudyGroup, 'id'>) => void;
  resetGroups: () => void;
}

const seedGroups: StudyGroup[] = [
  { id: 'g1', name: 'CS Study Squad', memberCount: 12, lastMessage: 'Review session at 3pm?' },
  { id: 'g2', name: 'Math Help Circle', memberCount: 8, lastMessage: 'Problem set 4 discussion' },
];

export const useGroupsStore = create<GroupsState>()(
  persist(
    (set, get) => ({
      groups: seedGroups,
      joinedIds: [],
      joinGroup: (id) => {
        if (!get().joinedIds.includes(id)) {
          set((s) => ({ joinedIds: [...s.joinedIds, id] }));
          triggerReward('join_group');
        }
      },
      leaveGroup: (id) => set((s) => ({ joinedIds: s.joinedIds.filter((i) => i !== id) })),
      addGroup: (g) => set((s) => ({ groups: [...s.groups, { ...g, id: generateId() }] })),
      resetGroups: () => set({ groups: seedGroups, joinedIds: [] }),
    }),
    { name: 'studyflow-groups', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
