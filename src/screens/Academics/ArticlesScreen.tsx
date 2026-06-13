import React, { useCallback, useEffect, useMemo, useRef, memo } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, ScrollView,
  ActivityIndicator, RefreshControl, StyleSheet, Animated, Alert, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ArticleCard } from '../../components/ui/ArticleCard';
import { useArticleStore } from '../../stores/articleStore';
import { getArticleKey } from '../../services/articleMergeService';
import { ARTICLE_CATEGORIES, Article, ArticleCategory } from '../../types/article';
import { isValidArticleUrl } from '../../utils/articleUrl';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Articles'>;

const CATEGORY_CONFIG: Record<ArticleCategory, { emoji: string; color: string; labelColor: string; label: string }> = {
  all:            { emoji: '✦',  color: '#1e1a2e', labelColor: '#a78bfa', label: 'All'        },
  studytips:      { emoji: '📖', color: '#1a2640', labelColor: '#60a5fa', label: 'Study tips'  },
  productivity:   { emoji: '⚡', color: '#1a2a1a', labelColor: '#4ade80', label: 'Productivity'},
  examprep:       { emoji: '🎯', color: '#2a1e10', labelColor: '#fb923c', label: 'Exam prep'   },
  timemanagement: { emoji: '⏱', color: '#1e2a2a', labelColor: '#2dd4bf', label: 'Time mgmt'   },
  wellness:       { emoji: '🧘', color: '#2a1a2a', labelColor: '#e879f9', label: 'Wellness'    },
  notetaking:     { emoji: '📝', color: '#1a2020', labelColor: '#34d399', label: 'Note taking' },
};

const CategoryCard = memo(({ cat, isActive, onPress }: { cat: ArticleCategory; isActive: boolean; onPress: () => void }) => {
  const config = CATEGORY_CONFIG[cat];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.categoryChip}>
      <Animated.View style={{
        width: 56, height: 56, borderRadius: 18,
        backgroundColor: config.color,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2,
        borderColor: isActive ? 'rgba(255,255,255,0.4)' : 'transparent',
        transform: [{ scale: scaleAnim }],
      }}>
        <Text style={{ fontSize: 22 }}>{config.emoji}</Text>
      </Animated.View>
      <Text style={{
        fontSize: 10, fontWeight: '600',
        color: config.labelColor,
        opacity: isActive ? 1 : 0.5,
        textAlign: 'center', maxWidth: 60,
      }}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
});

CategoryCard.displayName = 'CategoryCard';

export function ArticlesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const articles = useArticleStore((s) => s.articles);
  const isLoading = useArticleStore((s) => s.isLoading);
  const error = useArticleStore((s) => s.error);
  const selectedCategory = useArticleStore((s) => s.selectedCategory);
  const refreshArticles = useArticleStore((s) => s.refreshArticles);
  const setCategory = useArticleStore((s) => s.setCategory);

  const filteredArticles = useMemo(() => {
    const scoped = selectedCategory === 'all'
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

    const seen = new Set<string>();
    return scoped.filter((article) => {
      const key = getArticleKey(article);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [articles, selectedCategory]);

  useEffect(() => {
    void useArticleStore.getState().fetchArticles();
  }, []);

  const openArticle = useCallback((article: Article) => {
    if (!isValidArticleUrl(article.url)) {
      Alert.alert(
        'Link unavailable',
        'This article link is missing or invalid. Try another article or pull to refresh.',
      );
      return;
    }

    navigation.navigate('ArticleViewer', { url: article.url.trim(), title: article.title });
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    void refreshArticles();
  }, [refreshArticles]);

  const handleCategoryPress = useCallback((cat: ArticleCategory) => {
    setCategory(cat);
  }, [setCategory]);

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <View style={styles.listItem}>
        <ArticleCard article={item} onPress={openArticle} />
      </View>
    ),
    [openArticle],
  );

  const keyExtractor = useCallback(
    (item: Article) => `${item.id}-${getArticleKey(item)}`,
    [],
  );

  const showLoading = isLoading && filteredArticles.length === 0;
  const showError = error && filteredArticles.length === 0;

  const listHeader = useMemo(
    () => (
      <>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Articles" onBack={() => navigation.goBack()} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          nestedScrollEnabled
        >
          {ARTICLE_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat}
              cat={cat}
              isActive={selectedCategory === cat}
              onPress={() => handleCategoryPress(cat)}
            />
          ))}
        </ScrollView>

        {showLoading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading articles…</Text>
          </View>
        ) : showError ? (
          <View style={styles.stateWrap}>
            <Text style={[styles.error, { color: colors.textSecondary }]}>{error}</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={[styles.retry, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.retryText, { color: colors.surface }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </>
    ),
    [
      navigation,
      selectedCategory,
      handleCategoryPress,
      showLoading,
      showError,
      colors,
      error,
      handleRefresh,
    ],
  );

  const listEmpty = useMemo(() => {
    if (showLoading || showError) return null;
    return (
      <Text style={[styles.empty, { color: colors.textSecondary }]}>
        No articles in this category. Pull to refresh.
      </Text>
    );
  }, [showLoading, showError, colors.textSecondary]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={showLoading || showError ? [] : filteredArticles}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== 'web'}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  headerWrap: { paddingHorizontal: 20, paddingTop: 60 },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    alignItems: 'center',
    gap: 6,
    marginRight: 10,
  },
  listItem: {
    paddingHorizontal: 20,
  },
  stateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 40,
  },
  loadingText: { marginTop: 12, fontSize: 14 },
  error: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retry: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryText: { fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 24, paddingHorizontal: 20 },
});
