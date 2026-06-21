import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { HabitRing } from '../../components/ui/HabitRing';
import { useHabitsStore } from '../../stores/habitsStore';
import { SUBJECT_COLORS } from '../../constants/milestones';
import { GoalsStackParamList } from '../../navigation/types';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<GoalsStackParamList, 'Habits'>;

function HabitRow({
  habit,
  onToggle,
  onDelete,
}: {
  habit: { id: string; name: string; completedToday: number; targetPerDay: number; streak: number; color: string };
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const done = habit.completedToday >= habit.targetPerDay;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 8 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start(onToggle);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.surface, borderColor: done ? `${habit.color}50` : colors.border }]}
        onPress={handlePress}
        onLongPress={onDelete}
        activeOpacity={1}
      >
        <View style={[styles.checkCircle, { borderColor: done ? habit.color : colors.border, backgroundColor: done ? `${habit.color}20` : 'transparent' }]}>
          {done && <Ionicons name="checkmark" size={16} color={habit.color} />}
        </View>
        <Text style={[styles.habitName, { color: colors.text, textDecorationLine: done ? 'line-through' : 'none' }]}>
          {habit.name}
        </Text>
        <View style={styles.rightSide}>
          <View style={[styles.progressBadge, { backgroundColor: done ? `${habit.color}18` : colors.surfaceSecondary }]}>
            <Text style={[styles.progressText, { color: done ? habit.color : colors.textSecondary }]}>
              {habit.completedToday}/{habit.targetPerDay}
            </Text>
          </View>
          {habit.streak > 0 && (
            <View style={styles.streakChip}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={[styles.streakNum, { color: colors.streak }]}>{habit.streak}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function HabitsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const habits = useHabitsStore((s) => s.habits);
  const toggleHabitProgress = useHabitsStore((s) => s.toggleHabitProgress);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);
  const [name, setName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [focused, setFocused] = useState(false);

  const create = () => {
    if (!name.trim()) return;
    addHabit({
      name: name.trim(),
      targetPerDay: 1,
      color: SUBJECT_COLORS[habits.length % SUBJECT_COLORS.length],
    });
    setName('');
    setShowAdd(false);
  };

  const handleHabitToggle = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    const willComplete = habit != null
      && habit.completedToday < habit.targetPerDay
      && habit.completedToday + 1 >= habit.targetPerDay;
    toggleHabitProgress(id);
    if (willComplete) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Habits" onBack={() => navigation.goBack()} />

      {habits.length > 0 && (
        <View style={styles.rings}>
          {habits.map((h) => (
            <TouchableOpacity key={h.id} onPress={() => handleHabitToggle(h.id)} activeOpacity={0.8}>
              <HabitRing
                name={h.name}
                progress={h.completedToday / h.targetPerDay}
                color={h.color}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {habits.length === 0 && !showAdd && (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="checkmark-circle-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No habits yet</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Build daily routines to stay consistent and grow your streak.
          </Text>
        </View>
      )}

      {habits.map((h) => (
        <HabitRow
          key={h.id}
          habit={h}
          onToggle={() => handleHabitToggle(h.id)}
          onDelete={() => deleteHabit(h.id)}
        />
      ))}

      {habits.length > 0 && (
        <View style={styles.deleteHint}>
          <Ionicons name="hand-left-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.deleteHintText, { color: colors.textMuted }]}>Hold a habit to delete it</Text>
        </View>
      )}

      {showAdd ? (
        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View
            style={[styles.inputWrap, { backgroundColor: colors.surfaceSecondary, borderColor: focused ? colors.primary : colors.border }]}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Habit name (e.g. Read 20 pages)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
            />
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity
              onPress={() => { setShowAdd(false); setName(''); }}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={create}
              style={[styles.createBtn, { backgroundColor: colors.primary, opacity: name.trim() ? 1 : 0.45 }]}
            >
              <Text style={styles.createText}>Add habit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          activeOpacity={0.8}
          style={[styles.addBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.addText, { color: colors.primary }]}>Add habit</Text>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  rings: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: { flex: 1, fontSize: 16, fontWeight: '600' },
  rightSide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  progressText: { fontSize: 12, fontWeight: '700' },
  streakChip: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  streakEmoji: { fontSize: 12 },
  streakNum: { fontSize: 12, fontWeight: '700' },
  deleteHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center',
    marginBottom: 16,
  },
  deleteHintText: { fontSize: 11 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },
  form: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 15 },
  formActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600' },
  createBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  createText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  addText: { fontSize: 15, fontWeight: '600' },
});
