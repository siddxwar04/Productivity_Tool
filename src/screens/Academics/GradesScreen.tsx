import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useGradesStore } from '../../stores/gradesStore';
import { useUserProfileStore } from '../../stores/userProfileStore';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Grades'>;

function getScoreColor(pct: number): string {
  if (pct >= 90) return '#10B981';
  if (pct >= 75) return '#6366F1';
  if (pct >= 60) return '#F59E0B';
  return '#EF4444';
}

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
  const [focused, setFocused] = useState<string | null>(null);

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

      <LinearGradient
        colors={['#7C3AED', '#6366F1']}
        style={styles.gpaHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.gpaInner}>
          <View style={styles.gpaLeft}>
            <Text style={styles.gpaLabel}>Current CGPA</Text>
            <Text style={styles.gpaValue}>{gpa > 0 ? gpa.toFixed(2) : '—'}</Text>
          </View>
          <View style={[styles.gpaTarget, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name="flag-outline" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.gpaTargetText}>Goal: {targetGpa.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.gpaIconWrap}>
          <Ionicons name="school" size={48} color="rgba(255,255,255,0.12)" />
        </View>
      </LinearGradient>

      {grades.length === 0 && !showAdd && (
        <View style={styles.empty}>
          <Ionicons name="ribbon-outline" size={40} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No grades logged yet</Text>
        </View>
      )}

      {grades.map((g) => {
        const pct = Math.round((g.score / g.maxScore) * 100);
        const scoreColor = getScoreColor(pct);
        return (
          <View key={g.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.rowAccent, { backgroundColor: scoreColor }]} />
            <View style={styles.rowContent}>
              <Text style={[styles.assignName, { color: colors.text }]} numberOfLines={1}>
                {g.assignment}
              </Text>
              <Text style={[styles.scoreDetail, { color: colors.textSecondary }]}>
                {g.score} / {g.maxScore}
              </Text>
            </View>
            <View style={[styles.pctBadge, { backgroundColor: `${scoreColor}18` }]}>
              <Text style={[styles.pctText, { color: scoreColor }]}>{pct}%</Text>
            </View>
          </View>
        );
      })}

      {showAdd ? (
        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.formHeader}>
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={[styles.formTitle, { color: colors.text }]}>Add grade</Text>
          </View>
          {(['assignment', 'score', 'max'] as const).map((field) => (
            <View
              key={field}
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: focused === field ? colors.primary : colors.border,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={field === 'assignment' ? 'Assignment name' : field === 'score' ? 'Score' : 'Max score'}
                placeholderTextColor={colors.textMuted}
                value={field === 'assignment' ? assignment : field === 'score' ? score : maxScore}
                onChangeText={field === 'assignment' ? setAssignment : field === 'score' ? setScore : setMaxScore}
                keyboardType={field !== 'assignment' ? 'decimal-pad' : 'default'}
                onFocus={() => setFocused(field)}
                onBlur={() => setFocused(null)}
              />
            </View>
          ))}
          <View style={styles.formActions}>
            <TouchableOpacity
              onPress={() => setShowAdd(false)}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={save}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.saveBtnText}>Save grade</Text>
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
          <Text style={[styles.addText, { color: colors.primary }]}>Add grade</Text>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  gpaHero: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  gpaInner: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  gpaLeft: {},
  gpaLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  gpaValue: { color: '#FFF', fontSize: 52, fontWeight: '800', lineHeight: 56 },
  gpaTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  gpaTargetText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  gpaIconWrap: {
    position: 'absolute',
    right: 20,
    bottom: 10,
  },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  rowAccent: { width: 4, alignSelf: 'stretch' },
  rowContent: { flex: 1, padding: 14 },
  assignName: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  scoreDetail: { fontSize: 13 },
  pctBadge: {
    marginRight: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pctText: { fontSize: 14, fontWeight: '800' },
  form: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  formTitle: { fontSize: 15, fontWeight: '700' },
  inputWrap: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { fontSize: 15 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
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
