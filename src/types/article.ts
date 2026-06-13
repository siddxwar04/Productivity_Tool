export type ArticleCategory =
  | 'all'
  | 'studytips'
  | 'productivity'
  | 'examprep'
  | 'timemanagement'
  | 'wellness'
  | 'notetaking';

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  all: 'All',
  studytips: 'Study tips',
  productivity: 'Productivity',
  examprep: 'Exam preparation',
  timemanagement: 'Time management',
  wellness: 'Student wellness',
  notetaking: 'Note taking',
};

export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  source: string;
  category: ArticleCategory;
}

export interface FeedSource {
  name: string;
  url: string;
  category: ArticleCategory;
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  'all',
  'studytips',
  'productivity',
  'examprep',
  'timemanagement',
  'wellness',
  'notetaking',
];
