import { PlannerBlock } from '../../types';
import {
  PLANNER_END_HOUR,
  PLANNER_ROW_HEIGHT,
  PLANNER_START_HOUR,
  WeeklyPlannerAnalytics,
} from '../../types/planner';

export function blockStartMinutes(block: Pick<PlannerBlock, 'startHour' | 'startMinute'>): number {
  return block.startHour * 60 + block.startMinute;
}

export function blockEndMinutes(block: Pick<PlannerBlock, 'startHour' | 'startMinute' | 'durationMinutes'>): number {
  return blockStartMinutes(block) + block.durationMinutes;
}

export function formatBlockTime(hour: number, minute: number): string {
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) {
    return `${m}m`;
  }
  if (m === 0) {
    return `${h}h`;
  }
  return `${h}h ${m}m`;
}

export function blocksOverlap(
  a: Pick<PlannerBlock, 'dayOfWeek' | 'startHour' | 'startMinute' | 'durationMinutes'>,
  b: Pick<PlannerBlock, 'dayOfWeek' | 'startHour' | 'startMinute' | 'durationMinutes'>,
): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) {
    return false;
  }
  return blockStartMinutes(a) < blockEndMinutes(b) && blockStartMinutes(b) < blockEndMinutes(a);
}

export function findConflicts(
  blocks: PlannerBlock[],
  candidate: Pick<PlannerBlock, 'id' | 'dayOfWeek' | 'startHour' | 'startMinute' | 'durationMinutes'>,
): PlannerBlock[] {
  return blocks.filter(
    (block) => block.id !== candidate.id && blocksOverlap(block, candidate),
  );
}

export function getBlockTopOffset(block: Pick<PlannerBlock, 'startHour' | 'startMinute'>): number {
  const minutesFromStart = blockStartMinutes(block) - PLANNER_START_HOUR * 60;
  return (minutesFromStart / 60) * PLANNER_ROW_HEIGHT;
}

export function getBlockHeight(block: Pick<PlannerBlock, 'durationMinutes'>): number {
  return Math.max(PLANNER_ROW_HEIGHT * 0.75, (block.durationMinutes / 60) * PLANNER_ROW_HEIGHT);
}

export function snapMinutesFromDrag(
  dy: number,
  originalStartMinutes: number,
): number {
  const deltaSlots = Math.round(dy / (PLANNER_ROW_HEIGHT / 2));
  const snapped = originalStartMinutes + deltaSlots * 30;
  const min = PLANNER_START_HOUR * 60;
  const max = PLANNER_END_HOUR * 60 - 30;
  return Math.min(Math.max(snapped, min), max);
}

export function minutesToTime(totalMinutes: number): { hour: number; minute: number } {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return { hour, minute };
}

export function computeWeeklyAnalytics(
  blocks: PlannerBlock[],
  weeklyGoalHours: number,
): WeeklyPlannerAnalytics {
  const totalStudyMinutes = blocks.reduce((sum, block) => sum + block.durationMinutes, 0);
  const completed = blocks.filter((block) => block.completed).length;
  const completionPercent = blocks.length === 0 ? 0 : Math.round((completed / blocks.length) * 100);

  const subjectMap = new Map<string, { minutes: number; color: string }>();
  for (const block of blocks) {
    const subject = block.subject ?? block.title;
    const existing = subjectMap.get(subject) ?? { minutes: 0, color: block.color };
    subjectMap.set(subject, {
      minutes: existing.minutes + block.durationMinutes,
      color: block.color,
    });
  }

  const hoursPerSubject = [...subjectMap.entries()]
    .map(([subject, data]) => ({ subject, minutes: data.minutes, color: data.color }))
    .sort((a, b) => b.minutes - a.minutes);

  let conflictCount = 0;
  for (let i = 0; i < blocks.length; i += 1) {
    for (let j = i + 1; j < blocks.length; j += 1) {
      if (blocksOverlap(blocks[i], blocks[j])) {
        conflictCount += 1;
      }
    }
  }

  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  const goalProgressPercent =
    weeklyGoalHours <= 0 ? 0 : Math.min(100, Math.round((totalStudyHours / weeklyGoalHours) * 100));

  return {
    totalStudyMinutes,
    totalStudyHours,
    hoursPerSubject,
    completionPercent,
    weeklyGoalHours,
    goalProgressPercent,
    conflictCount,
  };
}

export function getSubjectLabel(block: PlannerBlock): string {
  return block.subject ?? block.title;
}

export function getEndTimeLabel(block: PlannerBlock): string {
  const endMinutes = blockEndMinutes(block);
  return formatBlockTime(Math.floor(endMinutes / 60), endMinutes % 60);
}
