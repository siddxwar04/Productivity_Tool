import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { MoodEntry } from '../../types';
import { MOOD_EMOJI } from '../../stores/moodStore';
import { formatMoodRelativeDate } from '../../utils/moodHelpers';

interface MoodHistoryRowProps {
  entry: MoodEntry;
  showDivider?: boolean;
}

function MoodHistoryRowComponent({ entry, showDivider = true }: MoodHistoryRowProps) {
  const { colors } = useTheme();
  const note = entry.note?.trim();

  return (
    <>
      <View style={styles.row}>
        <Text style={styles.emoji}>{MOOD_EMOJI[entry.mood - 1]}</Text>
        <View style={styles.content}>
          <Text style={[styles.date, { color: colors.text }]}>
            {formatMoodRelativeDate(entry.date)}
          </Text>
          {note ? (
            <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
              {note}
            </Text>
          ) : null}
        </View>
      </View>
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      ) : null}
    </>
  );
}

export const MoodHistoryRow = memo(MoodHistoryRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  emoji: {
    fontSize: 32,
    width: 44,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
