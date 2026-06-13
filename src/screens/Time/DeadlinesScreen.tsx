import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useDeadlinesStore } from '../../stores/deadlinesStore';
import { formatCountdown } from '../../utils/helpers';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Deadlines'>;

const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

export function DeadlinesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const deadlines = useDeadlinesStore((s) => s.deadlines);
  const toggleComplete = useDeadlinesStore((s) => s.toggleComplete);
  const deleteDeadline = useDeadlinesStore((s) => s.deleteDeadline);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('active');

  const filtered = useMemo(
    () =>
      deadlines
        .filter((d) => filter === 'all' || (filter === 'active' ? !d.completed : d.completed))
        .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
    [deadlines, filter],
  );

  return (
    <ScreenWrapper>
      <ScreenHeader title="Deadlines" onBack={() => navigation.goBack()} />
      <Button title="+ Add assignment" onPress={() => navigation.navigate('AddTask')} style={styles.addBtn} />
      <View style={styles.filters}>
        {(['active', 'done', 'all'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, { backgroundColor: filter === f ? colors.primary : colors.surfaceSecondary }]}
          >
            <Text style={{ color: filter === f ? '#FFF' : colors.text, fontWeight: '600', textTransform: 'capitalize' }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {filtered.map((d) => (
        <TouchableOpacity
          key={d.id}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, opacity: d.completed ? 0.6 : 1 }]}
          onPress={() => toggleComplete(d.id)}
          onLongPress={() => deleteDeadline(d.id)}
        >
          <View style={[styles.dot, { backgroundColor: PRIORITY_COLOR[d.priority] }]} />
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.text, textDecorationLine: d.completed ? 'line-through' : 'none' }]}>{d.title}</Text>
            <Text style={[styles.due, { color: colors.textSecondary }]}>{formatCountdown(d.dueAt)}</Text>
          </View>
          <Ionicons name={d.completed ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={d.completed ? colors.success : colors.textMuted} />
        </TouchableOpacity>
      ))}
      {filtered.length === 0 && (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>No assignments yet</Text>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  addBtn: { marginBottom: 16 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  due: { fontSize: 13, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40 },
});
