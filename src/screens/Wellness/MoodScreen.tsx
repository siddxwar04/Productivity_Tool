import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, WellnessStackParamList } from '../../navigation/types';
import { SECTION_HEADING } from '../../utils/typography';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { MOOD_EMOJI, useMoodStore } from '../../stores/moodStore';
import { MoodEntry } from '../../types';
import { formatDate } from '../../utils/helpers';
import {
  MOOD_LABELS,
  MOOD_RING_COLORS,
  MOOD_ACCENT_COLORS,
  MoodLevel,
} from '../../utils/moodHelpers';
import { MoodHistoryRow } from '../../components/mood/MoodHistoryRow';
import { MoodTrendChart } from '../../components/mood/MoodTrendChart';

type Props =
  | NativeStackScreenProps<WellnessStackParamList, 'Mood'>
  | NativeStackScreenProps<RootStackParamList, 'LogMood'>;

const NOTE_MAX = 200;
const MOOD_LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];

interface MoodOptionProps {
  level: MoodLevel;
  selected: boolean;
  onSelect: (level: MoodLevel) => void;
}

function MoodOption({ level, selected, onSelect }: MoodOptionProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.1 : 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [scale, selected]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelect(level);
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress} style={styles.moodOptionWrap}>
      <Animated.View
        style={[
          styles.moodOption,
          {
            transform: [{ scale }],
            opacity: selected ? 1 : 0.55,
            backgroundColor: selected ? MOOD_RING_COLORS[level] : colors.surfaceSecondary,
            borderColor: selected ? MOOD_ACCENT_COLORS[level] : colors.border,
          },
        ]}
      >
        <Text style={styles.moodEmoji}>{MOOD_EMOJI[level - 1]}</Text>
        <Text
          style={[
            styles.moodLabel,
            { color: selected ? MOOD_ACCENT_COLORS[level] : colors.textSecondary },
          ]}
        >
          {MOOD_LABELS[level]}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function LogMoodScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const logMood = useMoodStore((s) => s.logMood);
  const entries = useMoodStore((s) => s.entries);
  const getLast7Days = useMoodStore((s) => s.getLast7Days);

  const [selected, setSelected] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState('');
  const [noteFocused, setNoteFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveScale = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  const recent = useMemo(
    () =>
      [...entries]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8),
    [entries],
  );

  const trendDays = useMemo(() => getLast7Days(), [entries, getLast7Days]);
  const hasHistory = recent.length > 0;

  const save = () => {
    if (!selected || saving) return;

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Animated.sequence([
      Animated.spring(saveScale, { toValue: 0.96, useNativeDriver: true, friction: 8 }),
      Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();

    Animated.timing(checkOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setSaved(true);
    logMood(selected, note.trim() || undefined);

    setTimeout(() => {
      navigation.goBack();
    }, 650);
  };

  return (
    <ScreenWrapper scroll={false} edges={['top', 'left', 'right']} style={{ padding: 0 }}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader
            title="Log mood"
            subtitle={formatDate()}
            onBack={() => navigation.goBack()}
          />

          <Text style={[styles.question, { color: colors.text }]}>How are you feeling?</Text>

          <View style={styles.moodRow}>
            {MOOD_LEVELS.map((level) => (
              <MoodOption
                key={level}
                level={level}
                selected={selected === level}
                onSelect={setSelected}
              />
            ))}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.text }]}>Anything on your mind?</Text>
          <View
            style={[
              styles.noteWrap,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: noteFocused ? colors.primary : colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.noteInput, { color: colors.text }]}
              placeholder="Optional note…"
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={(t) => setNote(t.slice(0, NOTE_MAX))}
              onFocus={() => setNoteFocused(true)}
              onBlur={() => setNoteFocused(false)}
              multiline
              maxLength={NOTE_MAX}
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>
              {note.length}/{NOTE_MAX}
            </Text>
          </View>

          <Animated.View style={{ transform: [{ scale: saveScale }] }}>
            <TouchableOpacity
              onPress={save}
              disabled={!selected || saving}
              activeOpacity={0.85}
              style={[
                styles.saveBtn,
                {
                  backgroundColor: !selected || saving ? colors.locked : colors.primary,
                  shadowColor: colors.primary,
                  shadowOpacity: !selected || saving ? 0 : 0.35,
                  elevation: !selected || saving ? 0 : 6,
                },
              ]}
            >
              {saved ? (
                <Animated.View style={{ opacity: checkOpacity, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                  <Text style={styles.saveText}>Saved!</Text>
                </Animated.View>
              ) : (
                <Text style={styles.saveText}>Save mood</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent check-ins</Text>

            {hasHistory ? (
              <>
                <Card style={styles.historyCard}>
                  {recent.map((entry: MoodEntry, index) => (
                    <MoodHistoryRow
                      key={entry.id}
                      entry={entry}
                      showDivider={index < recent.length - 1}
                    />
                  ))}
                </Card>

                <Text style={[styles.sectionTitle, styles.trendTitle, { color: colors.text }]}>
                  Weekly mood trend
                </Text>
                <Card style={styles.trendCard}>
                  <MoodTrendChart days={trendDays} />
                </Card>
              </>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🌱</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No check-ins yet
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Log your first mood above to start tracking how you feel.
                </Text>
              </Card>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 24,
  },
  moodOptionWrap: {
    flex: 1,
  },
  moodOption: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  moodEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  noteWrap: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  noteInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 56,
    textAlignVertical: 'top',
    padding: 0,
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 8,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historySection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    ...SECTION_HEADING,
  },
  trendTitle: {
    marginTop: 24,
  },
  historyCard: {
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  trendCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
});
