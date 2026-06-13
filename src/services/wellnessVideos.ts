export type WellnessVideoCategory = 'Yoga' | 'Meditation' | 'Breathing';

export interface WellnessVideo {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  category: WellnessVideoCategory;
  duration: string;
}

export const WELLNESS_VIDEO_CATEGORIES: WellnessVideoCategory[] = [
  'Yoga',
  'Meditation',
  'Breathing',
];

/**
 * Curated, free, publicly-embeddable YouTube yoga & meditation videos.
 * Played in-app via the YouTube embed URL inside a WebView (no API key/quota).
 * IDs reference well-known, high-view-count uploads from popular wellness channels.
 */
export const WELLNESS_VIDEOS: WellnessVideo[] = [
  {
    id: 'yoga-beginners',
    videoId: 'v7AYKMP6rOE',
    title: 'Yoga For Complete Beginners',
    channel: 'Yoga With Adriene',
    category: 'Yoga',
    duration: '20 min',
  },
  {
    id: 'yoga-anxiety-stress',
    videoId: 'hJbRpHZr_d0',
    title: 'Yoga For Anxiety and Stress',
    channel: 'Yoga With Adriene',
    category: 'Yoga',
    duration: '27 min',
  },
  {
    id: 'yoga-morning-flow',
    videoId: 'VaoV1PrYft4',
    title: 'Morning Yoga Flow',
    channel: 'Boho Beautiful Yoga',
    category: 'Yoga',
    duration: '20 min',
  },
  {
    id: 'yoga-bedtime',
    videoId: 'BiWDsfZ3zbo',
    title: 'Bedtime Yoga',
    channel: 'Yoga With Adriene',
    category: 'Yoga',
    duration: '20 min',
  },
  {
    id: 'meditation-5min',
    videoId: 'inpok4MKVLM',
    title: '5-Minute Meditation You Can Do Anywhere',
    channel: 'Goodful',
    category: 'Meditation',
    duration: '6 min',
  },
  {
    id: 'meditation-anxiety',
    videoId: 'O-6f5wQXSu8',
    title: '10-Minute Meditation For Anxiety',
    channel: 'Goodful',
    category: 'Meditation',
    duration: '11 min',
  },
  {
    id: 'meditation-deep-relax',
    videoId: 'Jyy0ra2WcQQ',
    title: 'Blissful Deep Relaxation',
    channel: 'The Honest Guys',
    category: 'Meditation',
    duration: '20 min',
  },
  {
    id: 'meditation-sleep',
    videoId: 'aEqlQvczMJQ',
    title: 'Guided Sleep Meditation',
    channel: 'The Honest Guys',
    category: 'Meditation',
    duration: '1 hr',
  },
  {
    id: 'breathing-wim-hof',
    videoId: 'tybOi4hjZFQ',
    title: 'Guided Breathing Meditation',
    channel: 'Wim Hof',
    category: 'Breathing',
    duration: '11 min',
  },
  {
    id: 'breathing-box',
    videoId: 'tEmt1Znux58',
    title: 'Box Breathing Exercise',
    channel: 'Calm',
    category: 'Breathing',
    duration: '5 min',
  },
  {
    id: 'breathing-478',
    videoId: 'LiUnFJ8P4gM',
    title: '4-7-8 Calm Breathing Exercise',
    channel: 'Calm',
    category: 'Breathing',
    duration: '5 min',
  },
];

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0`;
}
