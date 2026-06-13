import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Article } from '../../types/article';

interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function ArticleCardComponent({ article, onPress }: ArticleCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress(article)}
      activeOpacity={0.85}
    >
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="newspaper-outline" size={28} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={[styles.source, { color: colors.primary }]} numberOfLines={1}>
            {article.source}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>{timeAgo(article.publishedAt)}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
          {article.title}
        </Text>
        {!!article.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {article.description}
          </Text>
        )}
        <View style={styles.readRow}>
          <Text style={[styles.readText, { color: colors.primary }]}>Read article</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const ArticleCard = memo(ArticleCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 140 },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  source: { flex: 1, fontSize: 12, fontWeight: '700' },
  time: { fontSize: 12 },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  description: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  readRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  readText: { fontSize: 13, fontWeight: '600' },
});
