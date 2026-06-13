import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useFlashcardsStore } from '../../stores/flashcardsStore';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Review'>;

export function ReviewScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { deckId } = route.params;
  const getDeckCards = useFlashcardsStore((s) => s.getDeckCards);
  const reviewCard = useFlashcardsStore((s) => s.reviewCard);
  const cards = getDeckCards(deckId);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];
  if (!card) {
    return (
      <ScreenWrapper scroll={false}>
        <ScreenHeader title="Review" onBack={() => navigation.goBack()} />
        <Text style={[styles.done, { color: colors.text }]}>Review complete! 🎉</Text>
      </ScreenWrapper>
    );
  }

  const answer = (knew: boolean) => {
    reviewCard(card.id, knew);
    setFlipped(false);
    if (index + 1 >= cards.length) {
      navigation.goBack();
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <ScreenWrapper scroll={false}>
      <ScreenHeader title={`Review ${index + 1}/${cards.length}`} onBack={() => navigation.goBack()} />
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}
        onPress={() => setFlipped(!flipped)}
        activeOpacity={0.9}
      >
        <Text style={[styles.cardText, { color: colors.text }]}>
          {flipped ? card.back : card.front}
        </Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Tap to flip</Text>
      </TouchableOpacity>
      {flipped && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.error }]} onPress={() => answer(false)}>
            <Text style={styles.btnText}>Didn't know</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]} onPress={() => answer(true)}>
            <Text style={styles.btnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', padding: 24, marginVertical: 20 },
  cardText: { fontSize: 24, fontWeight: '600', textAlign: 'center' },
  hint: { fontSize: 13, marginTop: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  done: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 80 },
});
