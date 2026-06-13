import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { FlashcardFlip } from '../../components/flashcards/FlashcardFlip';
import { ReviewRatingButtons } from '../../components/flashcards/ReviewRatingButtons';
import { FlashcardAnalyticsCard } from '../../components/flashcards/FlashcardAnalyticsCard';
import { ConfettiCelebration } from '../../components/flashcards/ConfettiCelebration';
import { useFlashcardsStore } from '../../stores/flashcardsStore';
import { ReviewRating } from '../../types/flashcard';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Review'>;

export function ReviewScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { deckId } = route.params;
  const decks = useFlashcardsStore((s) => s.decks);
  const getDueCards = useFlashcardsStore((s) => s.getDueCards);
  const getDeckCards = useFlashcardsStore((s) => s.getDeckCards);
  const reviewCardWithRating = useFlashcardsStore((s) => s.reviewCardWithRating);
  const completeStudySession = useFlashcardsStore((s) => s.completeStudySession);

  const deck = decks.find((d) => d.id === deckId);
  const [queue] = useState(() => {
    const due = useFlashcardsStore.getState().getDueCards(deckId);
    if (due.length > 0) {
      return due;
    }
    return useFlashcardsStore.getState().getDeckCards(deckId);
  });

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    cardsReviewed: 0,
    correctCount: 0,
    studyTimeMs: 0,
    accuracyPercent: 0,
    masteryScore: 0,
  });

  const sessionStart = useRef(Date.now());
  const reviewedRef = useRef(0);
  const correctRef = useRef(0);

  const card = queue[index];

  useEffect(() => {
    if (completed) {
      return;
    }
    setFlipped(false);
  }, [index, completed]);

  const finishSession = () => {
    const studyTimeMs = Date.now() - sessionStart.current;
    const finalStats = completeStudySession(deckId, {
      cardsReviewed: reviewedRef.current,
      correctCount: correctRef.current,
      studyTimeMs,
    });
    setSessionStats(finalStats);
    setCompleted(true);
  };

  const rate = (rating: ReviewRating) => {
    if (!card) return;

    reviewCardWithRating(card.id, rating);
    reviewedRef.current += 1;
    if (rating !== 'hard') {
      correctRef.current += 1;
    }

    setFlipped(false);

    if (index + 1 >= queue.length) {
      finishSession();
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  if (queue.length === 0) {
    return (
      <ScreenWrapper scroll={false}>
        <ScreenHeader title="Study" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No cards to study</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Add cards to this deck first.
          </Text>
          <Button title="Go back" onPress={() => navigation.goBack()} style={styles.doneBtn} />
        </View>
      </ScreenWrapper>
    );
  }

  if (completed) {
    return (
      <ScreenWrapper scroll={false}>
        <ConfettiCelebration active />
        <ScreenHeader title="Complete!" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={[styles.doneTitle, { color: colors.text }]}>Deck complete!</Text>
          <Text style={[styles.doneSub, { color: colors.textSecondary }]}>
            Great work — you earned bonus XP for finishing this session.
          </Text>
          <FlashcardAnalyticsCard stats={sessionStats} title="Your session" />
          <Button title="Done" onPress={() => navigation.goBack()} style={styles.doneBtn} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false}>
      <ScreenHeader
        title={`${index + 1} / ${queue.length}`}
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSecondary }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((index + (flipped ? 0.5 : 0)) / queue.length) * 100}%`,
              backgroundColor: deck?.color ?? colors.primary,
            },
          ]}
        />
      </View>

      <FlashcardFlip
        front={card.front}
        back={card.back}
        flipped={flipped}
        onFlip={() => setFlipped((prev) => !prev)}
        accentColor={deck?.color}
      />

      {flipped ? (
        <ReviewRatingButtons onRate={rate} />
      ) : (
        <Text style={[styles.flipHint, { color: colors.textMuted }]}>
          Tap the card to flip, then rate your recall
        </Text>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 4, borderRadius: 2 },
  flipHint: { textAlign: 'center', fontSize: 13, marginTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '700' },
  emptySub: { fontSize: 15, textAlign: 'center' },
  celebrationEmoji: { fontSize: 56 },
  doneTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  doneSub: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  doneBtn: { minWidth: 180, marginTop: 8 },
});
