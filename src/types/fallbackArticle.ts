import { Article, ArticleCategory } from './article';

export type FallbackArticleCategory = Exclude<ArticleCategory, 'all'>;

export interface FallbackArticle {
  id: string;
  title: string;
  shortDescription: string;
  category: FallbackArticleCategory;
  readTime: number;
  imageUrl: string;
  articleUrl: string;
  publishedDate: string;
}

export function fallbackToArticle(fallback: FallbackArticle): Article {
  return {
    id: fallback.id,
    title: fallback.title,
    description: fallback.shortDescription,
    url: fallback.articleUrl,
    imageUrl: fallback.imageUrl,
    publishedAt: fallback.publishedDate,
    source: `StudyFlow · ${fallback.readTime} min read`,
    category: fallback.category,
  };
}
