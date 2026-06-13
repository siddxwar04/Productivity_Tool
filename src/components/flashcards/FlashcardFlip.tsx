import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface FlashcardFlipProps {
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
  accentColor?: string;
}

export function FlashcardFlip({ front, back, flipped, onFlip, accentColor }: FlashcardFlipProps) {
  const { colors } = useTheme();
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const accent = accentColor ?? colors.primary;

  React.useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [flipped, flipAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Pressable
      onPress={onFlip}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.wrapper}
    >
      <Animated.View style={[styles.cardShell, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.View
          style={[
            styles.face,
            {
              backgroundColor: colors.surface,
              borderColor: accent,
              opacity: frontOpacity,
              transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
            },
          ]}
        >
          <Text style={[styles.label, { color: accent }]}>Question</Text>
          <Text style={[styles.text, { color: colors.text }]}>{front}</Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>Tap to reveal answer</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.face,
            styles.backFace,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: accent,
              opacity: backOpacity,
              transform: [{ perspective: 1000 }, { rotateY: backRotate }],
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.success }]}>Answer</Text>
          <Text style={[styles.text, { color: colors.text }]}>{back}</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, marginVertical: 16 },
  cardShell: { flex: 1, minHeight: 280 },
  face: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    borderWidth: 2,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 24px rgba(0,0,0,0.25)' } : {}),
  },
  backFace: {},
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
  text: { fontSize: 26, fontWeight: '700', textAlign: 'center', lineHeight: 34 },
  hint: { fontSize: 13, marginTop: 20 },
});
