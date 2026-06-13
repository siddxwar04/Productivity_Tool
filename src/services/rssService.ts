import { Platform } from 'react-native';
import { XMLParser } from 'fast-xml-parser';
import { Article, ArticleCategory, FeedSource } from '../types/article';

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
});

export const FEED_SOURCES: FeedSource[] = [
  { name: 'Cal Newport', url: 'https://calnewport.com/blog/feed/', category: 'studytips' },
  { name: 'Oxford Learning', url: 'https://www.oxfordlearning.com/feed/', category: 'studytips' },
  { name: 'Exam Study Expert', url: 'https://www.examstudyexpert.com/feed/', category: 'studytips' },

  { name: 'Lifehack', url: 'https://lifehack.org/feed', category: 'productivity' },
  { name: 'James Clear', url: 'https://jamesclear.com/feed', category: 'productivity' },
  { name: 'Zapier Blog', url: 'https://zapier.com/blog/feed/', category: 'productivity' },

  { name: 'MIT News', url: 'https://news.mit.edu/rss/feed', category: 'examprep' },
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'examprep' },
  { name: 'Khan Academy Blog', url: 'https://blog.khanacademy.org/feed/', category: 'examprep' },

  { name: 'Farnam Street', url: 'https://fs.blog/feed/', category: 'timemanagement' },
  { name: 'Asian Efficiency', url: 'https://www.asianefficiency.com/feed/', category: 'timemanagement' },
  { name: 'Ness Labs', url: 'https://nesslabs.com/feed', category: 'timemanagement' },

  { name: 'Psyche Magazine', url: 'https://psyche.co/feed', category: 'wellness' },
  { name: 'Mindful', url: 'https://www.mindful.org/feed/', category: 'wellness' },
  { name: 'Psychology Today', url: 'https://www.psychologytoday.com/intl/node/feed/rss.xml', category: 'wellness' },

  { name: 'Aeon', url: 'https://aeon.co/feed.rss', category: 'notetaking' },
  { name: 'Hacker News Best', url: 'https://hnrss.org/best', category: 'notetaking' },
  { name: 'Todoist Blog', url: 'https://todoist.com/inspiration/feed', category: 'notetaking' },
];

interface RawRssItem {
  guid?: string | { '#text'?: string };
  id?: string;
  link?: string | { '@_href'?: string; '#text'?: string };
  title?: string | { '#text'?: string };
  description?: string;
  summary?: string;
  'content:encoded'?: string;
  pubDate?: string;
  published?: string;
  updated?: string;
  'media:content'?: { '@_url'?: string };
  enclosure?: { '@_url'?: string };
  'media:thumbnail'?: { '@_url'?: string };
}

const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim().slice(0, 220);

const readText = (value: string | { '#text'?: string } | undefined): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value['#text'] ?? '';
};

const readLink = (value: RawRssItem['link']): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value['@_href'] ?? value['#text'] ?? '';
};

const readGuid = (value: RawRssItem['guid'] | RawRssItem['id']): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  return (value['#text'] ?? '').trim();
};

const buildArticleId = (item: RawRssItem, source: FeedSource, index: number): string => {
  const guid = readGuid(item.guid) || readGuid(item.id);
  const link = readLink(item.link);
  if (guid) return guid;
  if (link) return link;
  return `${source.name}-${index}`;
};

const fetchXml = async (url: string): Promise<string> => {
  if (Platform.OS !== 'web') {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'StudyFlow/1.0 RSS Reader' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return res.text();
  }

  // Web: try each proxy in order until one works
  let lastError: Error = new Error('All proxies failed');

  for (const buildUrl of CORS_PROXIES) {
    try {
      const res = await fetch(buildUrl(url), { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;

      const text = await res.text();

      // allorigins wraps in JSON { contents: "..." }
      // corsproxy and codetabs return raw XML directly
      try {
        const json = JSON.parse(text) as { contents?: string };
        if (json?.contents) return json.contents;
      } catch {
        // not JSON — it's raw XML, return as-is
      }

      if (text.includes('<rss') || text.includes('<feed')) return text;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      continue;
    }
  }

  throw lastError;
};

const parseItems = (xml: string, source: FeedSource): Article[] => {
  const parsed = parser.parse(xml) as {
    rss?: { channel?: { item?: RawRssItem | RawRssItem[] } };
    feed?: { entry?: RawRssItem | RawRssItem[]; item?: RawRssItem | RawRssItem[] };
  };

  const channel = parsed?.rss?.channel ?? parsed?.feed;
  if (!channel) return [];

  const feedChannel = channel as { item?: RawRssItem | RawRssItem[]; entry?: RawRssItem | RawRssItem[] };

  const rawItems: RawRssItem[] = Array.isArray(feedChannel.item)
    ? feedChannel.item
    : feedChannel.item
      ? [feedChannel.item]
      : Array.isArray(feedChannel.entry)
        ? feedChannel.entry
        : feedChannel.entry
          ? [feedChannel.entry]
          : [];

  return rawItems.map((item, index) => ({
    id: buildArticleId(item, source, index),
    title: readText(item.title).trim(),
    description: stripHtml(String(item.description ?? item.summary ?? item['content:encoded'] ?? '')),
    url: readLink(item.link),
    imageUrl:
      item?.['media:content']?.['@_url'] ??
      item?.enclosure?.['@_url'] ??
      item?.['media:thumbnail']?.['@_url'] ??
      null,
    publishedAt: new Date(item.pubDate ?? item.published ?? item.updated ?? Date.now()).toISOString(),
    source: source.name,
    category: source.category as Exclude<ArticleCategory, 'all'>,
  }));
};

export const fetchAllArticles = async (): Promise<Article[]> => {
  const results = await Promise.allSettled(
    FEED_SOURCES.map(async (source) => {
      const xml = await fetchXml(source.url);
      return parseItems(xml, source);
    }),
  );

  const all = results
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((a) => a.title && a.url);

  const seen = new Set<string>();
  return all
    .filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};
