import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useDeadlinesStore } from '../../stores/deadlinesStore';
import { formatCountdown } from '../../utils/helpers';
import { StudyStackParamList } from '../../navigation/types';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<StudyStackParamList, 'Deadlines'>;

const PRIORITY_CONFIG = {
  high: { color: '#EF4444', label: 'HIGH', bg: '#EF444418' },
  medium: { color: '#F59E0B', label: 'MED', bg: '#F59E0B18' },
  low: { color: '#10B981', label: 'LOW', bg: '#10B98118' },
} as const;

function DeadlineRow({
  deadline,
  onToggle,
  onDelete,
}: {
  deadline: { id: string; title: string; dueAt: string; priority: 'high' | 'medium' | 'low'; completed: boolean };
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = PRIORITY_CONFIG[deadline.priority];

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start(onToggle);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.row,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: deadline.completed ? 0.55 : 1,
          },
        ]}
        onPress={handlePress}
        onLongPress={onDelete}
        activeOpacity={1}
      >
        <Ionicons
          name={deadline.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={deadline.completed ? colors.success : colors.textMuted}
        />
        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                textDecorationLine: deadline.completed ? 'line-through' : 'none',
              },
            ]}
          >
            {deadline.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.due, { color: colors.textSecondary }]}>
              {formatCountdown(deadline.dueAt)}
            </Text>
          </View>
        </View>
        <View style={[styles.priorityTag, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.priorityText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function DeadlinesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const deadlines = useDeadlinesStore((s) => s.deadlines);
  const toggleComplete = useDeadlinesStore((s) => s.toggleComplete);
  const deleteDeadline = useDeadlinesStore((s) => s.deleteDeadline);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('active');

  const filtered = useMemo(
    () =>
      deadlines
        .filter((d) =>
          filter === 'all' ? true : filter === 'active' ? !d.completed : d.completed,
        )
        .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
    [deadlines, filter],
  );

  const handleToggleComplete = (id: string) => {
    const deadline = deadlines.find((d) => d.id === id);
    if (deadline && !deadline.completed) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    toggleComplete(id);
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Deadlines" onBack={() => navigation.goBack()} />

      <Button
        title="+ Add assignment"
        onPress={() => navigation.navigate('AddTask')}
        style={styles.addBtn}
      />

      <View style={styles.filters}>
        {(['active', 'done', 'all'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.chip,
              {
                backgroundColor: filter === f ? colors.primary : colors.surfaceSecondary,
                borderColor: filter === f ? colors.primary : colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: filter === f ? '#FFF' : colors.text },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="checkmark-done-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {filter === 'done' ? 'Nothing completed yet' : 'All clear!'}
          </Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            {filter === 'active' ? 'No pending assignments.' : 'Nothing here yet.'}
          </Text>
        </View>
      ) : (
        filtered.map((d) => (
          <DeadlineRow
            key={d.id}
            deadline={d}
            onToggle={() => handleToggleComplete(d.id)}
            onDelete={() => deleteDeadline(d.id)}
          />
        ))
      )}

      {deadlines.length > 0 && (
        <View style={styles.deleteHint}>
          <Ionicons name="hand-left-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.deleteHintText, { color: colors.textMuted }]}>Hold to delete</Text>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  addBtn: { marginBottom: 16 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  due: { fontSize: 13 },
  priorityTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priorityText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { fontSize: 14 },
  deleteHint: { flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center', marginTop: 8 },
  deleteHintText: { fontSize: 11 },
});
