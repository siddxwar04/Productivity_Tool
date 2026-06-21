import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useExamStore } from '../stores/examStore';
import { ExamType } from '../types/exam';
import { requestNotificationPermission } from '../services/notificationService';
import { StudyStackParamList } from '../navigation/types';
import { FONTS, HEADING, LABEL } from '../utils/typography';

type Props = NativeStackScreenProps<StudyStackParamList, 'ExamSetup'>;

const EXAM_COLORS = ['#6EE7B7', '#60A5FA', '#A78BFA', '#FCD34D', '#FB923C', '#F472B6'] as const;

const TYPE_OPTIONS: { key: ExamType; label: string }[] = [
  { key: 'endterm', label: 'End Term' },
  { key: 'midterm', label: 'Mid Term' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'custom', label: 'Other' },
];

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function TypeChip({
  label,
  selected,
  onPress,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, friction: 8 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start(onPress);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.typeChip,
          selected
            ? { backgroundColor: colors.primary, borderColor: colors.primary }
            : { backgroundColor: 'transparent', borderColor: colors.border },
        ]}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.typeChipText,
            { color: selected ? '#FFFFFF' : colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ColorDot({
  color,
  selected,
  onPress,
}: {
  color: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(selected ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.2 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [selected, scale]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.colorOuter,
          selected && { borderColor: color, borderWidth: 2, padding: 3 },
        ]}
      >
        <Animated.View
          style={[
            styles.colorInner,
            { backgroundColor: color, transform: [{ scale }] },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export function ExamSetupScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const examId = route.params?.examId;
  const exams = useExamStore((s) => s.exams);
  const addExam = useExamStore((s) => s.addExam);
  const updateExam = useExamStore((s) => s.updateExam);

  const existing = useMemo(
    () => (examId ? exams.find((e) => e.id === examId) : undefined),
    [examId, exams],
  );

  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [subject, setSubject] = useState(existing?.subject ?? '');
  const [examType, setExamType] = useState<ExamType>(existing?.type ?? 'endterm');
  const [examDate, setExamDate] = useState(
    existing ? new Date(existing.date) : tomorrow,
  );
  const [accentColor, setAccentColor] = useState(existing?.color ?? EXAM_COLORS[0]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    existing?.notificationsEnabled ?? true,
  );
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    const picked = new Date(examDate);
    picked.setHours(0, 0, 0, 0);
    const min = new Date(tomorrow);
    min.setHours(0, 0, 0, 0);
    return picked.getTime() >= min.getTime();
  }, [title, examDate, tomorrow]);

  const inputStyle = (field: string) => [
    styles.input,
    {
      backgroundColor: colors.surfaceSecondary,
      color: colors.text,
      borderColor: focusedField === field ? colors.primary : colors.border,
      borderWidth: focusedField === field ? 1.5 : 1,
    },
  ];

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      await requestNotificationPermission();
    }
  };

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);

    const payload = {
      title: title.trim(),
      subject: subject.trim(),
      type: examType,
      date: examDate.toISOString(),
      color: accentColor,
      notificationsEnabled,
    };

    try {
      if (existing) {
        await updateExam(existing.id, payload);
        Alert.alert('Updated', 'Exam updated! We\'ll keep you on track 🎯');
      } else {
        await addExam(payload);
        Alert.alert('Exam added!', 'Exam added! We\'ll keep you on track 🎯');
      }
      navigation.goBack();
    } catch {
      Alert.alert(
        'Couldn\'t save',
        'Something went wrong saving your exam. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Set exam date"
        onBack={() => navigation.goBack()}
      />
      <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
        We'll remind you at the right time, not stress you out
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>What's it called?</Text>
        <TextInput
          style={inputStyle('title')}
          placeholder="e.g. Computer Networks Final"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          onFocus={() => setFocusedField('title')}
          onBlur={() => setFocusedField(null)}
        />

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Subject</Text>
        <TextInput
          style={inputStyle('subject')}
          placeholder="e.g. Computer Science"
          placeholderTextColor={colors.textMuted}
          value={subject}
          onChangeText={setSubject}
          onFocus={() => setFocusedField('subject')}
          onBlur={() => setFocusedField(null)}
        />

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Type</Text>
        <View style={styles.typeRow}>
          {TYPE_OPTIONS.map((option) => (
            <TypeChip
              key={option.key}
              label={option.label}
              selected={examType === option.key}
              onPress={() => setExamType(option.key)}
              colors={colors}
            />
          ))}
        </View>

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Exam date</Text>
        <TouchableOpacity
          style={[styles.dateRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDisplayDate(examDate)}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={examDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={tomorrow}
            onChange={(_, selected) => {
              if (Platform.OS === 'android') setShowDatePicker(false);
              if (selected) setExamDate(selected);
            }}
          />
        )}

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
          Pick a color for this exam
        </Text>
        <View style={styles.colorRow}>
          {EXAM_COLORS.map((color) => (
            <ColorDot
              key={color}
              color={color}
              selected={accentColor === color}
              onPress={() => setAccentColor(color)}
            />
          ))}
        </View>

        <View style={[styles.toggleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>Smart reminders</Text>
            <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
              We'll remind you at 30, 15, 7, 3, 1 days and on exam day — always encouraging, never alarming
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: colors.primary,
              opacity: canSave && !saving ? 1 : 0.5,
            },
          ]}
          onPress={handleSave}
          disabled={!canSave || saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Set exam date →</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerSub: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: -12,
    marginBottom: 8,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    ...LABEL,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    ...LABEL,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  colorOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    ...HEADING,
  },
  toggleSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  saveBtn: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.headingBold,
  },
});
