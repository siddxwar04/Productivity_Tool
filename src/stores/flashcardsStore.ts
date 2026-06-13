import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Flashcard, FlashcardDeck } from '../types';
import { generateId } from '../utils/helpers';
import { useAnalyticsStore } from './analyticsStore';
import { triggerReward } from '../services/rewardsService';

interface FlashcardsState {
  decks: FlashcardDeck[];
  cards: Flashcard[];
  addDeck: (d: Omit<FlashcardDeck, 'id'>) => string;
  addCard: (c: Omit<Flashcard, 'id' | 'ease'>) => void;
  deleteDeck: (id: string) => void;
  getDeckCards: (deckId: string) => Flashcard[];
  reviewCard: (id: string, knew: boolean) => void;
  resetFlashcards: () => void;
}

const seedDecks: FlashcardDeck[] = [
  { id: 'deck1', name: 'Biology Terms', color: '#10B981' },
  { id: 'deck2', name: 'Spanish Vocab', color: '#6366F1' },
];

const seedCards: Flashcard[] = [
  { id: 'c1', deckId: 'deck1', front: 'Mitochondria', back: 'Powerhouse of the cell', ease: 2.5 },
  { id: 'c2', deckId: 'deck1', front: 'Photosynthesis', back: 'Converts light to energy', ease: 2.5 },
  { id: 'c3', deckId: 'deck2', front: 'Hello', back: 'Hola', ease: 2.5 },
];

export const useFlashcardsStore = create<FlashcardsState>()(
  persist(
    (set, get) => ({
      decks: seedDecks,
      cards: seedCards,
      addDeck: (d) => {
        const id = generateId();
        set((s) => ({ decks: [...s.decks, { ...d, id }] }));
        return id;
      },
      addCard: (c) =>
        set((s) => ({
          cards: [...s.cards, { ...c, id: generateId(), ease: 2.5 }],
        })),
      deleteDeck: (id) =>
        set((s) => ({
          decks: s.decks.filter((d) => d.id !== id),
          cards: s.cards.filter((c) => c.deckId !== id),
        })),
      getDeckCards: (deckId) => get().cards.filter((c) => c.deckId === deckId),
      reviewCard: (id, knew) => {
        set((s) => ({
          cards: s.cards.map((c) =>
            c.id === id
              ? { ...c, ease: knew ? c.ease + 0.1 : Math.max(1.3, c.ease - 0.2), lastReviewed: new Date().toISOString() }
              : c,
          ),
        }));
        useAnalyticsStore.getState().recordFlashcardReview();
        if (useAnalyticsStore.getState().flashcardsReviewed >= 100) {
          triggerReward('flashcard_100');
        }
      },
      resetFlashcards: () => set({ decks: seedDecks, cards: seedCards }),
    }),
    { name: 'studyflow-flashcards', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
