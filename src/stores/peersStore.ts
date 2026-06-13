import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Peer } from '../types';
import { generateId } from '../utils/helpers';

interface PeersState {
  peers: Peer[];
  addPeer: (p: Omit<Peer, 'id'>) => void;
  togglePartner: (id: string) => void;
  resetPeers: () => void;
}

const seedPeers: Peer[] = [
  { id: 'p1', name: 'Sham', streak: 14, studyHoursWeek: 12, isPartner: false },
  { id: 'p2', name: 'Gurpreet', streak: 7, studyHoursWeek: 8, isPartner: true },
  { id: 'p3', name: 'Arjun', streak: 21, studyHoursWeek: 15, isPartner: false },
];

export const usePeersStore = create<PeersState>()(
  persist(
    (set) => ({
      peers: seedPeers,
      addPeer: (p) => set((s) => ({ peers: [...s.peers, { ...p, id: generateId() }] })),
      togglePartner: (id) =>
        set((s) => ({
          peers: s.peers.map((p) => (p.id === id ? { ...p, isPartner: !p.isPartner } : p)),
        })),
      resetPeers: () => set({ peers: seedPeers }),
    }),
    { name: 'studyflow-peers', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
