import { useDeadlinesStore } from '../stores/deadlinesStore';
import { useUserProfileStore } from '../stores/userProfileStore';
import { ScheduleSuggestion } from '../types';

export function generateSmartSchedule(): ScheduleSuggestion[] {
  const deadlines = useDeadlinesStore.getState().deadlines.filter((d) => !d.completed);
  const goals = useUserProfileStore.getState().goals;
  const suggestions: ScheduleSuggestion[] = [];

  const sorted = [...deadlines].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  let hour = 9;

  for (const d of sorted.slice(0, 3)) {
    suggestions.push({
      id: d.id,
      title: `Study: ${d.title}`,
      startHour: hour,
      durationMinutes: 60,
      reason: `Due ${new Date(d.dueAt).toLocaleDateString()} — high priority`,
    });
    hour += 2;
  }

  const remainingMinutes = Math.max(0, goals.studyHoursPerDay * 60 - suggestions.length * 60);
  if (remainingMinutes > 0) {
    suggestions.push({
      id: 'review',
      title: 'Review & flashcards',
      startHour: hour,
      durationMinutes: remainingMinutes,
      reason: 'Fill daily study goal with spaced repetition',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: 'default',
      title: 'Open study block',
      startHour: 10,
      durationMinutes: goals.studyHoursPerDay * 60,
      reason: 'No urgent deadlines — focus on your daily goal',
    });
  }

  return suggestions;
}
