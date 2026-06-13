import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useFlashcardsStore } from '../../stores/flashcardsStore';
import { SUBJECT_COLORS } from '../../constants/milestones';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Flashcards'>;

export function FlashcardsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const decks = useFlashcardsStore((s) => s.decks);
  const cards = useFlashcardsStore((s) => s.cards);
  const addDeck = useFlashcardsStore((s) => s.addDeck);
  const [name, setName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const create = () => {
    if (!name.trim()) return;
    const id = addDeck({ name: name.trim(), color: SUBJECT_COLORS[decks.length % SUBJECT_COLORS.length] });
    setName('');
    setShowAdd(false);
    navigation.navigate('DeckDetail', { deckId: id });
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Flashcards" onBack={() => navigation.goBack()} />
      {decks.map((d) => {
        const count = cards.filter((c) => c.deckId === d.id).length;
        return (
          <TouchableOpacity
            key={d.id}
            style={[styles.deck, { backgroundColor: colors.surface, borderLeftColor: d.color }]}
            onPress={() => navigation.navigate('DeckDetail', { deckId: d.id })}
          >
            <Text style={[styles.deckName, { color: colors.text }]}>{d.name}</Text>
            <Text style={[styles.deckCount, { color: colors.textSecondary }]}>{count} cards</Text>
          </TouchableOpacity>
        );
      })}
      {showAdd ? (
        <View style={styles.addForm}>
          <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]} placeholder="Deck name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
          <Button title="Create" onPress={create} />
        </View>
      ) : (
        <Button title="+ New deck" onPress={() => setShowAdd(true)} variant="secondary" style={styles.add} />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  deck: { padding: 16, borderRadius: 12, borderLeftWidth: 4, marginBottom: 10 },
  deckName: { fontSize: 17, fontWeight: '700' },
  deckCount: { fontSize: 13, marginTop: 4 },
  add: { marginTop: 8 },
  addForm: { gap: 12, marginTop: 8 },
  input: { borderRadius: 10, padding: 14, fontSize: 16 },
});
