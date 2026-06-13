import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ReviewRating } from '../../types/flashcard';

interface ReviewRatingButtonsProps {
  onRate: (rating: ReviewRating) => void;
}

const BUTTONS: { rating: ReviewRating; label: string; sub: string; color: string }[] = [
  { rating: 'hard', label: 'Hard', sub: '+5 XP', color: '#F87171' },
  { rating: 'good', label: 'Good', sub: '+10 XP', color: '#818CF8' },
  { rating: 'easy', label: 'Easy', sub: '+15 XP', color: '#34D399' },
];

export function ReviewRatingButtons({ onRate }: ReviewRatingButtonsProps) {
  return (
    <View style={styles.row}>
      {BUTTONS.map((btn) => (
        <RatingButton key={btn.rating} {...btn} onPress={() => onRate(btn.rating)} />
      ))}
    </View>
  );
}

function RatingButton({
  label,
  sub,
  color,
  onPress,
}: {
  label: string;
  sub: string;
  color: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={styles.btnWrap}>
      <Animated.View style={[styles.btn, { backgroundColor: color, transform: [{ scale }] }]}>
        <Text style={styles.btnLabel}>{label}</Text>
        <Text style={styles.btnSub}>{sub}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  btnWrap: { flex: 1 },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnLabel: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 4, fontWeight: '600' },
});
