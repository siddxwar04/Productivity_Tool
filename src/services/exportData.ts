import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useUserProfileStore } from '../stores/userProfileStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useNotificationSettingsStore } from '../stores/notificationSettingsStore';
import { useHabitsStore } from '../stores/habitsStore';
import { useDeadlinesStore } from '../stores/deadlinesStore';
import { useStreakStore } from '../stores/streakStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useRewardsStore } from '../stores/rewardsStore';
import { useNotesStore } from '../stores/notesStore';
import { useFlashcardsStore } from '../stores/flashcardsStore';
import { useGradesStore } from '../stores/gradesStore';
import { usePlannerStore } from '../stores/plannerStore';
import { useMoodStore } from '../stores/moodStore';
import { useSleepStore } from '../stores/sleepStore';
import { useResourcesStore } from '../stores/resourcesStore';
import { useGroupsStore } from '../stores/groupsStore';
import { usePeersStore } from '../stores/peersStore';
import { useArticleStore } from '../stores/articleStore';

const STORAGE_KEYS = [
  'studyflow-user-profile', 'studyflow-settings', 'studyflow-notifications',
  'studyflow-habits', 'studyflow-deadlines', 'studyflow-streak', 'studyflow-analytics',
  'studyflow-rewards', 'studyflow-notes', 'studyflow-flashcards', 'studyflow-grades',
  'studyflow-planner', 'studyflow-mood', 'studyflow-sleep', 'studyflow-resources',
  'studyflow-groups', 'studyflow-peers', 'article-store',
];

export async function exportAllData(): Promise<void> {
  const data: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    profile: useUserProfileStore.getState(),
    settings: useSettingsStore.getState(),
    notifications: useNotificationSettingsStore.getState(),
    habits: useHabitsStore.getState(),
    deadlines: useDeadlinesStore.getState(),
    streak: useStreakStore.getState(),
    analytics: useAnalyticsStore.getState(),
    rewards: useRewardsStore.getState(),
    notes: useNotesStore.getState(),
    flashcards: useFlashcardsStore.getState(),
    grades: useGradesStore.getState(),
    planner: usePlannerStore.getState(),
    mood: useMoodStore.getState(),
    sleep: useSleepStore.getState(),
    resources: useResourcesStore.getState(),
    groups: useGroupsStore.getState(),
    peers: usePeersStore.getState(),
  };

  const json = JSON.stringify(data, null, 2);
  const path = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}studyflow-export.json`;
  await FileSystem.writeAsStringAsync(path, json);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Export StudyFlow Data' });
  }
}

export async function clearAllData(): Promise<void> {
  await Promise.all(STORAGE_KEYS.map((key) => AsyncStorage.removeItem(key)));
  useUserProfileStore.getState().resetProfile();
  useSettingsStore.getState().resetSettings();
  useNotificationSettingsStore.getState().resetNotifications();
  useHabitsStore.getState().resetHabits();
  useDeadlinesStore.getState().resetDeadlines();
  useStreakStore.getState().resetStreak();
  useAnalyticsStore.getState().resetAnalytics();
  useRewardsStore.getState().resetRewards();
  useNotesStore.getState().resetNotes();
  useFlashcardsStore.getState().resetFlashcards();
  useGradesStore.getState().resetGrades();
  usePlannerStore.getState().resetPlanner();
  useMoodStore.getState().resetMood();
  useSleepStore.getState().resetSleep();
  useResourcesStore.getState().resetResources();
  useGroupsStore.getState().resetGroups();
  usePeersStore.getState().resetPeers();
  useArticleStore.getState().resetArticles();
}
