import { AppState, AppStateStatus, BackHandler, Platform, StatusBar as RNStatusBar } from 'react-native';

export function setImmersiveMode(enabled: boolean): void {
  if (Platform.OS === 'web') return;
  RNStatusBar.setHidden(enabled, 'slide');
}

export function attachAndroidBackGuard(onBackPress: () => boolean): () => void {
  if (Platform.OS !== 'android') return () => undefined;
  const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  return () => sub.remove();
}

export function attachAppStateGuard(
  isActive: () => boolean,
  onBackgroundReturn: () => void,
): () => void {
  if (Platform.OS === 'web') return () => undefined;

  let wentBackground = false;

  const handler = (state: AppStateStatus) => {
    if (!isActive()) {
      wentBackground = false;
      return;
    }
    if (state === 'background' || state === 'inactive') {
      wentBackground = true;
      return;
    }
    if (state === 'active' && wentBackground) {
      wentBackground = false;
      onBackgroundReturn();
    }
  };

  const sub = AppState.addEventListener('change', handler);
  return () => sub.remove();
}

export function attachWebFocusGuards(
  isActive: () => boolean,
  onAttemptExit: () => void,
): () => void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return () => undefined;

  let switchedAway = false;

  const onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!isActive()) return;
    event.preventDefault();
    event.returnValue = '';
  };

  const onVisibilityChange = () => {
    if (!isActive()) {
      switchedAway = false;
      return;
    }
    if (document.visibilityState === 'hidden') {
      switchedAway = true;
      return;
    }
    if (switchedAway) {
      switchedAway = false;
      onAttemptExit();
    }
  };

  window.addEventListener('beforeunload', onBeforeUnload);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    window.removeEventListener('beforeunload', onBeforeUnload);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
