import { Milestone } from '../types';

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];

export const LEVEL_TITLES = [
  'Novice',
  'Apprentice',
  'Dedicated',
  'Scholar',
  'Expert',
  'Master',
  'Sage',
  'Virtuoso',
  'Legend',
  'Grandmaster',
];

export const MILESTONES: Milestone[] = [
  { id: 'first_pomodoro', title: 'First Focus', description: 'Complete your first pomodoro', icon: '🍅', xpReward: 25 },
  { id: 'week_streak', title: 'Week Warrior', description: '7-day study streak', icon: '🔥', xpReward: 100 },
  { id: 'month_streak', title: 'Monthly Master', description: '30-day study streak', icon: '⚡', xpReward: 500 },
  { id: 'ten_hours', title: '10 Hour Club', description: '10 total study hours', icon: '⏱️', xpReward: 50 },
  { id: 'fifty_hours', title: '50 Hour Hero', description: '50 total study hours', icon: '🏆', xpReward: 200 },
  { id: 'first_habit', title: 'Habit Starter', description: 'Complete a habit 7 days in a row', icon: '✅', xpReward: 75 },
  { id: 'gpa_goal', title: 'GPA Goal', description: 'Set your target GPA', icon: '🎯', xpReward: 30 },
  { id: 'night_owl', title: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', xpReward: 40 },
  { id: 'early_bird', title: 'Early Bird', description: 'Study before 7 AM', icon: '🌅', xpReward: 40 },
  { id: 'flashcard_pro', title: 'Flashcard Pro', description: 'Review 100 flashcards', icon: '🃏', xpReward: 80 },
  { id: 'social_butterfly', title: 'Team Player', description: 'Join a study group', icon: '👥', xpReward: 60 },
  { id: 'level_five', title: 'Level 5', description: 'Reach level 5', icon: '⭐', xpReward: 150 },
];

export const SUBJECT_COLORS = [
  '#6366F1', '#14B8A6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#10B981', '#3B82F6',
];

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? 'Scholar';
}

export function getXpForLevel(level: number): number {
  return LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)] ?? 0;
}

export function getXpToNextLevel(level: number): number {
  const next = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];
  return next ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}
