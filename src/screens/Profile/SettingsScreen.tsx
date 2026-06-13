import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUserProfileStore } from '../../stores/userProfileStore';
import { AppearanceMode } from '../../types';
import { exportAllData, clearAllData } from '../../services/exportData';
import { exportCalendarIcs } from '../../services/calendarService';
import { signInWithGoogle } from '../../services/supabaseClient';
import { ProfileStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;
};

const APPEARANCE_OPTIONS: { label: string; value: AppearanceMode }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

export function SettingsScreen({ navigation }: Props) {
  const { colors, appearance, setAppearance } = useTheme();
  const pomodoro = useSettingsStore((s) => s.pomodoro);
  const focusModeApps = useSettingsStore((s) => s.focusModeApps);
  const setPomodoro = useSettingsStore((s) => s.setPomodoro);
  const addFocusModeApp = useSettingsStore((s) => s.addFocusModeApp);
  const removeFocusModeApp = useSettingsStore((s) => s.removeFocusModeApp);

  const displayName = useUserProfileStore((s) => s.displayName);
  const university = useUserProfileStore((s) => s.university);
  const course = useUserProfileStore((s) => s.course);
  const setDisplayName = useUserProfileStore((s) => s.setDisplayName);
  const setUniversity = useUserProfileStore((s) => s.setUniversity);
  const setCourse = useUserProfileStore((s) => s.setCourse);

  const [newApp, setNewApp] = useState('');
  const [nameEdit, setNameEdit] = useState(displayName);
  const [uniEdit, setUniEdit] = useState(university);
  const [courseEdit, setCourseEdit] = useState(course);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const saveProfile = () => {
    setDisplayName(nameEdit.trim() || displayName);
    setUniversity(uniEdit.trim());
    setCourse(courseEdit.trim());
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const confirmClear = () => {
    Alert.alert(
      'Clear all data',
      'This will permanently delete all your StudyFlow data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ],
    );
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    Alert.alert(error ? 'Sign-in' : 'Success', error ?? 'Google sign-in initiated.');
  };

  return (
    <ScreenWrapper>
      <Text style={[styles.title, { color: colors.text }]} onPress={() => navigation.goBack()}>
        ← Settings
      </Text>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Study preferences</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Work duration (minutes)</Text>
        <View style={styles.durationRow}>
          {[15, 25, 30, 45, 50].map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setPomodoro({ ...pomodoro, workMinutes: m })}
              style={[
                styles.chip,
                {
                  backgroundColor: pomodoro.workMinutes === m ? colors.primary : colors.surfaceSecondary,
                },
              ]}
            >
              <Text style={{ color: pomodoro.workMinutes === m ? '#FFF' : colors.text, fontWeight: '600' }}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Focus mode blocked apps</Text>
        <View style={styles.appsList}>
          {focusModeApps.map((app) => (
            <View key={app} style={[styles.appChip, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={{ color: colors.text }}>{app}</Text>
              <TouchableOpacity onPress={() => removeFocusModeApp(app)}>
                <Text style={{ color: colors.error, marginLeft: 8 }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.addAppRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, flex: 1 }]}
            placeholder="Add app name"
            placeholderTextColor={colors.textMuted}
            value={newApp}
            onChangeText={setNewApp}
          />
          <TouchableOpacity
            onPress={() => {
              if (newApp.trim()) {
                addFocusModeApp(newApp.trim());
                setNewApp('');
              }
            }}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Add</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={styles.appearanceRow}>
          {APPEARANCE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setAppearance(opt.value)}
              style={[
                styles.appearanceBtn,
                {
                  backgroundColor: appearance === opt.value ? colors.primary : colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={{
                color: appearance === opt.value ? '#FFF' : colors.text,
                fontWeight: '600',
              }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
        <TouchableOpacity style={styles.actionRow} onPress={exportAllData}>
          <Text style={[styles.actionText, { color: colors.primary }]}>Export all data as JSON</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={exportCalendarIcs}>
          <Text style={[styles.actionText, { color: colors.primary }]}>Sync deadlines to calendar (.ics)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={confirmClear}>
          <Text style={[styles.actionText, { color: colors.error }]}>Clear all data</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Display name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, marginBottom: 12 }]}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          value={nameEdit}
          onChangeText={setNameEdit}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>University / College</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, marginBottom: 12 }]}
          placeholder="e.g. Presidency University"
          placeholderTextColor={colors.textMuted}
          value={uniEdit}
          onChangeText={setUniEdit}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Course / Program</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, marginBottom: 12 }]}
          placeholder="e.g. Computer Science Networks"
          placeholderTextColor={colors.textMuted}
          value={courseEdit}
          onChangeText={setCourseEdit}
        />
        <TouchableOpacity
          onPress={saveProfile}
          style={[styles.addBtn, { backgroundColor: colors.primary, paddingVertical: 12, alignItems: 'center', marginBottom: 4 }]}
        >
          <Text style={{ color: '#FFF', fontWeight: '600' }}>Save profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={handleGoogleSignIn}>
          <Text style={[styles.actionText, { color: colors.primary }]}>Sign in with Google</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <Text style={[styles.aboutRow, { color: colors.textSecondary }]}>Version {version}</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://studyflow.app/privacy')}>
          <Text style={[styles.actionText, { color: colors.primary }]}>Privacy policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:feedback@studyflow.app')}>
          <Text style={[styles.actionText, { color: colors.primary, marginTop: 12 }]}>Send feedback</Text>
        </TouchableOpacity>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  appsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  appChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addAppRow: { flexDirection: 'row', gap: 8 },
  input: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  addBtn: { paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  appearanceRow: { flexDirection: 'row', gap: 8 },
  appearanceBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  actionRow: { paddingVertical: 12 },
  actionText: { fontSize: 16, fontWeight: '500' },
  nameRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  aboutRow: { fontSize: 14, marginBottom: 12 },
});
