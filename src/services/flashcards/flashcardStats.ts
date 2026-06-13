import { Flashcard, FlashcardDeck } from '../../types';
import {
  FlashcardDeckStats,
  FlashcardGamification,
  FlashcardSessionStats,
} from '../../types/flashcard';
import { isCardDue, isCardMastered } from './spacedRepetition';

export function computeDeckStats(deckId: string, cards: Flashcard[]): FlashcardDeckStats {
  const deckCards = cards.filter((c) => c.deckId === deckId);
  const totalCards = deckCards.length;
  const masteredCards = deckCards.filter((c) => isCardMastered(c)).length;
  const progressPercent = totalCards === 0 ? 0 : Math.round((masteredCards / totalCards) * 100);
  const dueCount = deckCards.filter((c) => isCardDue(c)).length;

  const reviewDates = deckCards
    .map((c) => c.lastReviewed)
    .filter((d): d is string => !!d)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return {
    totalCards,
    masteredCards,
    progressPercent,
    lastStudiedAt: reviewDates[0] ?? null,
    dueCount,
  };
}

export function getDeckLastStudied(deck: FlashcardDeck, cards: Flashcard[]): string | null {
  if (deck.lastStudiedAt) {
    return deck.lastStudiedAt;
  }
  return computeDeckStats(deck.id, cards).lastStudiedAt;
}

export function computeSessionStats(
  cardsReviewed: number,
  correctCount: number,
  studyTimeMs: number,
  deckCards: Flashcard[],
): FlashcardSessionStats {
  const accuracyPercent =
    cardsReviewed === 0 ? 0 : Math.round((correctCount / cardsReviewed) * 100);

  const masteredCards = deckCards.filter((c) => isCardMastered(c)).length;
  const masteryScore =
    deckCards.length === 0 ? 0 : Math.round((masteredCards / deckCards.length) * 100);

  return {
    cardsReviewed,
    correctCount,
    studyTimeMs,
    accuracyPercent,
    masteryScore,
  };
}

export function computeFlashcardLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function computeLifetimeAccuracy(gamification: FlashcardGamification): number {
  if (gamification.lifetimeCardsReviewed === 0) {
    return 0;
  }
  return Math.round(
    (gamification.lifetimeCorrect / gamification.lifetimeCardsReviewed) * 100,
  );
}

export function formatStudyDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) {
    return 'Never';
  }

  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  return new Date(iso).toLocaleDateString();
}
