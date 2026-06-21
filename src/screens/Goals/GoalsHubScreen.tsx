import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { HubGrid } from '../../components/ui/HubGrid';
import { ExamCountdownCard } from '../../components/ui/ExamCountdownCard';
import { GoalsStackParamList, MainTabParamList } from '../../navigation/types';
import { useExamStore } from '../../stores/examStore';
import { SCREEN_TITLE, SECTION_HEADING } from '../../utils/typography';

type GoalsHubNav = CompositeNavigationProp<
  NativeStackNavigationProp<GoalsStackParamList, 'GoalsHub'>,
  BottomTabNavigationProp<MainTabParamList>
>;

export function GoalsHubScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<GoalsHubNav>();
  const getNextExam = useExamStore((s) => s.getNextExam);
  const exams = useExamStore((s) => s.exams);

  const nextExam = getNextExam();
  const otherExams = nextExam ? exams.filter((e) => e.id !== nextExam.id) : [];

  const openExamSetup = (examId?: string) => {
    navigation.navigate('Study', {
      screen: 'ExamSetup',
      params: examId ? { examId } : undefined,
    });
  };

  const items = [
    { id: 'habits', title: 'Habits', subtitle: 'Daily routines', icon: 'checkmark-circle-outline' as const, color: '#6366F1', onPress: () => navigation.navigate('Habits') },
    { id: 'streaks', title: 'Streaks', subtitle: 'Keep the flame alive', icon: 'flame-outline' as const, color: '#F97316', onPress: () => navigation.navigate('Streaks') },
    { id: 'milestones', title: 'Milestones', subtitle: 'Achievements & badges', icon: 'trophy-outline' as const, color: '#F59E0B', onPress: () => navigation.navigate('Milestones') },
    { id: 'analytics', title: 'Analytics', subtitle: 'Study hours & trends', icon: 'bar-chart-outline' as const, color: '#14B8A6', onPress: () => navigation.navigate('Analytics') },
  ];

  return (
    <ScreenWrapper>
      <Text style={[styles.title, { color: colors.text }]}>Goals</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>Habits, streaks & progress</Text>
      <HubGrid items={items} />

      <View style={styles.examSectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Exam Countdown</Text>
        <TouchableOpacity onPress={() => openExamSetup()} activeOpacity={0.7}>
          <Text style={[styles.addExamBtn, { color: colors.primary }]}>+ Add exam</Text>
        </TouchableOpacity>
      </View>

      {nextExam ? (
        <ExamCountdownCard
          exam={nextExam}
          otherExams={otherExams}
          onPress={() => openExamSetup(nextExam.id)}
          onEdit={() => openExamSetup(nextExam.id)}
          onOtherExamPress={(exam) => openExamSetup(exam.id)}
        />
      ) : (
        <TouchableOpacity
          style={[styles.examEmpty, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => openExamSetup()}
          activeOpacity={0.7}
        >
          <Text style={[styles.examEmptyTitle, { color: colors.text }]}>No exams scheduled</Text>
          <Text style={[styles.examEmptySub, { color: colors.textSecondary }]}>
            Tap to add your first exam countdown
          </Text>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4, ...SCREEN_TITLE },
  sub: { fontSize: 15, marginBottom: 24 },
  examSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', ...SECTION_HEADING },
  addExamBtn: { fontSize: 14, fontWeight: '600' },
  examEmpty: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  examEmptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  examEmptySub: { fontSize: 14, textAlign: 'center' },
});
