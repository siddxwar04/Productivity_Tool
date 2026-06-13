export function isValidArticleUrl(url: string | null | undefined): boolean {
  if (!url || !url.trim()) {
    return false;
  }

  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeArticleUrl(url: string): string {
  return url.trim();
}
