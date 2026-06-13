import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useSettingsStore } from '../../stores/settingsStore';
import { useNotificationSettingsStore } from '../../stores/notificationSettingsStore';
import { useFocusLockStore } from '../../stores/focusLockStore';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useStreakStore } from '../../stores/streakStore';
import { onPomodoroComplete } from '../../services/rewardsService';
import { PomodoroPhase } from '../../types';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Pomodoro'>;

const { height } = Dimensions.get('window');

const RADIUS = 110;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = (RADIUS + STROKE + 10) * 2;

type Mode = 'focus' | 'short' | 'long';

interface ModeConfig {
  label: string;
  phase: PomodoroPhase;
  color: [string, string];
  glowColor: string;
  tagline: string;
}

const MODE_META: Record<Mode, Omit<ModeConfig, 'phase'> & { phase: PomodoroPhase }> = {
  focus: {
    label: 'Focus',
    phase: 'work',
    color: ['#6C5CE7', '#A29BFE'],
    glowColor: 'rgba(108,92,231,0.35)',
    tagline: 'Lock in. Deep work mode.',
  },
  short: {
    label: 'Short break',
    phase: 'shortBreak',
    color: ['#00B894', '#00CEC9'],
    glowColor: 'rgba(0,184,148,0.35)',
    tagline: 'Breathe. You earned this.',
  },
  long: {
    label: 'Long break',
    phase: 'longBreak',
    color: ['#E17055', '#D63031'],
    glowColor: 'rgba(225,112,85,0.35)',
    tagline: 'Rest well. Big session done.',
  },
};

const QUOTES = [
  'The secret of getting ahead is getting started.',
  'Focus on being productive instead of busy.',
  "One task at a time. That's the rule.",
  'Small steps every day lead to big results.',
  "You don't have to be great to start, but start to be great.",
];

const phaseToMode = (phase: PomodoroPhase): Mode => {
  if (phase === 'work') return 'focus';
  if (phase === 'shortBreak') return 'short';
  return 'long';
};

