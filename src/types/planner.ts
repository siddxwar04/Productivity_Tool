import { PlannerBlock } from '../types';

export type PlannerPriority = 'low' | 'medium' | 'high';

export type PlannerViewMode = 'week' | 'day';

export const PLANNER_START_HOUR = 6;
export const PLANNER_END_HOUR = 22;
export const PLANNER_ROW_HEIGHT = 52;
export const PLANNER_DAY_INDICES = [1, 2, 3, 4, 5, 6, 0] as const;
export const PLANNER_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export interface WeeklyPlannerAnalytics {
  totalStudyMinutes: number;
  totalStudyHours: number;
  hoursPerSubject: { subject: string; minutes: number; color: string }[];
  completionPercent: number;
  weeklyGoalHours: number;
  goalProgressPercent: number;
  conflictCount: number;
}

export interface PlannerBlockInput {
  title: string;
  subject: string;
  description?: string;
  dayOfWeek: number;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  color: string;
  priority: PlannerPriority;
  subjectId?: string;
}
