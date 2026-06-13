import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { generateSmartSchedule } from '../../services/smartScheduleService';
import { usePlannerStore } from '../../stores/plannerStore';
import { SUBJECT_COLORS } from '../../constants/milestones';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'SmartSchedule'>;

export function SmartScheduleScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const suggestions = useMemo(() => generateSmartSchedule(), []);
  const addBlock = usePlannerStore((s) => s.addBlock);
  const today = new Date().getDay();

  const applyAll = () => {
    suggestions.forEach((s, i) => {
      addBlock({
        title: s.title,
        dayOfWeek: today,
        startHour: s.startHour,
        startMinute: 0,
        durationMinutes: s.durationMinutes,
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
      });
    });
    navigation.navigate('Planner');
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Smart schedule" onBack={() => navigation.goBack()} />
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        AI-optimised timetable based on your deadlines and daily study goal.
      </Text>
      {suggestions.map((s) => (
        <View key={s.id} style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.time, { color: colors.primary }]}>{s.startHour}:00 · {s.durationMinutes}min</Text>
          <Text style={[styles.title, { color: colors.text }]}>{s.title}</Text>
          <Text style={[styles.reason, { color: colors.textSecondary }]}>{s.reason}</Text>
        </View>
      ))}
      <Button title="Apply to today's planner" onPress={applyAll} style={styles.apply} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 14, marginBottom: 20, lineHeight: 20 },
  block: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  time: { fontSize: 13, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '700', marginTop: 4 },
  reason: { fontSize: 13, marginTop: 6 },
  apply: { marginTop: 8 },
});
