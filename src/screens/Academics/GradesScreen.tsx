import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useGradesStore } from '../../stores/gradesStore';
import { useUserProfileStore } from '../../stores/userProfileStore';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Grades'>;

export function GradesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const grades = useGradesStore((s) => s.grades);
  const addGrade = useGradesStore((s) => s.addGrade);
  const getOverallGpa = useGradesStore((s) => s.getOverallGpa);
  const subjects = useUserProfileStore((s) => s.subjects);
  const targetGpa = useUserProfileStore((s) => s.goals.targetGpa);
  const [assignment, setAssignment] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [showAdd, setShowAdd] = useState(false);

  const gpa = getOverallGpa();

  const save = () => {
    const s = parseFloat(score);
    const m = parseFloat(maxScore);
    if (!assignment.trim() || isNaN(s) || isNaN(m) || m <= 0) return;
    addGrade({
      assignment: assignment.trim(),
      score: s,
      maxScore: m,
      subjectId: subjects[0]?.id ?? 'general',
      date: new Date().toISOString(),
    });
    setAssignment('');
    setScore('');
    setShowAdd(false);
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Grades" onBack={() => navigation.goBack()} />
      <View style={[styles.gpaCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.gpaLabel}>Current GPA</Text>
        <Text style={styles.gpaValue}>{gpa > 0 ? gpa.toFixed(2) : '—'}</Text>
        <Text style={styles.gpaTarget}>Target: {targetGpa.toFixed(1)}</Text>
      </View>
      {grades.map((g) => (
        <View key={g.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.name, { color: colors.text }]}>{g.assignment}</Text>
          <Text style={[styles.score, { color: colors.primary }]}>{g.score}/{g.maxScore}</Text>
        </View>
      ))}
      {showAdd ? (
        <View style={styles.form}>
          <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]} placeholder="Assignment" placeholderTextColor={colors.textMuted} value={assignment} onChangeText={setAssignment} />
          <View style={styles.scoreRow}>
            <TextInput style={[styles.input, styles.half, { color: colors.text, backgroundColor: colors.surfaceSecondary }]} placeholder="Score" placeholderTextColor={colors.textMuted} value={score} onChangeText={setScore} keyboardType="decimal-pad" />
            <TextInput style={[styles.input, styles.half, { color: colors.text, backgroundColor: colors.surfaceSecondary }]} placeholder="Max" placeholderTextColor={colors.textMuted} value={maxScore} onChangeText={setMaxScore} keyboardType="decimal-pad" />
          </View>
          <Button title="Save grade" onPress={save} />
        </View>
      ) : (
        <Button title="+ Add grade" onPress={() => setShowAdd(true)} variant="secondary" />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  gpaCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20 },
  gpaLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  gpaValue: { color: '#FFF', fontSize: 48, fontWeight: '800' },
  gpaTarget: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  name: { fontSize: 15, fontWeight: '600' },
  score: { fontSize: 15, fontWeight: '700' },
  form: { gap: 10, marginTop: 12 },
  input: { borderRadius: 10, padding: 12, fontSize: 15 },
  scoreRow: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
});
