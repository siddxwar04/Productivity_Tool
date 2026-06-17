import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useRewardsStore } from '../../stores/rewardsStore';
import { MILESTONES } from '../../constants/milestones';
import { GoalsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GoalsStackParamList, 'Milestones'>;

function MilestoneRow({
  milestone,
  unlocked,
  index,
}: {
  milestone: { id: string; icon: string; title: string; description: string; xpReward: number };
  unlocked: boolean;
  index: number;
}) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
      }}
    >
      <View
        style={[
          styles.row,
          {
            backgroundColor: colors.surface,
            borderColor: unlocked ? `${colors.primary}40` : colors.border,
            opacity: unlocked ? 1 : 0.5,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: unlocked ? `${colors.primary}15` : colors.surfaceSecondary },
          ]}
        >
          <Text style={styles.icon}>{unlocked ? milestone.icon : '🔒'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{milestone.title}</Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>{milestone.description}</Text>
        </View>
        <View
          style={[
            styles.xpChip,
            { backgroundColor: unlocked ? `${colors.primary}15` : colors.surfaceSecondary },
          ]}
        >
          <Text style={[styles.xpText, { color: unlocked ? colors.primary : colors.textMuted }]}>
            +{milestone.xpReward}
          </Text>
          <Text style={[styles.xpLabel, { color: unlocked ? colors.primary : colors.textMuted }]}>XP</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export function MilestonesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const unlockedMilestoneIds = useRewardsStore((s) => s.unlockedMilestoneIds);

  const milestones = useMemo(
    () =>
      MILESTONES.map((m) => ({
        ...m,
        unlocked: unlockedMilestoneIds.includes(m.id),
      })),
    [unlockedMilestoneIds],
  );

  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  return (
    <ScreenWrapper>
      <ScreenHeader title="Milestones" onBack={() => navigation.goBack()} />

      <View style={[styles.progressChip, { backgroundColor: `${colors.primary}15` }]}>
        <Text style={[styles.progressText, { color: colors.primary }]}>
          {unlockedCount} / {milestones.length} unlocked
        </Text>
      </View>

      {milestones.map((m, i) => (
        <MilestoneRow key={m.id} milestone={m} unlocked={m.unlocked} index={i} />
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  progressChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  progressText: { fontSize: 13, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  desc: { fontSize: 13, lineHeight: 18 },
  xpChip: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 44,
  },
  xpText: { fontSize: 15, fontWeight: '800', lineHeight: 18 },
  xpLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
});
