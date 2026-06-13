import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';
import { useFocusLockStore } from '../stores/focusLockStore';
import { FocusExitModal } from './ui/FocusExitModal';
import {
  attachAndroidBackGuard,
  attachAppStateGuard,
  attachWebFocusGuards,
  setImmersiveMode,
} from '../services/focusLockService';

interface FocusLockProviderProps {
  children: React.ReactNode;
}

export function FocusLockProvider({ children }: FocusLockProviderProps) {
  const { isDark } = useTheme();
  const isFocusLocked = useFocusLockStore((s) => s.isFocusLocked);
  const requestExit = useFocusLockStore((s) => s.requestExit);

  useEffect(() => {
    setImmersiveMode(isFocusLocked);
    return () => setImmersiveMode(false);
  }, [isFocusLocked]);

  useEffect(() => {
    if (!isFocusLocked) return undefined;
    return attachAndroidBackGuard(() => {
      requestExit();
      return true;
    });
  }, [isFocusLocked, requestExit]);

  useEffect(() => {
    if (!isFocusLocked) return undefined;
    return attachAppStateGuard(
      () => useFocusLockStore.getState().isFocusLocked,
      () => useFocusLockStore.getState().requestExit(),
    );
  }, [isFocusLocked]);

  useEffect(() => {
    if (!isFocusLocked) return undefined;
    return attachWebFocusGuards(
      () => useFocusLockStore.getState().isFocusLocked,
      () => useFocusLockStore.getState().requestExit(),
    );
  }, [isFocusLocked]);

  return (
    <>
      {children}
      <FocusExitModal />
      {isFocusLocked ? (
        <StatusBar hidden />
      ) : (
        <StatusBar style={isDark ? 'light' : 'dark'} />
      )}
    </>
  );
}
