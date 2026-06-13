import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { FlashcardAnalyticsCard } from '../../components/flashcards/FlashcardAnalyticsCard';
import { useFlashcardsStore } from '../../stores/flashcardsStore';
import { StudyStackParamList } from '../../navigation/types';
import { formatRelativeDate } from '../../services/flashcards/flashcardStats';

type Props = NativeStackScreenProps<StudyStackParamList, 'DeckDetail'>;

export function DeckDetailScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { deckId } = route.params;
  const decks = useFlashcardsStore((s) => s.decks);
  const getDeckCards = useFlashcardsStore((s) => s.getDeckCards);
  const getDeckStats = useFlashcardsStore((s) => s.getDeckStats);
  const getDueCards = useFlashcardsStore((s) => s.getDueCards);
  const addCard = useFlashcardsStore((s) => s.addCard);
  const generateCardsForDeck = useFlashcardsStore((s) => s.generateCardsForDeck);
  const gamification = useFlashcardsStore((s) => s.gamification);

  const deck = decks.find((d) => d.id === deckId);
  const cards = getDeckCards(deckId);
  const stats = getDeckStats(deckId);
  const dueCards = getDueCards(deckId);
  const studyQueue = dueCards.length > 0 ? dueCards : cards;

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [generating, setGenerating] = useState(false);

  const add = () => {
    if (!front.trim() || !back.trim()) return;
    addCard({ deckId, front: front.trim(), back: back.trim() });
    setFront('');
    setBack('');
  };

  const startReview = () => {
    if (studyQueue.length === 0) {
      Alert.alert('No cards', 'Add cards to this deck before studying.');
      return;
    }
    navigation.navigate('Review', { deckId });
  };

  const handleAiImport = async () => {
    setGenerating(true);
    try {
      const count = await generateCardsForDeck({
        sourceType: 'pdf',
        deckId,
        maxCards: 5,
      });
      Alert.alert('Cards added', `${count} sample cards imported. Connect an AI provider for PDF generation.`);
    } catch {
      Alert.alert('Import failed', 'Could not generate cards right now.');
    } finally {
      setGenerating(false);
    }
  };

  const deckAnalytics = {
    cardsReviewed: gamification.lifetimeCardsReviewed,
    correctCount: gamification.lifetimeCorrect,
    studyTimeMs: gamification.totalStudyTimeMs,
    accuracyPercent: gamification.lifetimeCardsReviewed
      ? Math.round((gamification.lifetimeCorrect / gamification.lifetimeCardsReviewed) * 100)
      : 0,
    masteryScore: stats.progressPercent,
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title={deck?.name ?? 'Deck'} onBack={() => navigation.goBack()} />

      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.heroIcon}>{deck?.categoryIcon ?? '📚'}</Text>
        <View style={styles.heroMeta}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{deck?.name}</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            {stats.masteredCards}/{stats.totalCards} mastered · Last studied {formatRelativeDate(stats.lastStudiedAt)}
          </Text>
        </View>
        <ProgressBar progress={stats.progressPercent / 100} color={deck?.color ?? colors.primary} height={8} />
      </View>

      <FlashcardAnalyticsCard stats={deckAnalytics} title="Deck analytics" />

      {cards.length > 0 && (
        <Button
          title={dueCards.length > 0 ? `Study ${dueCards.length} due cards` : 'Study all cards'}
          onPress={startReview}
          style={styles.review}
        />
      )}

      <Button
        title={generating ? 'Generating…' : 'Import from PDF (AI-ready)'}
        onPress={handleAiImport}
        variant="secondary"
        loading={generating}
        style={styles.import}
      />

      {cards.map((c) => (
        <View key={c.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardTop}>
            <Text style={[styles.front, { color: colors.text }]}>{c.front}</Text>
            {c.mastered ? (
              <Text style={[styles.mastered, { color: colors.success }]}>Mastered</Text>
            ) : null}
          </View>
          <Text style={[styles.back, { color: colors.textSecondary }]}>{c.back}</Text>
        </View>
      ))}

      <Text style={[styles.section, { color: colors.textSecondary }]}>Add card</Text>
      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
        placeholder="Front (question)"
        placeholderTextColor={colors.textMuted}
        value={front}
        onChangeText={setFront}
      />
      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
        placeholder="Back (answer)"
        placeholderTextColor={colors.textMuted}
        value={back}
        onChangeText={setBack}
      />
      <Button title="Add card" onPress={add} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hero: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12, gap: 10 },
  heroIcon: { fontSize: 28 },
  heroMeta: { gap: 4 },
  heroTitle: { fontSize: 20, fontWeight: '800' },
  heroSub: { fontSize: 13 },
  review: { marginBottom: 10 },
  import: { marginBottom: 16 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  front: { fontSize: 16, fontWeight: '700', flex: 1 },
  mastered: { fontSize: 11, fontWeight: '700' },
  back: { fontSize: 14, marginTop: 4 },
  section: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: { borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 8 },
});
