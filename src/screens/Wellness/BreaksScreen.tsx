import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { MeditationFigure } from '../../components/ui/MeditationFigure';
import { useSettingsStore } from '../../stores/settingsStore';
import { WellnessStackParamList } from '../../navigation/types';
import { SCREEN_TITLE } from '../../utils/typography';

type Props = NativeStackScreenProps<WellnessStackParamList, 'Breaks'>;

export function BreaksScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const shortBreak = useSettingsStore((s) => s.pomodoro.shortBreak);
  const [seconds, setSeconds] = useState(shortBreak * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { setRunning(false); return shortBreak * 60; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, shortBreak]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <ScreenWrapper scroll={false}>
      <ScreenHeader title="Wellness break" onBack={() => navigation.goBack()} />
      <View style={styles.center}>
        <MeditationFigure />
        <Text style={[styles.title, { color: colors.text }]}>Take a break</Text>
        <Text style={[styles.timer, { color: colors.success }]}>{fmt(seconds)}</Text>
        <Text style={[styles.tip, { color: colors.textSecondary }]}>Stand up, stretch, hydrate, and rest your eyes.</Text>
        <Button title={running ? 'Pause' : 'Start break timer'} onPress={() => setRunning(!running)} style={styles.btn} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', ...SCREEN_TITLE },
  timer: { fontSize: 56, fontWeight: '200', marginVertical: 20 },
  tip: { fontSize: 15, textAlign: 'center', paddingHorizontal: 32, marginBottom: 32 },
  btn: { minWidth: 200 },
});
