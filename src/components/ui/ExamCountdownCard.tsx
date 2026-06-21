import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import {
  Exam,
  EXAM_TYPE_LABELS,
  URGENCY_CONFIG,
  getDaysLeft,
  getUrgency,
} from '../../types/exam';
import { FONTS, LABEL } from '../../utils/typography';

interface ExamCountdownCardProps {
  exam: Exam;
  otherExams?: Exam[];
  onPress: () => void;
  onEdit: () => void;
  onOtherExamPress?: (exam: Exam) => void;
}

function formatExamDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function countdownLabel(daysLeft: number): { main: string; sub: string | null } {
  if (daysLeft === 0) return { main: 'TODAY', sub: null };
  if (daysLeft === 1) return { main: 'TOMORROW', sub: null };
  return { main: String(daysLeft), sub: 'days left' };
}

export function ExamCountdownCard({
  exam,
  otherExams = [],
  onPress,
  onEdit,
  onOtherExamPress,
}: ExamCountdownCardProps) {
  const { colors } = useTheme();
  const daysLeft = getDaysLeft(exam.date);
  const urgency = getUrgency(daysLeft);
  const config = URGENCY_CONFIG[urgency];
  const progress = Math.min(1, Math.max(0, 1 - daysLeft / 60));
  const countdown = countdownLabel(daysLeft);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(16)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const numberScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardTranslateY]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(numberScale, {
          toValue: 1.04,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(numberScale, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [numberScale]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View>
      <Pressable
        onPress={onPress}
        onLongPress={onEdit}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: config.bgColor,
              borderColor: `${config.color}4D`,
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }, { scale: pressScale }],
            },
          ]}
        >
          <View style={[styles.accentBar, { backgroundColor: config.color }]} />

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={onEdit}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.left}>
              <View style={[styles.typeBadge, { backgroundColor: `${config.color}26` }]}>
                <Text style={[styles.typeBadgeText, { color: config.color }]}>
                  {EXAM_TYPE_LABELS[exam.type]}
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                {exam.title}
              </Text>
              {exam.subject.trim().length > 0 && (
                <Text style={[styles.subject, { color: colors.textSecondary }]} numberOfLines={1}>
                  {exam.subject}
                </Text>
              )}
              <Text style={[styles.encouragement, { color: config.color }]}>
                {config.encouragement}
              </Text>
            </View>

            <Animated.View style={[styles.countdownWrap, { transform: [{ scale: numberScale }] }]}>
              <Text
                style={[
                  styles.countdownNumber,
                  {
                    color: config.color,
                    fontSize: countdown.sub ? 48 : 28,
                    lineHeight: countdown.sub ? 52 : 32,
                  },
                ]}
              >
                {countdown.main}
              </Text>
              {countdown.sub && (
                <Text style={[styles.countdownSub, { color: colors.textSecondary }]}>
                  {countdown.sub}
                </Text>
              )}
            </Animated.View>
          </View>

          <View style={[styles.divider, { backgroundColor: `${config.color}33` }]} />

          <View style={[styles.progressTrack, { backgroundColor: `${config.color}26` }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: config.color,
                  width: progressWidth,
                },
              ]}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {config.label}
            </Text>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {formatExamDate(exam.date)}
            </Text>
          </View>
        </Animated.View>
      </Pressable>

      {otherExams.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillContent}
        >
          {otherExams.map((other) => {
            const otherDays = getDaysLeft(other.date);
            const emoji = other.type === 'quiz' ? '📝' : '📚';
            return (
              <TouchableOpacity
                key={other.id}
                style={[styles.pill, { borderColor: `${other.color}55`, backgroundColor: `${other.color}18` }]}
                onPress={() => onOtherExamPress?.(other)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, { color: colors.text }]}>
                  {emoji} {EXAM_TYPE_LABELS[other.type]} · {otherDays} days
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  menuBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  left: {
    flex: 1,
    paddingRight: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    ...LABEL,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.headingBold,
    letterSpacing: -0.3,
    marginTop: 6,
  },
  subject: {
    fontSize: 13,
    marginTop: 2,
  },
  encouragement: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  countdownWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  countdownNumber: {
    fontWeight: '800',
    fontFamily: FONTS.headingBold,
    letterSpacing: -2,
    textAlign: 'center',
  },
  countdownSub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    marginVertical: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerText: {
    fontSize: 11,
  },
  pillScroll: {
    marginBottom: 8,
  },
  pillContent: {
    gap: 8,
    paddingRight: 4,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    ...LABEL,
  },
});
