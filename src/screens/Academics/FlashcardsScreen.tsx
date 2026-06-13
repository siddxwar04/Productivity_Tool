import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { DeckCard } from '../../components/flashcards/DeckCard';
import { FlashcardGamificationHeader } from '../../components/flashcards/FlashcardGamificationHeader';
import { useFlashcardsStore } from '../../stores/flashcardsStore';
import { SUBJECT_COLORS } from '../../constants/milestones';
import { StudyStackParamList } from '../../navigation/types';
import { computeLifetimeAccuracy } from '../../services/flashcards/flashcardStats';

type Props = NativeStackScreenProps<StudyStackParamList, 'Flashcards'>;

const DECK_ICONS = ['📚', '🧬', '🗣️', '🧮', '⚗️', '🌍', '💻', '🎨'];

export function FlashcardsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const decks = useFlashcardsStore((s) => s.decks);
  const gamification = useFlashcardsStore((s) => s.gamification);
  const getDeckStats = useFlashcardsStore((s) => s.getDeckStats);
  const addDeck = useFlashcardsStore((s) => s.addDeck);
  const [name, setName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const create = () => {
    if (!name.trim()) return;
    const id = addDeck({
      name: name.trim(),
      color: SUBJECT_COLORS[decks.length % SUBJECT_COLORS.length],
      categoryIcon: DECK_ICONS[decks.length % DECK_ICONS.length],
    });
    setName('');
    setShowAdd(false);
    navigation.navigate('DeckDetail', { deckId: id });
  };

  const lifetimeAccuracy = computeLifetimeAccuracy(gamification);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Flashcards" onBack={() => navigation.goBack()} />

      <FlashcardGamificationHeader gamification={gamification} />

      <View style={[styles.summary, { backgroundColor: colors.surfaceSecondary }]}>
        <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
          Lifetime accuracy {lifetimeAccuracy}% · {gamification.lifetimeCardsReviewed} cards reviewed
        </Text>
      </View>

      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          name={deck.name}
          color={deck.color}
          categoryIcon={deck.categoryIcon ?? '📚'}
          stats={getDeckStats(deck.id)}
          onPress={() => navigation.navigate('DeckDetail', { deckId: deck.id })}
        />
      ))}

      {showAdd ? (
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
            placeholder="Deck name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
          <Button title="Create deck" onPress={create} />
        </View>
      ) : (
        <Button title="+ New deck" onPress={() => setShowAdd(true)} variant="secondary" style={styles.add} />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  summary: { borderRadius: 10, padding: 10, marginBottom: 14 },
  summaryText: { fontSize: 12, textAlign: 'center', fontWeight: '600' },
  add: { marginTop: 8 },
  addForm: { gap: 12, marginTop: 8 },
  input: { borderRadius: 10, padding: 14, fontSize: 16 },
});
