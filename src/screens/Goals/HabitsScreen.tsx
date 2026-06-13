import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { HabitRing } from '../../components/ui/HabitRing';
import { useHabitsStore } from '../../stores/habitsStore';
import { SUBJECT_COLORS } from '../../constants/milestones';
import { GoalsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GoalsStackParamList, 'Habits'>;

export function HabitsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const habits = useHabitsStore((s) => s.habits);
  const toggleHabitProgress = useHabitsStore((s) => s.toggleHabitProgress);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);
  const [name, setName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const create = () => {
    if (!name.trim()) return;
    addHabit({ name: name.trim(), targetPerDay: 1, color: SUBJECT_COLORS[habits.length % SUBJECT_COLORS.length] });
    setName('');
    setShowAdd(false);
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Habits" onBack={() => navigation.goBack()} />
      <View style={styles.rings}>
        {habits.map((h) => (
          <TouchableOpacity key={h.id} onPress={() => toggleHabitProgress(h.id)} onLongPress={() => deleteHabit(h.id)}>
            <HabitRing name={h.name} progress={h.completedToday / h.targetPerDay} color={h.color} />
          </TouchableOpacity>
        ))}
      </View>
      {habits.map((h) => (
        <View key={h.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.name, { color: colors.text }]}>{h.name}</Text>
          <Text style={[styles.streak, { color: colors.streak }]}>🔥 {h.streak}d streak</Text>
          <Text style={{ color: colors.textSecondary }}>{h.completedToday}/{h.targetPerDay}</Text>
        </View>
      ))}
      {showAdd ? (
        <View style={styles.form}>
          <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]} placeholder="Habit name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
          <Button title="Add habit" onPress={create} />
        </View>
      ) : (
        <Button title="+ Add habit" onPress={() => setShowAdd(true)} variant="secondary" />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  rings: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8, gap: 8 },
  name: { flex: 1, fontSize: 16, fontWeight: '600' },
  streak: { fontSize: 13, fontWeight: '600' },
  form: { gap: 10, marginTop: 12 },
  input: { borderRadius: 10, padding: 12, fontSize: 15 },
});
