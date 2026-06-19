import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Subject } from '../../types';
import { SUBJECT_COLORS } from '../../constants/milestones';
import { generateId } from '../../utils/helpers';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/ui/Button';

interface Props {
  subjects: Subject[];
  maxSubjects: number;
  onSubjectsChange: (subjects: Subject[]) => void;
  onContinue: () => void;
  onBack: () => void;
  onSkipSubjects: () => void;
}

export function SubjectsSlide({ subjects, maxSubjects, onSubjectsChange, onContinue, onBack, onSkipSubjects }: Props) {
  const { colors } = useTheme();

  const addSubject = () => {
    if (subjects.length >= 8) return;
    const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
    onSubjectsChange([...subjects, { id: generateId(), name: '', color }]);
  };

  const updateSubject = (id: string, patch: Partial<Subject>) => {
    onSubjectsChange(subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSubject = (id: string) => {
    onSubjectsChange(subjects.filter((s) => s.id !== id));
  };

  const validCount = subjects.filter((s) => s.name.trim()).length;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Add your subjects</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Add up to {maxSubjects} subjects with a colour for each.
      </Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {subjects.map((subject, index) => (
          <View key={subject.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={`Subject ${index + 1}`}
              placeholderTextColor={colors.textMuted}
              value={subject.name}
              onChangeText={(name) => updateSubject(subject.id, { name })}
            />
            <View style={styles.colors}>
              {SUBJECT_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => updateSubject(subject.id, { color: c })}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    subject.color === c && styles.colorSelected,
                  ]}
                />
              ))}
            </View>
            {subjects.length > 1 && (
              <TouchableOpacity onPress={() => removeSubject(subject.id)}>
                <Text style={{ color: colors.error, fontSize: 13 }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {subjects.length < 8 && (
          <TouchableOpacity onPress={addSubject} style={[styles.addBtn, { borderColor: colors.primary }]}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>+ Add subject</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Button title="Back" onPress={onBack} variant="ghost" style={styles.half} />
        <Button title="Continue" onPress={onContinue} style={styles.half} disabled={validCount === 0} />
      </View>

      <TouchableOpacity onPress={onSkipSubjects} style={styles.skipBtn} activeOpacity={0.7}>
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Add later</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  sub: { fontSize: 15, marginBottom: 16 },
  list: { flex: 1 },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  input: { fontSize: 16, fontWeight: '500', marginBottom: 10 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  colorDot: { width: 24, height: 24, borderRadius: 12 },
  colorSelected: { borderWidth: 2, borderColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  addBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actions: { flexDirection: 'row', gap: 12, paddingTop: 12 },
  half: { flex: 1 },
  skipBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  skipText: { fontSize: 14, fontWeight: '500' },
});
