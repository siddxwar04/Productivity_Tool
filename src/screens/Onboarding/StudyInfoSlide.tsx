import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  onSkipUniversity: () => void;
}

export function StudyInfoSlide({
  displayName, university, course, subjectCount,
  onDisplayNameChange, onUniversityChange, onCourseChange, onSubjectCountChange,
  onContinue, onBack, onSkipUniversity,
}: Props) {
  const { colors } = useTheme();
  const [nameError, setNameError] = useState(false);

  const handleSkip = () => {
    if (!displayName.trim()) {
      setNameError(true);
      return;
    }
    onSkipUniversity();
  };

  const handleNameChange = (v: string) => {
    onDisplayNameChange(v);
    if (nameError && v.trim()) {
      setNameError(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>What are you studying?</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        We'll personalize your dashboard around your academic journey.
      </Text>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Your name</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: nameError ? '#EF4444' : colors.border,
            color: colors.text,
          },
        ]}
        placeholder="e.g. Siddesh"
        placeholderTextColor={colors.textMuted}
        value={displayName}
        onChangeText={handleNameChange}
        autoCapitalize="words"
      />
      {nameError && (
        <Text style={styles.nameError}>Please enter your name to continue</Text>
      )}

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
        {[3, 4, 5, 6, 7, 8].map((n) => {
          const selected = subjectCount === n;
          return (
            <TouchableOpacity
              key={n}
              onPress={() => onSubjectCountChange(n)}
              activeOpacity={0.7}
              style={[
                styles.countChip,
                selected
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.countChipText,
                  { color: selected ? '#FFFFFF' : colors.text },
                ]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.actions}>
          <Button title="Back" onPress={onBack} variant="ghost" style={styles.backBtn} />
          <Button
            title="Continue"
            onPress={onContinue}
            style={styles.continueBtn}
            disabled={!displayName.trim()}
          />
        </View>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipBtn}
          activeOpacity={0.6}
        >
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Skip for now — I'll add these details later
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
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
  nameError: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  countRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  countChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
  },
  countChipText: { fontSize: 15, fontWeight: '600' },
  bottomArea: { marginTop: 'auto', paddingTop: 24 },
  actions: { flexDirection: 'row', gap: 12 },
  backBtn: { width: '30%' },
  continueBtn: { flex: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  dividerLine: { flex: 1, height: 0.5 },
  dividerText: { fontSize: 12 },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  skipText: { fontSize: 15, fontWeight: '500' },
});