export function PomodoroScreen({ navigation }: Props) {
  const pomodoro = useSettingsStore((s) => s.pomodoro);
  const focusApps = useSettingsStore((s) => s.focusModeApps);
  const pomodoroChime = useNotificationSettingsStore((s) => s.pomodoroChime);
  const breakReminders = useNotificationSettingsStore((s) => s.breakReminders);
  const isFocusLocked = useFocusLockStore((s) => s.isFocusLocked);
  const lockSession = useFocusLockStore((s) => s.lockSession);
  const unlockSession = useFocusLockStore((s) => s.unlockSession);
  const requestExit = useFocusLockStore((s) => s.requestExit);
  const todayStudyMinutes = useAnalyticsStore((s) => s.todayStudyMinutes);
  const totalPomodoros = useAnalyticsStore((s) => s.totalPomodoros);
  const resetTodayIfNeeded = useAnalyticsStore((s) => s.resetTodayIfNeeded);
  const streak = useStreakStore((s) => s.current);

  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [sessions, setSessions] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(pomodoro.workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const endActionRef = useRef<(() => void) | null>(null);

  const mode = phaseToMode(phase);

  const modeDurations = useMemo(
    () => ({
      focus: pomodoro.workMinutes * 60,
      short: pomodoro.shortBreak * 60,
      long: pomodoro.longBreak * 60,
    }),
    [pomodoro],
  );

  const cfg = useMemo(
    () => ({
      ...MODE_META[mode],
      duration: modeDurations[mode],
    }),
    [mode, modeDurations],
  );

  const progress = 1 - secondsLeft / cfg.duration;
  const completedInCycle = sessions % 4 === 0 && sessions > 0 ? 4 : sessions % 4;
  const distractionApps = focusApps.length > 0 ? focusApps : ['Instagram', 'TikTok', 'Twitter', 'YouTube', 'WhatsApp'];

  const phaseDuration = useCallback(
    (p: PomodoroPhase) => {
      if (p === 'work') return pomodoro.workMinutes * 60;
      if (p === 'shortBreak') return pomodoro.shortBreak * 60;
      return pomodoro.longBreak * 60;
    },
    [pomodoro],
  );

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    resetTodayIfNeeded(today);
  }, [resetTodayIfNeeded]);

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [headerOpacity, contentOpacity]);

  useEffect(() => {
    if (running) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
      );
      pulseLoopRef.current.start();
      Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } else {
      pulseLoopRef.current?.stop();
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }

    return () => {
      pulseLoopRef.current?.stop();
    };
  }, [running, pulseAnim, glowAnim]);

  const notifyPhaseEnd = async (title: string, body: string) => {
    if (pomodoroChime || breakReminders) {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null,
      });
    }
    Vibration.vibrate(400);
  };

  const reset = useCallback(() => {
    unlockSession();
    setRunning(false);
    setPhase('work');
    setSecondsLeft(phaseDuration('work'));
  }, [phaseDuration, unlockSession]);

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
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
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

  const runExitAction = useCallback(
    (action: () => void) => {
      endActionRef.current = action;
      requestExit();
    },
    [requestExit],
  );

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

  const applyMode = (nextMode: Mode) => {
    const nextPhase = MODE_META[nextMode].phase;
    setRunning(false);
    setPhase(nextPhase);
    setSecondsLeft(modeDurations[nextMode]);
  };

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    if (isFocusLocked && phase === 'work') {
      runExitAction(() => applyMode(nextMode));
      return;
    }
    applyMode(nextMode);
  };

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

  const toggleTimer = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }),
    ]).start();

    if (secondsLeft === 0) {
      setSecondsLeft(cfg.duration);
      handleStart();
      return;
    }

    if (running) {
      setRunning(false);
    } else {
      handleStart();
    }
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <Animated.View style={[styles.bgGlow, { opacity: glowOpacity }]}>
        <LinearGradient
          colors={[cfg.glowColor, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.2 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pomodoro</Text>
          <View style={styles.statsChip}>
            <Text style={styles.statsChipText}>🍅 {totalPomodoros}</Text>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ opacity: contentOpacity }}>
            <View style={styles.modeTabs}>
              {(Object.keys(MODE_META) as Mode[]).map((m) => (
                <TouchableOpacity key={m} style={styles.modeTabWrap} onPress={() => switchMode(m)}>
                  {mode === m ? (
                    <LinearGradient
                      colors={MODE_META[m].color}
                      style={styles.modeTabActive}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.modeTabTextActive}>{MODE_META[m].label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.modeTab}>
                      <Text style={styles.modeTabText}>{MODE_META[m].label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.tagline}>{cfg.tagline}</Text>

            <View style={styles.ringWrap}>
              <Animated.View
                style={[
                  styles.glowRing,
                  {
                    opacity: glowOpacity,
                    transform: [{ scale: pulseAnim }],
                    shadowColor: cfg.color[0],
                  },
                ]}
              />

              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Svg width={SVG_SIZE} height={SVG_SIZE}>
                  <Circle
                    cx={SVG_SIZE / 2}
                    cy={SVG_SIZE / 2}
                    r={RADIUS}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={STROKE}
                    fill="transparent"
                  />
                  <Circle
                    cx={SVG_SIZE / 2}
                    cy={SVG_SIZE / 2}
                    r={RADIUS}
                    stroke={cfg.color[0]}
                    strokeWidth={STROKE}
                    fill="transparent"
                    strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${SVG_SIZE / 2}, ${SVG_SIZE / 2}`}
                  />
                </Svg>

                <View style={styles.timerInner}>
                  <Text style={[styles.timerText, { color: progress > 0 ? cfg.color[1] : '#fff' }]}>
                    {mins}:{secs}
                  </Text>
                  <Text style={styles.timerLabel}>
                    {running ? '● running' : secondsLeft === 0 ? '✓ done' : '○ paused'}
                  </Text>
                </View>
              </Animated.View>
            </View>

            <View style={styles.sessionDots}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.sessionDotWrap}>
                  {i < completedInCycle ? (
                    <LinearGradient
                      colors={MODE_META.focus.color}
                      style={styles.sessionDotFilled}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  ) : (
                    <View style={styles.sessionDotEmpty} />
                  )}
                </View>
              ))}
              <Text style={styles.sessionDotLabel}>{completedInCycle}/4 sessions</Text>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.resetBtnWrap} onPress={handleReset} activeOpacity={0.8}>
                <View style={styles.resetBtn}>
                  <Text style={styles.resetBtnText}>↺  Reset</Text>
                </View>
              </TouchableOpacity>

              <Animated.View style={[styles.mainBtnWrap, { transform: [{ scale: buttonScale }] }]}>
                <TouchableOpacity onPress={toggleTimer} activeOpacity={0.85}>
                  <LinearGradient
                    colors={cfg.color}
                    style={styles.mainBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.mainBtnText}>
                      {secondsLeft === 0 ? '↺  Restart' : running ? '⏸  Pause' : '▶  Start'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {isFocusLocked && (
              <View style={styles.focusLockBanner}>
                <Text style={styles.focusLockTitle}>Focus lock active</Text>
                <Text style={styles.focusLockText}>
                  Stay in the app — back, reset, and mode changes are guarded until you finish or confirm exit.
                </Text>
              </View>
            )}

            <View style={styles.statsStrip}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{todayStudyMinutes}m</Text>
                <Text style={styles.statLabel}>Focus today</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalPomodoros}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={styles.statValue}>🔥 {streak}</Text>
                <Text style={styles.statLabel}>Day streak</Text>
              </View>
            </View>

            <View style={styles.quoteCard}>
              <View style={[styles.quoteAccent, { backgroundColor: cfg.color[0] }]} />
              <Text style={styles.quoteText}>"{quote}"</Text>
            </View>

            {phase === 'work' && (
              <View style={styles.distractionCard}>
                <Text style={styles.distractionTitle}>🚫  Avoid during focus</Text>
                <View style={styles.distractionTags}>
                  {distractionApps.map((app) => (
                    <View key={app} style={styles.distractionTag}>
                      <Text style={styles.distractionTagText}>{app}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  safe: { flex: 1 },
  bgGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.6 },
  scrollContent: { paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: '#fff', fontSize: 18 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  statsChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  statsChipText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  modeTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  modeTabWrap: { flex: 1 },
  modeTabActive: { borderRadius: 11, paddingVertical: 9, alignItems: 'center' },
  modeTab: { borderRadius: 11, paddingVertical: 9, alignItems: 'center' },
  modeTabTextActive: { color: '#fff', fontSize: 12, fontWeight: '700' },
  modeTabText: { color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: '500' },

  tagline: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    marginBottom: 24,
    letterSpacing: 0.3,
  },

  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: SVG_SIZE + 40,
    height: SVG_SIZE + 40,
    borderRadius: (SVG_SIZE + 40) / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  timerInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  sessionDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  sessionDotWrap: {},
  sessionDotFilled: { width: 12, height: 12, borderRadius: 6 },
  sessionDotEmpty: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sessionDotLabel: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    marginLeft: 6,
  },

  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  resetBtnWrap: { flex: 0.45 },
  resetBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  resetBtnText: { color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: '600' },
  mainBtnWrap: { flex: 0.55 },
  mainBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  focusLockBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(108,92,231,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(108,92,231,0.35)',
  },
  focusLockTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  focusLockText: { color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 18 },

  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 3 },
  statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  statDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  quoteCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  quoteAccent: { width: 3, borderRadius: 2, minHeight: 40 },
  quoteText: {
    flex: 1,
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  distractionCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  distractionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  distractionTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  distractionTag: {
    backgroundColor: 'rgba(209,0,0,0.12)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(209,0,0,0.25)',
  },
  distractionTagText: { color: '#FF6B6B', fontSize: 12, fontWeight: '500' },
});
