import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Subject, UserGoals } from '../../types';
import { SUBJECT_COLORS } from '../../constants/milestones';
import { generateId } from '../../utils/helpers';
import { useTheme } from '../../theme/ThemeContext';
import { useUserProfileStore } from '../../stores/userProfileStore';
import { triggerReward } from '../../services/rewardsService';
import { WelcomeSlide } from './WelcomeSlide';
import { StudyInfoSlide } from './StudyInfoSlide';
import { SubjectsSlide } from './SubjectsSlide';
import { GoalsSlide } from './GoalsSlide';
import { PermissionsSlide } from './PermissionsSlide';

const TOTAL_STEPS = 5;

const defaultGoals: UserGoals = {
  targetGpa: 3.5,
  studyHoursPerDay: 2,
  bedtimeHour: 23,
};

export function OnboardingFlow() {
  const { colors } = useTheme();
  const completeOnboarding = useUserProfileStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [subjectCount, setSubjectCount] = useState(4);
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: generateId(), name: '', color: SUBJECT_COLORS[0] },
    { id: generateId(), name: '', color: SUBJECT_COLORS[1] },
    { id: generateId(), name: '', color: SUBJECT_COLORS[2] },
    { id: generateId(), name: '', color: SUBJECT_COLORS[3] },
  ]);
  const [goals, setGoals] = useState<UserGoals>(defaultGoals);

  const handleSubjectCountChange = (count: number) => {
    setSubjectCount(count);
    setSubjects((prev) => {
      if (prev.length < count) {
        const added = Array.from({ length: count - prev.length }, (_, i) => ({
          id: generateId(),
          name: '',
          color: SUBJECT_COLORS[(prev.length + i) % SUBJECT_COLORS.length],
        }));
        return [...prev, ...added];
      }
      return prev.slice(0, count);
    });
  };

  const handleFinish = () => {
    const validSubjects = subjects.filter((s) => s.name.trim());
    completeOnboarding({
      university,
      course,
      subjectCount: validSubjects.length,
      subjects: validSubjects,
      goals,
      displayName: displayName.trim() || 'Student',
      onboardingComplete: true,
    });
    triggerReward('gpa_goal_set');
  };

  if (step === 0) {
    return <WelcomeSlide onContinue={() => setStep(1)} currentPage={0} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.dots}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i <= step ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {step === 1 && (
          <StudyInfoSlide
            displayName={displayName}
            university={university}
            course={course}
            subjectCount={subjectCount}
            onDisplayNameChange={setDisplayName}
            onUniversityChange={setUniversity}
            onCourseChange={setCourse}
            onSubjectCountChange={handleSubjectCountChange}
            onContinue={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <SubjectsSlide
            subjects={subjects}
            maxSubjects={subjectCount}
            onSubjectsChange={setSubjects}
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <GoalsSlide
            goals={goals}
            onGoalsChange={setGoals}
            onContinue={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <PermissionsSlide onFinish={handleFinish} onBack={() => setStep(3)} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  content: { flex: 1 },
});
