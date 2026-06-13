import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { useStreakStore } from '../../stores/streakStore';
import { GoalsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GoalsStackParamList, 'Streaks'>;

export function StreaksScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const current = useStreakStore((s) => s.current);
  const longest = useStreakStore((s) => s.longest);
  const lastDate = useStreakStore((s) => s.lastCompletedDate);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Streaks" onBack={() => navigation.goBack()} />
      <View style={[styles.hero, { backgroundColor: `${colors.streak}20` }]}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={[styles.current, { color: colors.streak }]}>{current} days</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Current streak</Text>
      </View>
      <Card>
        <Text style={[styles.stat, { color: colors.text }]}>Longest streak: <Text style={{ color: colors.primary, fontWeight: '800' }}>{longest} days</Text></Text>
        <Text style={[styles.stat, { color: colors.textSecondary, marginTop: 8 }]}>Last study day: {lastDate || 'None yet'}</Text>
        <Text style={[styles.tip, { color: colors.textMuted, marginTop: 16 }]}>Complete a pomodoro or study session each day to keep your streak alive.</Text>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 20 },
  emoji: { fontSize: 48 },
  current: { fontSize: 48, fontWeight: '800', marginTop: 8 },
  label: { fontSize: 15, marginTop: 4 },
  stat: { fontSize: 16 },
  tip: { fontSize: 14, lineHeight: 20 },
});
