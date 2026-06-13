import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { UserGoals } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/ui/Button';

interface Props {
  goals: UserGoals;
  onGoalsChange: (goals: UserGoals) => void;
  onContinue: () => void;
  onBack: () => void;
}

function formatBedtime(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}:00 ${period}`;
}

export function GoalsSlide({ goals, onGoalsChange, onContinue, onBack }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Set your goals</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        We'll use these to track progress and send smart reminders.
      </Text>

      <View style={[styles.sliderBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sliderHeader}>
          <Text style={[styles.sliderLabel, { color: colors.text }]}>Target GPA</Text>
          <Text style={[styles.sliderValue, { color: colors.primary }]}>{goals.targetGpa.toFixed(1)}</Text>
        </View>
        <Slider
          minimumValue={2.0}
          maximumValue={4.0}
          step={0.1}
          value={goals.targetGpa}
          onValueChange={(v) => onGoalsChange({ ...goals, targetGpa: v })}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>

      <View style={[styles.sliderBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sliderHeader}>
          <Text style={[styles.sliderLabel, { color: colors.text }]}>Study hours per day</Text>
          <Text style={[styles.sliderValue, { color: colors.primary }]}>{goals.studyHoursPerDay}h</Text>
        </View>
        <Slider
          minimumValue={0.5}
          maximumValue={8}
          step={0.5}
          value={goals.studyHoursPerDay}
          onValueChange={(v) => onGoalsChange({ ...goals, studyHoursPerDay: v })}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>

      <View style={[styles.sliderBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sliderHeader}>
          <Text style={[styles.sliderLabel, { color: colors.text }]}>Bedtime</Text>
          <Text style={[styles.sliderValue, { color: colors.primary }]}>{formatBedtime(goals.bedtimeHour)}</Text>
        </View>
        <Slider
          minimumValue={0}
          maximumValue={23}
          step={1}
          value={goals.bedtimeHour}
          onValueChange={(bedtimeHour) => onGoalsChange({ ...goals, bedtimeHour })}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>

      <View style={styles.actions}>
        <Button title="Back" onPress={onBack} variant="ghost" style={styles.half} />
        <Button title="Continue" onPress={onContinue} style={styles.half} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  sub: { fontSize: 15, marginBottom: 24, lineHeight: 22 },
  sliderBlock: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sliderLabel: { fontSize: 16, fontWeight: '600' },
  sliderValue: { fontSize: 16, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 'auto', paddingTop: 12 },
  half: { flex: 1 },
});
