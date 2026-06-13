import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { HubGrid } from '../../components/ui/HubGrid';
import { GoalsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GoalsStackParamList, 'GoalsHub'>;

export function GoalsHubScreen({ navigation }: Props) {
  const { colors } = useTheme();

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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  sub: { fontSize: 15, marginBottom: 24 },
});
