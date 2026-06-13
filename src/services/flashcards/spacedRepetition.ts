import { Flashcard } from '../../types';
import { ReviewRating } from '../../types/flashcard';

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isCardDue(card: Flashcard, now = new Date()): boolean {
  if (!card.nextReviewAt) {
    return true;
  }
  return new Date(card.nextReviewAt).getTime() <= now.getTime();
}

export function isCardMastered(card: Flashcard): boolean {
  if (card.mastered) {
    return true;
  }
  const repetitions = card.repetitions ?? 0;
  const interval = card.interval ?? 0;
  return repetitions >= 3 && card.ease >= 2.5 && interval >= 7;
}

export function applySpacedRepetition(
  card: Flashcard,
  rating: ReviewRating,
  now = new Date(),
): Flashcard {
  let ease = card.ease;
  let repetitions = card.repetitions ?? 0;
  let interval = card.interval ?? 0;

  if (rating === 'hard') {
    repetitions = 0;
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else if (rating === 'good') {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.max(1, Math.round(interval * ease));
    }
    repetitions += 1;
  } else {
    ease = Math.min(3.0, ease + 0.15);
    if (repetitions === 0) {
      interval = 2;
    } else {
      interval = Math.max(1, Math.round(interval * ease * 1.3));
    }
    repetitions += 1;
  }

  const mastered = repetitions >= 3 && ease >= 2.5 && interval >= 7;

  return {
    ...card,
    ease,
    repetitions,
    interval,
    mastered,
    lastReviewed: now.toISOString(),
    nextReviewAt: addDays(now, interval).toISOString(),
  };
}

export function ratingFromLegacyKnew(knew: boolean): ReviewRating {
  return knew ? 'good' : 'hard';
}
