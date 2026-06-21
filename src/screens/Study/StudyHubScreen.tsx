import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { HubGrid } from '../../components/ui/HubGrid';
import { StudyStackParamList } from '../../navigation/types';
import { SCREEN_TITLE } from '../../utils/typography';

type Props = NativeStackScreenProps<StudyStackParamList, 'StudyHub'>;

export function StudyHubScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const items = [
    { id: 'pomodoro', title: 'Pomodoro', subtitle: 'Focus timer & sessions', icon: 'timer-outline' as const, color: '#6366F1', onPress: () => navigation.navigate('Pomodoro') },
    { id: 'planner', title: 'Planner', subtitle: 'Weekly timetable', icon: 'calendar-outline' as const, color: '#3B82F6', onPress: () => navigation.navigate('Planner') },
    { id: 'deadlines', title: 'Deadlines', subtitle: 'Assignments & due dates', icon: 'alarm-outline' as const, color: '#EF4444', onPress: () => navigation.navigate('Deadlines') },
    { id: 'notes', title: 'Notes', subtitle: 'Study notes library', icon: 'document-text-outline' as const, color: '#14B8A6', onPress: () => navigation.navigate('Notes') },
    { id: 'flashcards', title: 'Flashcards', subtitle: 'Spaced repetition', icon: 'layers-outline' as const, color: '#EC4899', onPress: () => navigation.navigate('Flashcards') },
    { id: 'grades', title: 'Grades', subtitle: 'GPA tracking', icon: 'school-outline' as const, color: '#F59E0B', onPress: () => navigation.navigate('Grades') },
    { id: 'resources', title: 'Resources', subtitle: 'PDFs, links & files', icon: 'folder-outline' as const, color: '#10B981', onPress: () => navigation.navigate('Resources') },
    { id: 'schedule', title: 'Smart schedule', subtitle: 'AI-optimised plan', icon: 'sparkles-outline' as const, color: '#8B5CF6', onPress: () => navigation.navigate('SmartSchedule') },
    { id: 'buddy', title: 'Study buddy', subtitle: 'Adaptive quizzes', icon: 'bulb-outline' as const, color: '#F97316', onPress: () => navigation.navigate('StudyBuddy') },
    { id: 'articles', title: 'Articles', subtitle: 'Latest study reads', icon: 'newspaper-outline' as const, color: '#0EA5E9', onPress: () => navigation.navigate('Articles') },
  ];

  return (
    <ScreenWrapper>
      <Text style={[styles.title, { color: colors.text }]}>Study</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>Time management & academics</Text>
      <HubGrid items={items} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4, ...SCREEN_TITLE },
  sub: { fontSize: 15, marginBottom: 24 },
});
