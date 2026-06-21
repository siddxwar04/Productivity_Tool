import React, { useMemo, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useUserProfileStore } from '../../stores/userProfileStore';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useStreakStore } from '../../stores/streakStore';
import { useRewardsStore } from '../../stores/rewardsStore';
import { getInitials } from '../../utils/helpers';
import { getLevelTitle, MILESTONES } from '../../constants/milestones';
import { shareImage, shareText } from '../../services/shareContent';
import { resetAppData } from '../../utils/devReset';
import { ProfileStackParamList } from '../../navigation/types';
import { SECTION_HEADING } from '../../utils/typography';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;
};

export function ProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const shotRef = useRef<ViewShotRef>(null);

  const displayName = useUserProfileStore((s) => s.displayName);
  const university = useUserProfileStore((s) => s.university);
  const course = useUserProfileStore((s) => s.course);
  const avatarUri = useUserProfileStore((s) => s.avatarUri);
  const level = useUserProfileStore((s) => s.level);
  const xp = useUserProfileStore((s) => s.xp);
  const subjects = useUserProfileStore((s) => s.subjects);
  const xpProgress = useUserProfileStore((s) => s.xpProgress);
  const xpToNextLevel = useUserProfileStore((s) => s.xpToNextLevel);
  const setAvatarUri = useUserProfileStore((s) => s.setAvatarUri);
  const replayOnboarding = useUserProfileStore((s) => s.replayOnboarding);

  const totalStudyHours = useAnalyticsStore((s) => s.totalStudyHours);
  const totalPomodoros = useAnalyticsStore((s) => s.totalPomodoros);
  const longestStreak = useStreakStore((s) => s.longest);
  const unlockedMilestoneIds = useRewardsStore((s) => s.unlockedMilestoneIds);
  const milestones = useMemo(
    () =>
      MILESTONES.map((m) => ({
        ...m,
        unlockedAt: unlockedMilestoneIds.includes(m.id) ? 'unlocked' : undefined,
      })),
    [unlockedMilestoneIds],
  );

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const confirmReplayOnboarding = () => {
    Alert.alert(
      'Show welcome screen',
      'You will see the Nexara logo and onboarding again. Your saved data stays intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => replayOnboarding() },
      ],
    );
  };

  const shareAchievements = async () => {
    const message = `My Nexara progress — Level ${level} ${getLevelTitle(level)}! ${totalStudyHours}h studied · ${totalPomodoros} pomodoros · ${longestStreak}d streak`;
    try {
      const uri = await shotRef.current?.capture?.();
      if (uri) {
        await shareImage(uri, message, 'Share achievements');
      } else {
        await shareText(message, 'Share achievements');
      }
    } catch {
      try {
        await shareText(message, 'Share achievements');
      } catch {
        Alert.alert('Share failed', 'Could not open the share menu. Try again on your phone.');
      }
    }
  };

  const stats = [
    { label: 'Study hours', value: `${totalStudyHours}h` },
    { label: 'Pomodoros', value: String(totalPomodoros) },
    { label: 'Longest streak', value: `${longestStreak}d` },
    { label: 'Subjects', value: String(subjects.length) },
  ];

  const hasUniversity = university.trim().length > 0;
  const hasSubjects = subjects.some((s) => s.name.trim().length > 0);
  const showProfileCompletionBanner = !hasUniversity || !hasSubjects;

  return (
    <ScreenWrapper>
      {showProfileCompletionBanner && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
          style={[
            styles.completionBanner,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderLeftColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.completionBannerText, { color: colors.text }]}>
            📚 Complete your profile — Add your college & subjects
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickAvatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.initials, { backgroundColor: colors.primary }]}>
              <Text style={styles.initialsText}>{getInitials(displayName)}</Text>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: colors.surface }]}>
            <Ionicons name="camera" size={14} color={colors.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
        {university ? <Text style={[styles.meta, { color: colors.textSecondary }]}>{university}</Text> : null}
        {course ? <Text style={[styles.meta, { color: colors.textSecondary }]}>{course}</Text> : null}
      </View>

      <Card style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View style={[styles.levelBadge, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.levelText, { color: colors.primary }]}>
              Level {level} {getLevelTitle(level)}
            </Text>
          </View>
          <Text style={[styles.xpText, { color: colors.textSecondary }]}>
            {xp} / {xpToNextLevel()} XP
          </Text>
        </View>
        <ProgressBar progress={xpProgress()} color={colors.xp} height={10} />
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Milestones</Text>
      <View style={styles.milestoneGrid}>
        {milestones.map((m) => {
          const unlocked = !!m.unlockedAt;
          return (
            <View
              key={m.id}
              style={[
                styles.milestoneItem,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: unlocked ? 1 : 0.45 },
              ]}
            >
              <Text style={styles.milestoneIcon}>{unlocked ? m.icon : '🔒'}</Text>
              <Text style={[styles.milestoneTitle, { color: colors.text }]} numberOfLines={2}>
                {m.title}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Stats</Text>
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.replayBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={confirmReplayOnboarding}
      >
        <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
        <Text style={[styles.replayText, { color: colors.primary }]}>Show welcome screen again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.shareBtn, { backgroundColor: colors.primary }]}
        onPress={shareAchievements}
      >
        <Ionicons name="share-outline" size={20} color="#FFF" />
        <Text style={styles.shareText}>Share achievements</Text>
      </TouchableOpacity>

      <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }} style={styles.hiddenShot}>
        <View style={[styles.shotContent, { backgroundColor: colors.primary }]}>
          <Text style={styles.shotTitle}>Nexara</Text>
          <Text style={styles.shotLevel}>Level {level} {getLevelTitle(level)}</Text>
          <Text style={styles.shotStats}>
            {totalStudyHours}h studied · {totalPomodoros} pomodoros · {longestStreak}d streak
          </Text>
        </View>
      </ViewShot>

      {__DEV__ && (
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Reset app data?',
              'This clears all local data and restarts onboarding. Dev only — this will not appear in production.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: resetAppData },
              ],
            );
          }}
          style={{
            marginTop: 32,
            marginHorizontal: 16,
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239,68,68,0.1)',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 14 }}>
            🔧 Reset app data (dev only)
          </Text>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 8,
  },
  completionBannerText: { flex: 1, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 8, marginTop: -8 },
  iconBtn: { padding: 8 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  initials: { alignItems: 'center', justifyContent: 'center' },
  initialsText: { color: '#FFF', fontSize: 32, fontWeight: '700' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 24, fontWeight: '700', marginTop: 12 },
  meta: { fontSize: 14, marginTop: 2 },
  levelCard: { marginBottom: 24 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  levelText: { fontSize: 14, fontWeight: '700' },
  xpText: { fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, ...SECTION_HEADING },
  milestoneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  milestoneItem: {
    width: '22%',
    minWidth: 72,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  milestoneIcon: { fontSize: 24, marginBottom: 4 },
  milestoneTitle: { fontSize: 9, textAlign: 'center', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statItem: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  replayText: { fontSize: 15, fontWeight: '600' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  shareText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  hiddenShot: { position: 'absolute', opacity: 0, width: 320, pointerEvents: 'none' },
  shotContent: { padding: 32, alignItems: 'center', width: 320 },
  shotTitle: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  shotLevel: { color: '#FFF', fontSize: 20, fontWeight: '600', marginTop: 8 },
  shotStats: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 12, textAlign: 'center' },
});
