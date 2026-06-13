import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { AppearanceMode } from '../types';
import { darkColors, lightColors, ThemeColors } from './colors';
import { useSettingsStore } from '../stores/settingsStore';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  appearance: AppearanceMode;
  setAppearance: (mode: AppearanceMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveIsDark(mode: AppearanceMode, systemScheme: ColorSchemeName): boolean {
  if (mode === 'system') return systemScheme === 'dark';
  return mode === 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? 'light',
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const isDark = resolveIsDark(appearance, systemScheme);
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({ colors, isDark, appearance, setAppearance }),
    [colors, isDark, appearance, setAppearance],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
