import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useSleepStore } from '../../stores/sleepStore';
import { WellnessStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'Sleep'>;

export function SleepScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const logSleep = useSleepStore((s) => s.logSleep);
  const getTodaySleep = useSleepStore((s) => s.getTodaySleep);
  const getAverageHours = useSleepStore((s) => s.getAverageHours);
  const [hours, setHours] = useState(getTodaySleep()?.hours ?? 7);
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(getTodaySleep()?.quality ?? 3);

  const save = () => logSleep(hours, quality);
  const avg = getAverageHours();

  return (
    <ScreenWrapper>
      <ScreenHeader title="Sleep log" onBack={() => navigation.goBack()} />
      <Card>
        <Text style={[styles.label, { color: colors.text }]}>Hours slept: {hours.toFixed(1)}h</Text>
        <Slider minimumValue={3} maximumValue={12} step={0.5} value={hours} onValueChange={setHours} minimumTrackTintColor={colors.primary} thumbTintColor={colors.primary} />
        <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Quality: {quality}/5</Text>
        <Slider minimumValue={1} maximumValue={5} step={1} value={quality} onValueChange={(v) => setQuality(v as 1 | 2 | 3 | 4 | 5)} minimumTrackTintColor={colors.primary} thumbTintColor={colors.primary} />
        <Button title="Log sleep" onPress={save} style={styles.save} />
      </Card>
      <Text style={[styles.avg, { color: colors.textSecondary }]}>7-day average: {avg}h</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  save: { marginTop: 20 },
  avg: { textAlign: 'center', marginTop: 16, fontSize: 14 },
});
