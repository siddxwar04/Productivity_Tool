export type ReviewRating = 'hard' | 'good' | 'easy';

export type FlashcardBadgeId =
  | 'first_review'
  | 'streak_3'
  | 'streak_7'
  | 'deck_master'
  | 'cards_50'
  | 'perfect_session';

export interface FlashcardBadge {
  id: FlashcardBadgeId;
  title: string;
  icon: string;
  description: string;
}

export interface FlashcardDeckStats {
  totalCards: number;
  masteredCards: number;
  progressPercent: number;
  lastStudiedAt: string | null;
  dueCount: number;
}

export interface FlashcardSessionStats {
  cardsReviewed: number;
  correctCount: number;
  studyTimeMs: number;
  accuracyPercent: number;
  masteryScore: number;
}

export interface FlashcardGamification {
  xp: number;
  level: number;
  dailyStreak: number;
  lastStudyDate: string | null;
  unlockedBadges: FlashcardBadgeId[];
  totalStudyTimeMs: number;
  lifetimeCardsReviewed: number;
  lifetimeCorrect: number;
}

export const FLASHCARD_BADGES: FlashcardBadge[] = [
  { id: 'first_review', title: 'First Steps', icon: '🎯', description: 'Complete your first review' },
  { id: 'streak_3', title: 'On Fire', icon: '🔥', description: '3-day study streak' },
  { id: 'streak_7', title: 'Week Warrior', icon: '⚡', description: '7-day study streak' },
  { id: 'deck_master', title: 'Deck Master', icon: '👑', description: 'Master every card in a deck' },
  { id: 'cards_50', title: 'Scholar', icon: '📚', description: 'Review 50 flashcards' },
  { id: 'perfect_session', title: 'Perfect Round', icon: '💎', description: '100% accuracy in a session' },
];

export const XP_BY_RATING: Record<ReviewRating, number> = {
  hard: 5,
  good: 10,
  easy: 15,
};

export const DECK_COMPLETE_BONUS_XP = 50;
