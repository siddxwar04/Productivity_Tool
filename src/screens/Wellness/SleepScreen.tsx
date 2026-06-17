import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { useSleepStore } from '../../stores/sleepStore';
import { WellnessStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'Sleep'>;

const QUALITY_CONFIG: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😴', label: 'Very poor', color: '#EF4444' },
  2: { emoji: '😪', label: 'Poor', color: '#F97316' },
  3: { emoji: '😐', label: 'Okay', color: '#F59E0B' },
  4: { emoji: '😊', label: 'Good', color: '#10B981' },
  5: { emoji: '🌟', label: 'Excellent', color: '#6366F1' },
};

export function SleepScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const logSleep = useSleepStore((s) => s.logSleep);
  const getTodaySleep = useSleepStore((s) => s.getTodaySleep);
  const getAverageHours = useSleepStore((s) => s.getAverageHours);
  const [hours, setHours] = useState(getTodaySleep()?.hours ?? 7);
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(getTodaySleep()?.quality ?? 3);
  const [saved, setSaved] = useState(false);
  const saveScale = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  const avg = getAverageHours();
  const qualityCfg = QUALITY_CONFIG[quality];

  const handleSave = () => {
    Animated.sequence([
      Animated.spring(saveScale, { toValue: 0.95, useNativeDriver: true, friction: 8 }),
      Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();
    Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    logSleep(hours, quality);
    setSaved(true);
    setTimeout(() => {
      checkOpacity.setValue(0);
      setSaved(false);
    }, 2000);
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Sleep log" onBack={() => navigation.goBack()} />

      <Card style={styles.logCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="moon-outline" size={18} color="#6366F1" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hours slept</Text>
        </View>
        <View style={styles.hoursDisplay}>
          <Text style={[styles.hoursValue, { color: colors.primary }]}>{hours.toFixed(1)}</Text>
          <Text style={[styles.hoursUnit, { color: colors.textSecondary }]}>hours</Text>
        </View>
        <Slider
          minimumValue={3}
          maximumValue={12}
          step={0.5}
          value={hours}
          onValueChange={setHours}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.surfaceSecondary}
          thumbTintColor={colors.primary}
        />
        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>3h</Text>
          <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>12h</Text>
        </View>
      </Card>

      <Card style={styles.logCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star-outline" size={18} color="#F59E0B" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sleep quality</Text>
        </View>
        <View style={styles.qualityDisplay}>
          <Text style={styles.qualityEmoji}>{qualityCfg.emoji}</Text>
          <Text style={[styles.qualityLabel, { color: qualityCfg.color }]}>{qualityCfg.label}</Text>
        </View>
        <View style={styles.qualityBtns}>
          {([1, 2, 3, 4, 5] as const).map((q) => (
            <TouchableOpacity
              key={q}
              onPress={() => setQuality(q)}
              activeOpacity={0.8}
              style={[
                styles.qualityBtn,
                {
                  backgroundColor: quality === q ? `${QUALITY_CONFIG[q].color}20` : colors.surfaceSecondary,
                  borderColor: quality === q ? QUALITY_CONFIG[q].color : 'transparent',
                  borderWidth: quality === q ? 1.5 : 0,
                },
              ]}
            >
              <Text style={styles.qualityBtnEmoji}>{QUALITY_CONFIG[q].emoji}</Text>
              <Text style={[styles.qualityBtnNum, { color: quality === q ? QUALITY_CONFIG[q].color : colors.textMuted }]}>
                {q}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Animated.View style={{ transform: [{ scale: saveScale }] }}>
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.85}
          style={[styles.saveBtn, { backgroundColor: saved ? colors.success : colors.primary }]}
        >
          <Animated.View style={{ opacity: checkOpacity, position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.saveBtnText}>Logged!</Text>
          </Animated.View>
          {!saved && (
            <View style={styles.saveBtnContent}>
              <Ionicons name="moon" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Log sleep</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {avg > 0 && (
        <Card style={styles.avgCard}>
          <View style={styles.avgRow}>
            <View style={[styles.avgIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="trending-up-outline" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.avgLabel, { color: colors.textSecondary }]}>7-day average</Text>
              <Text style={[styles.avgValue, { color: colors.text }]}>{avg.toFixed(1)} hours/night</Text>
            </View>
          </View>
        </Card>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  logCard: { marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  hoursDisplay: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, justifyContent: 'center', marginBottom: 16 },
  hoursValue: { fontSize: 52, fontWeight: '800', lineHeight: 56 },
  hoursUnit: { fontSize: 18, fontWeight: '500', marginBottom: 8 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderLabel: { fontSize: 11 },
  qualityDisplay: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 16 },
  qualityEmoji: { fontSize: 32 },
  qualityLabel: { fontSize: 18, fontWeight: '700' },
  qualityBtns: { flexDirection: 'row', gap: 8 },
  qualityBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  qualityBtnEmoji: { fontSize: 20 },
  qualityBtnNum: { fontSize: 11, fontWeight: '700' },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    marginBottom: 16,
  },
  saveBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  avgCard: {},
  avgRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avgIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avgLabel: { fontSize: 12, marginBottom: 2 },
  avgValue: { fontSize: 16, fontWeight: '700' },
});
