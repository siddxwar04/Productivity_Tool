import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { FlashcardGamification, FLASHCARD_BADGES } from '../../types/flashcard';

interface FlashcardGamificationHeaderProps {
  gamification: FlashcardGamification;
}

export function FlashcardGamificationHeader({ gamification }: FlashcardGamificationHeaderProps) {
  const { colors } = useTheme();
  const xpInLevel = gamification.xp % 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.row}>
        <StatChip icon="flash-outline" label="Level" value={String(gamification.level)} color={colors.xp} textColor={colors.text} />
        <StatChip icon="star" label="XP" value={String(gamification.xp)} color={colors.warning} textColor={colors.text} />
        <StatChip icon="flame" label="Streak" value={`${gamification.dailyStreak}d`} color={colors.streak} textColor={colors.text} />
      </View>

      <View style={[styles.xpTrack, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={[styles.xpFill, { width: `${xpInLevel}%`, backgroundColor: colors.xp }]} />
      </View>
      <Text style={[styles.xpHint, { color: colors.textMuted }]}>{100 - xpInLevel} XP to next level</Text>

      <View style={styles.badges}>
        {FLASHCARD_BADGES.slice(0, 4).map((badge) => {
          const unlocked = gamification.unlockedBadges.includes(badge.id);
          return (
            <View
              key={badge.id}
              style={[
                styles.badge,
                {
                  backgroundColor: unlocked ? `${colors.primary}22` : colors.surfaceSecondary,
                  borderColor: unlocked ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.badgeIcon, { opacity: unlocked ? 1 : 0.35 }]}>{badge.icon}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatChip({
  icon,
  label,
  value,
  color,
  textColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  textColor: string;
}) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.chipLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.chipValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  chip: { alignItems: 'center', flex: 1, gap: 2 },
  chipLabel: { fontSize: 11, fontWeight: '600' },
  chipValue: { fontSize: 18, fontWeight: '800' },
  xpTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  xpFill: { height: 6, borderRadius: 3 },
  xpHint: { fontSize: 11, textAlign: 'center' },
  badges: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 },
  badge: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeIcon: { fontSize: 16 },
});
