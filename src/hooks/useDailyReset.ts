import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useHabitsStore } from '../stores/habitsStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { todayKey } from '../utils/helpers';

export function useDailyReset(): void {
  useEffect(() => {
    const resetIfNewDay = () => {
      const today = todayKey();
      useHabitsStore.getState().resetDailyIfNeeded(today);
      useAnalyticsStore.getState().resetTodayIfNeeded(today);
    };

    resetIfNewDay();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') resetIfNewDay();
    });
    return () => sub.remove();
  }, []);
}
