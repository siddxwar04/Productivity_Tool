import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Flashcard, FlashcardDeck } from '../types';
import {
  DECK_COMPLETE_BONUS_XP,
  FlashcardGamification,
  FlashcardSessionStats,
  ReviewRating,
  XP_BY_RATING,
} from '../types/flashcard';
import { generateId } from '../utils/helpers';
import { useAnalyticsStore } from './analyticsStore';
import { useUserProfileStore } from './userProfileStore';
import { triggerReward } from '../services/rewardsService';
import {
  applySpacedRepetition,
  isCardDue,
  isCardMastered,
  ratingFromLegacyKnew,
} from '../services/flashcards/spacedRepetition';
import {
  computeDeckStats,
  computeFlashcardLevel,
  computeSessionStats,
} from '../services/flashcards/flashcardStats';
import {
  FlashcardGeneratorInput,
  GeneratedFlashcardDraft,
  getFlashcardGenerator,
} from '../services/flashcards/flashcardGenerator';

const DEFAULT_GAMIFICATION: FlashcardGamification = {
  xp: 0,
  level: 1,
  dailyStreak: 0,
  lastStudyDate: null,
  unlockedBadges: [],
  totalStudyTimeMs: 0,
  lifetimeCardsReviewed: 0,
  lifetimeCorrect: 0,
};

const seedDecks: FlashcardDeck[] = [
  { id: 'deck1', name: 'Biology Terms', color: '#10B981', categoryIcon: '🧬' },
  { id: 'deck2', name: 'Spanish Vocab', color: '#6366F1', categoryIcon: '🗣️' },
];

const seedCards: Flashcard[] = [
  { id: 'c1', deckId: 'deck1', front: 'Mitochondria', back: 'Powerhouse of the cell', ease: 2.5, repetitions: 0, interval: 0 },
  { id: 'c2', deckId: 'deck1', front: 'Photosynthesis', back: 'Converts light to energy', ease: 2.5, repetitions: 0, interval: 0 },
  { id: 'c3', deckId: 'deck2', front: 'Hello', back: 'Hola', ease: 2.5, repetitions: 0, interval: 0 },
];

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function updateDailyStreak(gamification: FlashcardGamification): FlashcardGamification {
  const today = todayKey();
  if (gamification.lastStudyDate === today) {
    return gamification;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];
  const continued = gamification.lastStudyDate === yesterdayKey;

  return {
    ...gamification,
    dailyStreak: continued ? gamification.dailyStreak + 1 : 1,
    lastStudyDate: today,
  };
}

function unlockBadges(
  gamification: FlashcardGamification,
  deckId: string,
  cards: Flashcard[],
  sessionStats: FlashcardSessionStats,
): FlashcardGamification {
  const badges = new Set(gamification.unlockedBadges);

  if (gamification.lifetimeCardsReviewed > 0) {
    badges.add('first_review');
  }
  if (gamification.dailyStreak >= 3) {
    badges.add('streak_3');
  }
  if (gamification.dailyStreak >= 7) {
    badges.add('streak_7');
  }
  if (gamification.lifetimeCardsReviewed >= 50) {
    badges.add('cards_50');
  }
  if (sessionStats.accuracyPercent === 100 && sessionStats.cardsReviewed > 0) {
    badges.add('perfect_session');
  }

  const deckCards = cards.filter((c) => c.deckId === deckId);
  if (deckCards.length > 0 && deckCards.every((c) => isCardMastered(c))) {
    badges.add('deck_master');
  }

  return { ...gamification, unlockedBadges: [...badges] };
}

interface FlashcardsState {
  decks: FlashcardDeck[];
  cards: Flashcard[];
  gamification: FlashcardGamification;
  addDeck: (d: Omit<FlashcardDeck, 'id'>) => string;
  addCard: (c: Omit<Flashcard, 'id' | 'ease'>) => void;
  addGeneratedCards: (deckId: string, drafts: GeneratedFlashcardDraft[]) => number;
  generateCardsForDeck: (input: FlashcardGeneratorInput) => Promise<number>;
  deleteDeck: (id: string) => void;
  getDeckCards: (deckId: string) => Flashcard[];
  getDueCards: (deckId: string) => Flashcard[];
  getDeckStats: (deckId: string) => ReturnType<typeof computeDeckStats>;
  reviewCard: (id: string, knew: boolean) => void;
  reviewCardWithRating: (id: string, rating: ReviewRating) => void;
  completeStudySession: (
    deckId: string,
    sessionStats: Omit<FlashcardSessionStats, 'masteryScore' | 'accuracyPercent'>,
  ) => FlashcardSessionStats;
  resetFlashcards: () => void;
}

