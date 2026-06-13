import { Article } from '../types/article';

export function getArticleKey(article: Article): string {
  const normalizedUrl = article.url.trim().toLowerCase();
  if (normalizedUrl.length > 0) {
    return normalizedUrl;
  }
  return `${article.title.trim().toLowerCase()}::${article.category}`;
}

function articleKey(article: Article): string {
  return getArticleKey(article);
}

/** RSS feeds sometimes emit duplicate ids; FlatList keys must stay unique. */
export function ensureUniqueArticleIds(articles: Article[]): Article[] {
  const seenIds = new Set<string>();

  return articles.map((article, index) => {
    const baseId = article.id?.trim() || getArticleKey(article) || `article-${index}`;
    let id = baseId;
    let suffix = 1;

    while (seenIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    seenIds.add(id);
    return id === article.id ? article : { ...article, id };
  });
}

/** Merge remote RSS articles with local fallbacks. Remote wins on duplicates. */
export function mergeArticles(remote: Article[], fallback: Article[]): Article[] {
  const seen = new Set<string>();
  const merged: Article[] = [];

  for (const article of remote) {
    const key = articleKey(article);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(article);
  }

  for (const article of fallback) {
    const key = articleKey(article);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(article);
  }

  return ensureUniqueArticleIds(
    merged.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    ),
  );
}
