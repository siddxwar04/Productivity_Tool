import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/ui/Button';

interface Props {
  displayName: string;
  university: string;
  course: string;
  subjectCount: number;
  onDisplayNameChange: (v: string) => void;
  onUniversityChange: (v: string) => void;
  onCourseChange: (v: string) => void;
  onSubjectCountChange: (v: number) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function StudyInfoSlide({
  displayName, university, course, subjectCount,
  onDisplayNameChange, onUniversityChange, onCourseChange, onSubjectCountChange,
  onContinue, onBack,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>What are you studying?</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        We'll personalize your dashboard around your academic journey.
      </Text>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Your name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="e.g. Siddesh"
        placeholderTextColor={colors.textMuted}
        value={displayName}
        onChangeText={onDisplayNameChange}
        autoCapitalize="words"
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>University / School</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="e.g. Presidency University"
        placeholderTextColor={colors.textMuted}
        value={university}
        onChangeText={onUniversityChange}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Course / Program</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="e.g. Computer Science and Engineering"
        placeholderTextColor={colors.textMuted}
        value={course}
        onChangeText={onCourseChange}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Number of subjects</Text>
      <View style={styles.countRow}>
        {[3, 4, 5, 6, 7, 8].map((n) => (
          <Text
            key={n}
            onPress={() => onSubjectCountChange(n)}
            style={[
              styles.countChip,
              {
                backgroundColor: subjectCount === n ? colors.primary : colors.surfaceSecondary,
                color: subjectCount === n ? colors.surface : colors.text,
              },
            ]}
          >
            {n}
          </Text>
        ))}
      </View>

      <View style={styles.actions}>
        <Button title="Back" onPress={onBack} variant="ghost" style={styles.half} />
        <Button
          title="Continue"
          onPress={onContinue}
          style={styles.half}
          disabled={!displayName.trim() || !course.trim()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  sub: { fontSize: 15, marginBottom: 28, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  countRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  countChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: '600',
    overflow: 'hidden',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 'auto', paddingTop: 24 },
  half: { flex: 1 },
});
