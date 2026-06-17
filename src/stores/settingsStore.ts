import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppearanceMode, AppSettings } from '../types';

interface SettingsState extends AppSettings {
  setPomodoro: (pomodoro: AppSettings['pomodoro']) => void;
  setFocusModeApps: (apps: string[]) => void;
  addFocusModeApp: (app: string) => void;
  removeFocusModeApp: (app: string) => void;
  setAppearance: (appearance: AppearanceMode) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  pomodoro: { workMinutes: 25, shortBreak: 5, longBreak: 15 },
  focusModeApps: ['Instagram', 'TikTok', 'Twitter', 'YouTube'],
  appearance: 'system',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setPomodoro: (pomodoro) => set({ pomodoro }),
      setFocusModeApps: (focusModeApps) => set({ focusModeApps }),
      addFocusModeApp: (app) =>
        set((s) => ({ focusModeApps: [...s.focusModeApps, app] })),
      removeFocusModeApp: (app) =>
        set((s) => ({ focusModeApps: s.focusModeApps.filter((a) => a !== app) })),
      setAppearance: (appearance) => set({ appearance }),
      resetSettings: () => set({ ...defaultSettings }),
    }),
    {
      name: 'nexara-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
