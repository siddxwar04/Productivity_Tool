import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { generateSmartSchedule } from '../../services/smartScheduleService';
import { usePlannerStore } from '../../stores/plannerStore';
import { SUBJECT_COLORS } from '../../constants/milestones';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'SmartSchedule'>;

export function SmartScheduleScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const suggestions = useMemo(() => generateSmartSchedule(), []);
  const addBlock = usePlannerStore((s) => s.addBlock);
  const today = new Date().getDay();
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(listAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [listAnim]);

  const applyAll = () => {
    suggestions.forEach((s, i) => {
      addBlock({
        title: s.title,
        dayOfWeek: today,
        startHour: s.startHour,
        startMinute: 0,
        durationMinutes: s.durationMinutes,
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
      });
    });
    navigation.navigate('Planner');
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Smart schedule" onBack={() => navigation.goBack()} />

      <View style={[styles.aiChip, { backgroundColor: `${colors.primary}15` }]}>
        <Ionicons name="sparkles" size={14} color={colors.primary} />
        <Text style={[styles.aiText, { color: colors.primary }]}>
          AI-optimised for your deadlines & study goal
        </Text>
      </View>

      <Animated.View style={{ opacity: listAnim }}>
        {suggestions.map((s, i) => (
          <View
            key={s.id}
            style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.accent, { backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }]} />
            <View style={styles.blockBody}>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={13} color={colors.primary} />
                <Text style={[styles.time, { color: colors.primary }]}>
                  {s.startHour}:00 · {s.durationMinutes} min
                </Text>
              </View>
              <Text style={[styles.blockTitle, { color: colors.text }]}>{s.title}</Text>
              <Text style={[styles.reason, { color: colors.textSecondary }]}>{s.reason}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      <TouchableOpacity onPress={applyAll} activeOpacity={0.85} style={styles.applyWrap}>
        <LinearGradient
          colors={['#7C3AED', '#6366F1']}
          style={styles.applyBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="calendar-outline" size={20} color="#FFF" />
          <Text style={styles.applyText}>Apply to today's planner</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 20,
  },
  aiText: { fontSize: 13, fontWeight: '600' },
  block: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accent: { width: 4 },
  blockBody: { flex: 1, padding: 14 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  time: { fontSize: 12, fontWeight: '700' },
  blockTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  reason: { fontSize: 13, lineHeight: 18 },
  applyWrap: { marginTop: 8 },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
  },
  applyText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
