import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useFlashcardsStore } from '../../stores/flashcardsStore';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'StudyBuddy'>;

export function StudyBuddyScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const cards = useFlashcardsStore((s) => s.cards);
  const quizCards = useMemo(() => cards.slice(0, 10), [cards]);
  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);

  const card = quizCards[index];

  if (!card) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="AI Study Buddy" onBack={() => navigation.goBack()} />
        <Text style={[styles.empty, { color: colors.textSecondary }]}>Add flashcards to start adaptive quizzes.</Text>
        <Button title="Go to flashcards" onPress={() => navigation.navigate('Flashcards')} />
      </ScreenWrapper>
    );
  }

  const answer = (correct: boolean) => {
    if (correct) setScore(score + 1);
    setShowHint(false);
    if (index + 1 >= quizCards.length) {
      setIndex(quizCards.length);
    } else {
      setIndex(index + 1);
    }
  };

  if (index >= quizCards.length) {
    return (
      <ScreenWrapper scroll={false}>
        <ScreenHeader title="Quiz complete" onBack={() => navigation.goBack()} />
        <Text style={[styles.score, { color: colors.primary }]}>{score}/{quizCards.length}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Great job! Keep reviewing to improve.</Text>
        <Button title="Try again" onPress={() => { setIndex(0); setScore(0); }} />
      </ScreenWrapper>
    );
  }

  const hint = card.back.split(' ').slice(0, 2).join(' ') + '...';

  return (
    <ScreenWrapper scroll={false}>
      <ScreenHeader title={`Quiz ${index + 1}/${quizCards.length}`} onBack={() => navigation.goBack()} />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <Text style={[styles.question, { color: colors.text }]}>{card.front}</Text>
        {showHint && <Text style={[styles.hint, { color: colors.warning }]}>Hint: {hint}</Text>}
      </View>
      <TouchableOpacity onPress={() => setShowHint(true)}>
        <Text style={[styles.hintBtn, { color: colors.primary }]}>Need a hint?</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <Button title="I knew it" onPress={() => answer(true)} style={styles.half} />
        <Button title="Show answer" onPress={() => answer(false)} variant="secondary" style={styles.half} />
      </View>
      {showHint && (
        <Text style={[styles.answer, { color: colors.textSecondary, marginTop: 16, textAlign: 'center' }]}>{card.back}</Text>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', padding: 24, marginVertical: 20 },
  question: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  hint: { fontSize: 15, marginTop: 16 },
  hintBtn: { textAlign: 'center', fontWeight: '600', marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  answer: { fontSize: 16 },
  empty: { textAlign: 'center', marginVertical: 40 },
  score: { fontSize: 48, fontWeight: '800', textAlign: 'center', marginTop: 60 },
  sub: { textAlign: 'center', marginVertical: 16 },
});
