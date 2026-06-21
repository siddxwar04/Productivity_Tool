import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { HubGrid } from '../../components/ui/HubGrid';
import { WellnessStackParamList } from '../../navigation/types';
import { SCREEN_TITLE } from '../../utils/typography';

type Props = NativeStackScreenProps<WellnessStackParamList, 'WellnessHub'>;

export function WellnessHubScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const items = [
    { id: 'mood', title: 'Mood', subtitle: 'Daily check-in', icon: 'happy-outline' as const, color: '#EC4899', onPress: () => navigation.navigate('Mood') },
    { id: 'sleep', title: 'Sleep', subtitle: 'Track rest & recovery', icon: 'moon-outline' as const, color: '#6366F1', onPress: () => navigation.navigate('Sleep') },
    { id: 'breaks', title: 'Breaks', subtitle: 'Wellness break timer', icon: 'leaf-outline' as const, color: '#10B981', onPress: () => navigation.navigate('Breaks') },
    { id: 'yoga', title: 'Yoga & Meditation', subtitle: 'Guided videos for calm', icon: 'flower-outline' as const, color: '#14B8A6', onPress: () => navigation.navigate('Yoga') },
  ];

  return (
    <ScreenWrapper>
      <Text style={[styles.title, { color: colors.text }]}>Wellness</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>Health & balance</Text>
      <HubGrid items={items} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4, ...SCREEN_TITLE },
  sub: { fontSize: 15, marginBottom: 24 },
});
