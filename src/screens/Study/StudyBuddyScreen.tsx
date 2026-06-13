import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'StudyBuddy'>;

const { height } = Dimensions.get('window');

export function StudyBuddyScreen({ navigation }: Props) {
  const quizCards = QUIZ_QUESTIONS;

  const [sessionKey, setSessionKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState({ knew: 0, review: 0 });

  const cardFlip = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const card = quizCards[currentIndex];
  const total = quizCards.length;
  const progress = total > 0 ? (currentIndex / total) * 100 : 0;

  useEffect(() => {
    cardScale.setValue(0.92);
    cardOpacity.setValue(0);
    cardFlip.setValue(0);
    hintOpacity.setValue(0);
    setShowAnswer(false);
    setShowHint(false);

    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [cardFlip, cardOpacity, cardScale, currentIndex, hintOpacity, progress, progressWidth, sessionKey]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [glowAnim, sessionKey]);

  const flipCard = () => {
    if (showAnswer) return;
    setShowAnswer(true);
    Animated.spring(cardFlip, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const toggleHint = () => {
    const next = !showHint;
    setShowHint(next);
    Animated.timing(hintOpacity, {
      toValue: next ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const nextCard = (knew: boolean) => {
    setScore((prev) => ({
      knew: prev.knew + (knew ? 1 : 0),
      review: prev.review + (knew ? 0 : 1),
    }));

    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.92, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      if (currentIndex + 1 >= total) {
        setFinished(true);
        return;
      }
      setCurrentIndex((i) => i + 1);
    });
  };

  const restart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setShowHint(false);
    setFinished(false);
    setScore({ knew: 0, review: 0 });
    setSessionKey((k) => k + 1);
  };

  const frontRotate = cardFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = cardFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  if (finished) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Quiz complete</Text>
            </View>
            <View style={styles.scorePill}>
              <Text style={styles.scoreText}>✓ {score.knew}</Text>
            </View>
          </View>

          <View style={styles.completeWrap}>
            <Text style={styles.completeScore}>
              {score.knew}/{total}
            </Text>
            <Text style={styles.completeSub}>Great job! Keep reviewing to improve.</Text>
            <TouchableOpacity activeOpacity={0.85} onPress={restart}>
              <LinearGradient
                colors={['#7C6FF0', '#6C5CE7']}
                style={styles.revealBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.revealBtnText}>Try again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <Animated.View style={[styles.bgGlow, { opacity: glowOpacity }]}>
        <LinearGradient
          colors={['rgba(108,92,231,0.12)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Quiz{' '}
              <Text style={styles.headerCount}>
                {currentIndex + 1}/{total}
              </Text>
            </Text>
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>✓ {score.knew}</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={['#6C5CE7', '#A29BFE']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>

        {card?.tag ? (
          <View style={styles.tagRow}>
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>{card.tag}</Text>
            </View>
          </View>
        ) : null}

        <Animated.View
          style={[
            styles.cardWrap,
            { opacity: cardOpacity, transform: [{ scale: cardScale }] },
          ]}
        >
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
            ]}
          >
            <LinearGradient
              colors={['#14141F', '#1A1A2E']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <LinearGradient
              colors={['rgba(108,92,231,0.3)', 'transparent']}
              style={styles.cornerAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.cardInner}>
              <Text style={styles.cardLabel}>TERM</Text>
              <Text style={styles.cardTerm}>{card?.term}</Text>
              <TouchableOpacity style={styles.tapHint} onPress={flipCard}>
                <Text style={styles.tapHintText}>Tap to reveal answer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardBorder} />
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
            ]}
          >
            <LinearGradient
              colors={['#14141F', '#1E1A2E']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <LinearGradient
              colors={['rgba(108,92,231,0.25)', 'transparent']}
              style={styles.cornerAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.cardInner}>
              <Text style={styles.cardLabel}>ANSWER</Text>
              <Text style={styles.cardAnswer}>{card?.answer}</Text>
            </View>
            <View style={[styles.cardBorder, styles.cardBorderAnswer]} />
          </Animated.View>
        </Animated.View>

        <View style={styles.hintRow}>
          {card?.hint ? (
            <TouchableOpacity onPress={toggleHint} style={styles.hintBtn}>
              <Text style={styles.hintBtnText}>
                {showHint ? 'Hide hint' : '💡 Need a hint?'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Animated.View style={[styles.hintBox, { opacity: hintOpacity }]}>
          {showHint && card?.hint ? (
            <View style={styles.hintInner}>
              <Text style={styles.hintContent}>{card.hint}</Text>
            </View>
          ) : null}
        </Animated.View>

        <View style={styles.actions}>
          {!showAnswer ? (
            <TouchableOpacity style={styles.revealBtnWrap} activeOpacity={0.85} onPress={flipCard}>
              <LinearGradient
                colors={['#7C6FF0', '#6C5CE7']}
                style={styles.revealBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.revealBtnText}>Show answer</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.answerBtns}>
              <TouchableOpacity
                style={styles.reviewBtnWrap}
                activeOpacity={0.85}
                onPress={() => nextCard(false)}
              >
                <View style={styles.reviewBtn}>
                  <Text style={styles.reviewBtnText}>🔁  Review again</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.knewBtnWrap}
                activeOpacity={0.85}
                onPress={() => nextCard(true)}
              >
                <LinearGradient
                  colors={['#00B894', '#00CEC9']}
                  style={styles.knewBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.knewBtnText}>✓  I knew it</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  safe: { flex: 1, paddingHorizontal: 20 },
  bgGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: '#fff', fontSize: 18 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  headerCount: { color: 'rgba(255,255,255,0.4)', fontWeight: '400' },
  scorePill: {
    backgroundColor: 'rgba(0,184,148,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(0,184,148,0.3)',
  },
  scoreText: { color: '#00B894', fontSize: 13, fontWeight: '600' },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, overflow: 'hidden' },
  tagRow: { alignItems: 'center', marginBottom: 14 },
  tagPill: {
    backgroundColor: 'rgba(108,92,231,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(108,92,231,0.4)',
  },
  tagText: { color: '#A29BFE', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  cardWrap: {
    flex: 1,
    marginBottom: 12,
    minHeight: 260,
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardFront: {},
  cardBack: {},
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(108,92,231,0.4)',
  },
  cardBorderAnswer: { borderColor: 'rgba(0,184,148,0.4)' },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 180,
    height: 180,
    borderRadius: 24,
  },
  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  cardLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 20,
  },
  cardTerm: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  cardAnswer: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 28,
  },
  tapHint: { marginTop: 28 },
  tapHintText: { color: 'rgba(255,255,255,0.2)', fontSize: 13, letterSpacing: 0.3 },
  hintRow: { alignItems: 'center', marginBottom: 8, minHeight: 32 },
  hintBtn: { paddingVertical: 6, paddingHorizontal: 16 },
  hintBtnText: { color: '#6C5CE7', fontSize: 13, fontWeight: '500' },
  hintBox: { minHeight: 0, marginBottom: 8 },
  hintInner: {
    backgroundColor: 'rgba(108,92,231,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(108,92,231,0.25)',
    marginHorizontal: 4,
  },
  hintContent: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: { marginBottom: Platform.OS === 'ios' ? 8 : 12 },
  revealBtnWrap: { borderRadius: 16, overflow: 'hidden' },
  revealBtn: { height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  revealBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  answerBtns: { flexDirection: 'row', gap: 12 },
  reviewBtnWrap: { flex: 1 },
  reviewBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  reviewBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  knewBtnWrap: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  knewBtn: { height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  knewBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  completeWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  completeScore: {
    fontSize: 56,
    fontWeight: '800',
    color: '#A29BFE',
    marginBottom: 12,
  },
  completeSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginBottom: 32,
  },
});
