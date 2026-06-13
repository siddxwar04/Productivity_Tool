import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { usePlannerStore } from '../../stores/plannerStore';
import { SUBJECT_COLORS } from '../../constants/milestones';
import { StudyStackParamList } from '../../navigation/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = NativeStackScreenProps<StudyStackParamList, 'Planner'>;

export function PlannerScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const allBlocks = usePlannerStore((s) => s.blocks);
  const blocks = useMemo(
    () =>
      allBlocks
        .filter((b) => b.dayOfWeek === selectedDay)
        .sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute)),
    [allBlocks, selectedDay],
  );
  const addBlock = usePlannerStore((s) => s.addBlock);
  const deleteBlock = usePlannerStore((s) => s.deleteBlock);
  const [title, setTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const add = () => {
    if (!title.trim()) return;
    addBlock({
      title: title.trim(),
      dayOfWeek: selectedDay,
      startHour: 9,
      startMinute: 0,
      durationMinutes: 60,
      color: SUBJECT_COLORS[blocks.length % SUBJECT_COLORS.length],
    });
    setTitle('');
    setShowAdd(false);
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Weekly planner" onBack={() => navigation.goBack()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.days}>
        {DAYS.map((d, i) => (
          <TouchableOpacity
            key={d}
            onPress={() => setSelectedDay(i)}
            style={[styles.dayChip, { backgroundColor: selectedDay === i ? colors.primary : colors.surfaceSecondary }]}
          >
            <Text style={{ color: selectedDay === i ? '#FFF' : colors.text, fontWeight: '600' }}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {blocks.map((b) => (
        <View key={b.id} style={[styles.block, { backgroundColor: colors.surface, borderLeftColor: b.color }]}>
          <View style={styles.blockInfo}>
            <Text style={[styles.blockTitle, { color: colors.text }]}>{b.title}</Text>
            <Text style={[styles.blockTime, { color: colors.textSecondary }]}>
              {b.startHour}:{String(b.startMinute).padStart(2, '0')} · {b.durationMinutes}min
            </Text>
          </View>
          <TouchableOpacity onPress={() => deleteBlock(b.id)}>
            <Text style={{ color: colors.error }}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      {showAdd ? (
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text }]}
            placeholder="Block title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.addActions}>
            <Button title="Add" onPress={add} style={{ flex: 1 }} />
            <Button title="Cancel" onPress={() => setShowAdd(false)} variant="ghost" style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <Button title="+ Add study block" onPress={() => setShowAdd(true)} variant="secondary" />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  days: { marginBottom: 20 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  block: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderLeftWidth: 4, marginBottom: 10 },
  blockInfo: { flex: 1 },
  blockTitle: { fontSize: 16, fontWeight: '600' },
  blockTime: { fontSize: 13, marginTop: 2 },
  addForm: { marginTop: 16, gap: 12 },
  input: { borderRadius: 10, padding: 14, fontSize: 16 },
  addActions: { flexDirection: 'row', gap: 8 },
});
