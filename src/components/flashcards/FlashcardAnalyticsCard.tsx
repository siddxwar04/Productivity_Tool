import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { FlashcardSessionStats } from '../../types/flashcard';
import { formatStudyDuration } from '../../services/flashcards/flashcardStats';

interface FlashcardAnalyticsCardProps {
  stats: FlashcardSessionStats;
  title?: string;
}

export function FlashcardAnalyticsCard({ stats, title = 'Session stats' }: FlashcardAnalyticsCardProps) {
  const { colors } = useTheme();

  const items = [
    { label: 'Accuracy', value: `${stats.accuracyPercent}%` },
    { label: 'Reviewed', value: String(stats.cardsReviewed) },
    { label: 'Study time', value: formatStudyDuration(stats.studyTimeMs) },
    { label: 'Mastery', value: `${stats.masteryScore}%` },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={[styles.cell, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.value, { color: colors.primary }]}>{item.value}</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 14 },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '47%', borderRadius: 10, padding: 12 },
  value: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 11, marginTop: 4, fontWeight: '600' },
});
