import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useRewardsStore } from '../../stores/rewardsStore';
import { MILESTONES } from '../../constants/milestones';
import { GoalsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GoalsStackParamList, 'Milestones'>;

export function MilestonesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const unlockedMilestoneIds = useRewardsStore((s) => s.unlockedMilestoneIds);
  const milestones = useMemo(
    () =>
      MILESTONES.map((m) => ({
        ...m,
        unlockedAt: unlockedMilestoneIds.includes(m.id) ? 'unlocked' : undefined,
      })),
    [unlockedMilestoneIds],
  );

  return (
    <ScreenWrapper>
      <ScreenHeader title="Milestones" onBack={() => navigation.goBack()} />
      {milestones.map((m) => {
        const unlocked = !!m.unlockedAt;
        return (
          <View key={m.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, opacity: unlocked ? 1 : 0.5 }]}>
            <Text style={styles.icon}>{unlocked ? m.icon : '🔒'}</Text>
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]}>{m.title}</Text>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>{m.description}</Text>
            </View>
            <Text style={[styles.xp, { color: colors.primary }]}>+{m.xpReward} XP</Text>
          </View>
        );
      })}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 12 },
  icon: { fontSize: 28 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13, marginTop: 2 },
  xp: { fontSize: 13, fontWeight: '700' },
});