export const useFlashcardsStore = create<FlashcardsState>()(
  persist(
    (set, get) => ({
      decks: seedDecks,
      cards: seedCards,
      gamification: DEFAULT_GAMIFICATION,

      addDeck: (d) => {
        const id = generateId();
        set((s) => ({
          decks: [...s.decks, { categoryIcon: '📚', ...d, id }],
        }));
        return id;
      },

      addCard: (c) =>
        set((s) => ({
          cards: [
            ...s.cards,
            {
              ...c,
              id: generateId(),
              ease: 2.5,
              repetitions: 0,
              interval: 0,
              mastered: false,
            },
          ],
        })),

      addGeneratedCards: (deckId, drafts) => {
        const created = drafts.map((draft) => ({
          ...draft,
          deckId,
          id: generateId(),
          ease: 2.5,
          repetitions: 0,
          interval: 0,
          mastered: false,
        }));
        set((s) => ({ cards: [...s.cards, ...created] }));
        return created.length;
      },

      generateCardsForDeck: async (input) => {
        const result = await getFlashcardGenerator().generate(input);
        return get().addGeneratedCards(input.deckId, result.cards);
      },

      deleteDeck: (id) =>
        set((s) => ({
          decks: s.decks.filter((d) => d.id !== id),
          cards: s.cards.filter((c) => c.deckId !== id),
        })),

      getDeckCards: (deckId) => get().cards.filter((c) => c.deckId === deckId),

      getDueCards: (deckId) =>
        get()
          .cards.filter((c) => c.deckId === deckId)
          .filter((c) => isCardDue(c)),

      getDeckStats: (deckId) => computeDeckStats(deckId, get().cards),

      reviewCard: (id, knew) => {
        get().reviewCardWithRating(id, ratingFromLegacyKnew(knew));
      },

      reviewCardWithRating: (id, rating) => {
        const xpGain = XP_BY_RATING[rating];
        const isCorrect = rating !== 'hard';

        set((s) => {
          const updatedCards = s.cards.map((c) =>
            c.id === id ? applySpacedRepetition(c, rating) : c,
          );
          const card = s.cards.find((c) => c.id === id);
          const deckId = card?.deckId;
          const updatedDecks = deckId
            ? s.decks.map((d) =>
                d.id === deckId ? { ...d, lastStudiedAt: new Date().toISOString() } : d,
              )
            : s.decks;

          const gamification = updateDailyStreak({
            ...s.gamification,
            xp: s.gamification.xp + xpGain,
            level: computeFlashcardLevel(s.gamification.xp + xpGain),
            lifetimeCardsReviewed: s.gamification.lifetimeCardsReviewed + 1,
            lifetimeCorrect: s.gamification.lifetimeCorrect + (isCorrect ? 1 : 0),
          });

          return { cards: updatedCards, decks: updatedDecks, gamification };
        });

        useUserProfileStore.getState().addXp(xpGain);
        useAnalyticsStore.getState().recordFlashcardReview();
        if (useAnalyticsStore.getState().flashcardsReviewed >= 100) {
          triggerReward('flashcard_100');
        }
      },

      completeStudySession: (deckId, partial) => {
        const deckCards = get().cards.filter((c) => c.deckId === deckId);
        const sessionStats = computeSessionStats(
          partial.cardsReviewed,
          partial.correctCount,
          partial.studyTimeMs,
          deckCards,
        );

        set((s) => {
          const newXp = s.gamification.xp + DECK_COMPLETE_BONUS_XP;
          let gamification = updateDailyStreak({
            ...s.gamification,
            xp: newXp,
            level: computeFlashcardLevel(newXp),
            totalStudyTimeMs: s.gamification.totalStudyTimeMs + partial.studyTimeMs,
          });
          gamification = unlockBadges(gamification, deckId, s.cards, sessionStats);
          return { gamification };
        });

        useUserProfileStore.getState().addXp(DECK_COMPLETE_BONUS_XP);
        return sessionStats;
      },

      resetFlashcards: () =>
        set({ decks: seedDecks, cards: seedCards, gamification: DEFAULT_GAMIFICATION }),
    }),
    { name: 'studyflow-flashcards', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
