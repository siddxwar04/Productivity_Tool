import { MoodEntry } from '../types';

export type MoodLevel = MoodEntry['mood'];

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'Awful',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export const MOOD_RING_COLORS: Record<MoodLevel, string> = {
  1: 'rgba(255,107,107,0.35)',
  2: 'rgba(225,112,85,0.35)',
  3: 'rgba(253,203,110,0.35)',
  4: 'rgba(0,206,201,0.35)',
  5: 'rgba(0,184,148,0.35)',
};

export const MOOD_ACCENT_COLORS: Record<MoodLevel, string> = {
  1: '#FF6B6B',
  2: '#E17055',
  3: '#FDCB6E',
  4: '#00CEC9',
  5: '#00B894',
};

export function formatMoodRelativeDate(dateKey: string): string {
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  if (dateKey === todayKey) return 'Today';
  if (dateKey === yesterdayKey) return 'Yesterday';

  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function dayLabelShort(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
}
