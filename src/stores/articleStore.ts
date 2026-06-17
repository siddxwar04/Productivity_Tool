import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article, ArticleCategory } from '../types/article';
import { FALLBACK_ARTICLES_AS_ARTICLES } from '../data/fallbackArticles';
import { mergeArticles } from '../services/articleMergeService';
import { fetchAllArticles } from '../services/rssService';

const CACHE_DURATION_MS = 30 * 60 * 1000;
const MIN_REFRESH_GAP_MS = 5000;

interface ArticleState {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  selectedCategory: ArticleCategory;
  fetchArticles: () => Promise<void>;
  refreshArticles: () => Promise<void>;
  setCategory: (category: ArticleCategory) => void;
  resetArticles: () => void;
}

function resolveArticles(remote: Article[]): Article[] {
  return mergeArticles(remote, FALLBACK_ARTICLES_AS_ARTICLES);
}

let inFlightFetch: Promise<void> | null = null;

export const useArticleStore = create<ArticleState>()(
  persist(
    (set, get) => ({
      articles: FALLBACK_ARTICLES_AS_ARTICLES,
      isLoading: false,
      error: null,
      lastFetched: null,
      selectedCategory: 'all',

      fetchArticles: async () => {
        const { lastFetched, isLoading, articles } = get();
        const now = Date.now();

        if (isLoading && inFlightFetch) {
          return inFlightFetch;
        }

        if (lastFetched && now - lastFetched < CACHE_DURATION_MS) {
          return;
        }

        if (inFlightFetch) {
          return inFlightFetch;
        }

        set({ isLoading: true, error: null });

        inFlightFetch = (async () => {
          try {
            const remote = await fetchAllArticles();
            const merged = resolveArticles(remote);
            set({
              articles: merged,
              isLoading: false,
              lastFetched: Date.now(),
              error: null,
            });
          } catch (e) {
            const merged = resolveArticles([]);
            set({
              articles: merged.length > 0 ? merged : articles,
              isLoading: false,
              error:
                merged.length === 0
                  ? (e instanceof Error ? e.message : 'Failed to fetch')
                  : null,
            });
          } finally {
            inFlightFetch = null;
          }
        })();

        return inFlightFetch;
      },

      refreshArticles: async () => {
        const { lastFetched } = get();
        const now = Date.now();
        if (lastFetched && now - lastFetched < MIN_REFRESH_GAP_MS) {
          return;
        }
        set({ lastFetched: null });
        await get().fetchArticles();
      },

      setCategory: (category) => set({ selectedCategory: category }),

      resetArticles: () =>
        set({
          articles: FALLBACK_ARTICLES_AS_ARTICLES,
          isLoading: false,
          error: null,
          lastFetched: null,
          selectedCategory: 'all',
        }),
    }),
    {
      name: 'article-store',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const stored = persisted as { articles?: Article[]; lastFetched?: number | null } | undefined;
        return {
          ...current,
          articles: resolveArticles(stored?.articles ?? []),
          lastFetched: stored?.lastFetched ?? null,
        };
      },
      partialize: (state) => ({
        articles: state.articles,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);
