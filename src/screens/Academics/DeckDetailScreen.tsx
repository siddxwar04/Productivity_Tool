import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useFlashcardsStore } from '../../stores/flashcardsStore';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'DeckDetail'>;

export function DeckDetailScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { deckId } = route.params;
  const decks = useFlashcardsStore((s) => s.decks);
  const getDeckCards = useFlashcardsStore((s) => s.getDeckCards);
  const addCard = useFlashcardsStore((s) => s.addCard);
  const deck = decks.find((d) => d.id === deckId);
  const cards = getDeckCards(deckId);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const add = () => {
    if (!front.trim() || !back.trim()) return;
    addCard({ deckId, front: front.trim(), back: back.trim() });
    setFront('');
    setBack('');
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title={deck?.name ?? 'Deck'} onBack={() => navigation.goBack()} />
      {cards.length > 0 && (
        <Button title="Start review" onPress={() => navigation.navigate('Review', { deckId })} style={styles.review} />
      )}
      {cards.map((c) => (
        <View key={c.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.front, { color: colors.text }]}>{c.front}</Text>
          <Text style={[styles.back, { color: colors.textSecondary }]}>{c.back}</Text>
        </View>
      ))}
      <Text style={[styles.section, { color: colors.textSecondary }]}>Add card</Text>
      <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]} placeholder="Front" placeholderTextColor={colors.textMuted} value={front} onChangeText={setFront} />
      <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]} placeholder="Back" placeholderTextColor={colors.textMuted} value={back} onChangeText={setBack} />
      <Button title="Add card" onPress={add} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  review: { marginBottom: 16 },
  card: { padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  front: { fontSize: 16, fontWeight: '600' },
  back: { fontSize: 14, marginTop: 4 },
  section: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: { borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 8 },
});
