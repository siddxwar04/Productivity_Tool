import { Article } from '../types/article';

function articleKey(article: Article): string {
  const normalizedUrl = article.url.trim().toLowerCase();
  if (normalizedUrl.length > 0) {
    return normalizedUrl;
  }
  return `${article.title.trim().toLowerCase()}::${article.category}`;
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

  return merged.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}
