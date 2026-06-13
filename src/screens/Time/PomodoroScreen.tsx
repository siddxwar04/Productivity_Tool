import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useSettingsStore } from '../../stores/settingsStore';
import { useNotificationSettingsStore } from '../../stores/notificationSettingsStore';
import { useFocusLockStore } from '../../stores/focusLockStore';
import { onPomodoroComplete } from '../../services/rewardsService';
import { PomodoroPhase } from '../../types';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Pomodoro'>;

export function PomodoroScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const pomodoro = useSettingsStore((s) => s.pomodoro);
  const focusApps = useSettingsStore((s) => s.focusModeApps);
  const pomodoroChime = useNotificationSettingsStore((s) => s.pomodoroChime);
  const breakReminders = useNotificationSettingsStore((s) => s.breakReminders);
  const isFocusLocked = useFocusLockStore((s) => s.isFocusLocked);
  const lockSession = useFocusLockStore((s) => s.lockSession);
  const unlockSession = useFocusLockStore((s) => s.unlockSession);
  const requestExit = useFocusLockStore((s) => s.requestExit);

  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [sessions, setSessions] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(pomodoro.workMinutes * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endActionRef = useRef<(() => void) | null>(null);

  const phaseDuration = useCallback((p: PomodoroPhase) => {
    if (p === 'work') return pomodoro.workMinutes * 60;
    if (p === 'shortBreak') return pomodoro.shortBreak * 60;
    return pomodoro.longBreak * 60;
  }, [pomodoro]);

  const reset = useCallback(() => {
    unlockSession();
    setRunning(false);
    setPhase('work');
    setSecondsLeft(phaseDuration('work'));
  }, [phaseDuration, unlockSession]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const notifyPhaseEnd = async (title: string, body: string) => {
    if (pomodoroChime || breakReminders) {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null,
      });
    }
    Vibration.vibrate(400);
  };

  const advancePhase = useCallback(() => {
    if (phase === 'work') {
      unlockSession();
      const newSessions = sessions + 1;
      setSessions(newSessions);
      onPomodoroComplete(pomodoro.workMinutes);
      notifyPhaseEnd('Focus session complete!', 'Great work. Time for a break.');
      if (newSessions % 4 === 0) {
        setPhase('longBreak');
        setSecondsLeft(pomodoro.longBreak * 60);
      } else {
        setPhase('shortBreak');
        setSecondsLeft(pomodoro.shortBreak * 60);
      }
    } else {
      notifyPhaseEnd('Break over!', 'Ready for another focus session?');
      setPhase('work');
      setSecondsLeft(pomodoro.workMinutes * 60);
    }
    setRunning(false);
  }, [phase, sessions, pomodoro, pomodoroChime, breakReminders, unlockSession]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          advancePhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, advancePhase]);

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !isFocusLocked });
  }, [navigation, isFocusLocked]);

  useEffect(
    () => () => {
      if (useFocusLockStore.getState().isFocusLocked) {
        useFocusLockStore.getState().unlockSession();
      }
    },
    [],
  );

  const runExitAction = useCallback((action: () => void) => {
    endActionRef.current = action;
    requestExit();
  }, [requestExit]);

  const handleStart = () => {
    setRunning(true);
    if (phase === 'work' && !isFocusLocked) {
      lockSession('Pomodoro focus session', () => {
        const action = endActionRef.current;
        endActionRef.current = null;
        if (action) {
          action();
          return;
        }
        setRunning(false);
      });
    }
  };

  const handleBack = () => {
    if (isFocusLocked) {
      runExitAction(() => navigation.goBack());
      return;
    }
    navigation.goBack();
  };

  const handleReset = () => {
    if (isFocusLocked) {
      runExitAction(reset);
      return;
    }
    reset();
  };

  const phaseLabel = phase === 'work' ? 'Focus' : phase === 'shortBreak' ? 'Short break' : 'Long break';
  const phaseColor = phase === 'work' ? colors.primary : colors.success;

  return (
    <ScreenWrapper scroll={false}>
      <ScreenHeader title="Pomodoro" onBack={handleBack} />
      <View style={styles.center}>
        <Text style={[styles.phase, { color: phaseColor }]}>{phaseLabel}</Text>
        <Text style={[styles.timer, { color: colors.text }]}>{formatTime(secondsLeft)}</Text>
        <Text style={[styles.sessions, { color: colors.textSecondary }]}>
          Session {sessions + (phase !== 'work' ? 1 : 0)} · {sessions} completed today
        </Text>
        <View style={[styles.ring, { borderColor: phaseColor }]}>
          <View style={[styles.ringInner, { backgroundColor: `${phaseColor}15` }]} />
        </View>
        <View style={styles.actions}>
          {!running ? (
            <Button title="Start" onPress={handleStart} style={styles.btn} />
          ) : (
            <Button title="Pause" onPress={() => setRunning(false)} variant="secondary" style={styles.btn} />
          )}
          <Button title="Reset" onPress={handleReset} variant="ghost" style={styles.btn} />
        </View>
        {isFocusLocked && (
          <View style={[styles.focusBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.primary }]}>
            <Text style={[styles.focusTitle, { color: colors.text }]}>Focus lock active</Text>
            <Text style={[styles.focusApps, { color: colors.textSecondary }]}>
              Stay in the app — back, app switch, and tab close are guarded.
            </Text>
          </View>
        )}
        {phase === 'work' && focusApps.length > 0 && (
          <View style={[styles.focusBox, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.focusTitle, { color: colors.text }]}>Distraction list</Text>
            <Text style={[styles.focusApps, { color: colors.textSecondary }]}>
              Avoid: {focusApps.join(', ')}
            </Text>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  phase: { fontSize: 18, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  timer: { fontSize: 72, fontWeight: '200', marginVertical: 16, fontVariant: ['tabular-nums'] },
  sessions: { fontSize: 14, marginBottom: 32 },
  ring: { width: 200, height: 200, borderRadius: 100, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  ringInner: { width: 180, height: 180, borderRadius: 90 },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { minWidth: 120 },
  focusBox: { marginTop: 16, padding: 16, borderRadius: 12, width: '100%', borderWidth: 1 },
  focusTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  focusApps: { fontSize: 13 },
});
