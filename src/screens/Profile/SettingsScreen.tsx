import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUserProfileStore } from '../../stores/userProfileStore';
import { AppearanceMode, Subject } from '../../types';
import { SUBJECT_COLORS } from '../../constants/milestones';
import { generateId } from '../../utils/helpers';
import { exportAllData, clearAllData } from '../../services/exportData';
import { exportCalendarIcs } from '../../services/calendarService';
import { signInWithGoogle } from '../../services/supabaseClient';
import { ProfileStackParamList } from '../../navigation/types';
import { SECTION_HEADING, LABEL } from '../../utils/typography';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;
};

const APPEARANCE_OPTIONS: { label: string; value: AppearanceMode; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Light', value: 'light', icon: 'sunny-outline' },
  { label: 'Dark', value: 'dark', icon: 'moon-outline' },
  { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
];

interface ActionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

function ActionRow({ icon, label, onPress, destructive, colors }: ActionRowProps) {
  const color = destructive ? colors.error : colors.primary;
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.actionText, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

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
  const subjects = useUserProfileStore((s) => s.subjects);
  const setDisplayName = useUserProfileStore((s) => s.setDisplayName);
  const setUniversity = useUserProfileStore((s) => s.setUniversity);
  const setCourse = useUserProfileStore((s) => s.setCourse);
  const setSubjects = useUserProfileStore((s) => s.setSubjects);
  const replayOnboarding = useUserProfileStore((s) => s.replayOnboarding);

  const [newApp, setNewApp] = useState('');
  const [nameEdit, setNameEdit] = useState(displayName);
  const [uniEdit, setUniEdit] = useState(university);
  const [courseEdit, setCourseEdit] = useState(course);
  const [subjectsEdit, setSubjectsEdit] = useState<Subject[]>(
    subjects.length > 0
      ? subjects
      : [{ id: generateId(), name: '', color: SUBJECT_COLORS[0] }],
  );
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const saveProfile = () => {
    setDisplayName(nameEdit.trim() || displayName);
    setUniversity(uniEdit.trim());
    setCourse(courseEdit.trim());
    setSubjects(subjectsEdit.filter((s) => s.name.trim()));
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const updateSubjectName = (id: string, name: string) => {
    setSubjectsEdit((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const addSubjectRow = () => {
    if (subjectsEdit.length >= 8) return;
    setSubjectsEdit((prev) => [
      ...prev,
      { id: generateId(), name: '', color: SUBJECT_COLORS[prev.length % SUBJECT_COLORS.length] },
    ]);
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

  const confirmClear = () => {
    Alert.alert(
      'Clear all data',
      'This will permanently delete all your Nexara data. This cannot be undone.',
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

  const inputStyle = (field: string) => [
    styles.input,
    {
      backgroundColor: colors.surfaceSecondary,
      color: colors.text,
      borderColor: focusedField === field ? colors.primary : colors.border,
      borderWidth: 1.5,
    },
  ];

  return (
    <ScreenWrapper>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="timer-outline" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Study preferences</Text>
        </View>
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
                  borderColor: pomodoro.workMinutes === m ? colors.primary : colors.border,
                  borderWidth: 1,
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
            <View key={app} style={[styles.appChip, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={{ color: colors.text, fontSize: 13 }}>{app}</Text>
              <TouchableOpacity onPress={() => removeFocusModeApp(app)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 4 }}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.addAppRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, flex: 1, borderColor: focusedField === 'app' ? colors.primary : colors.border, borderWidth: 1.5 }]}
            placeholder="Add app name"
            placeholderTextColor={colors.textMuted}
            value={newApp}
            onChangeText={setNewApp}
            onFocus={() => setFocusedField('app')}
            onBlur={() => setFocusedField(null)}
          />
          <TouchableOpacity
            onPress={() => { if (newApp.trim()) { addFocusModeApp(newApp.trim()); setNewApp(''); } }}
            style={[styles.addBtn, { backgroundColor: colors.primary, opacity: newApp.trim() ? 1 : 0.5 }]}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette-outline" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        </View>
        <View style={styles.appearanceRow}>
          {APPEARANCE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setAppearance(opt.value)}
              style={[
                styles.appearanceBtn,
                {
                  backgroundColor: appearance === opt.value ? colors.primary : colors.surfaceSecondary,
                  borderColor: appearance === opt.value ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons name={opt.icon} size={16} color={appearance === opt.value ? '#FFF' : colors.textSecondary} />
              <Text style={{ color: appearance === opt.value ? '#FFF' : colors.text, fontWeight: '600', fontSize: 13 }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        </View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Display name</Text>
        <TextInput style={inputStyle('name')} placeholder="Your name" placeholderTextColor={colors.textMuted} value={nameEdit} onChangeText={setNameEdit} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>University / College</Text>
        <TextInput style={inputStyle('uni')} placeholder="e.g. Presidency University" placeholderTextColor={colors.textMuted} value={uniEdit} onChangeText={setUniEdit} onFocus={() => setFocusedField('uni')} onBlur={() => setFocusedField(null)} />
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>Course / Program</Text>
        <TextInput style={inputStyle('course')} placeholder="e.g. Computer Science" placeholderTextColor={colors.textMuted} value={courseEdit} onChangeText={setCourseEdit} onFocus={() => setFocusedField('course')} onBlur={() => setFocusedField(null)} />
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>Subjects</Text>
        {subjectsEdit.map((subject, index) => (
          <TextInput
            key={subject.id}
            style={[inputStyle(`subject-${subject.id}`), { marginBottom: 8 }]}
            placeholder={`Subject ${index + 1}`}
            placeholderTextColor={colors.textMuted}
            value={subject.name}
            onChangeText={(name) => updateSubjectName(subject.id, name)}
            onFocus={() => setFocusedField(`subject-${subject.id}`)}
            onBlur={() => setFocusedField(null)}
          />
        ))}
        {subjectsEdit.length < 8 && (
          <TouchableOpacity onPress={addSubjectRow} style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>+ Add subject</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={saveProfile} style={[styles.saveProfileBtn, { backgroundColor: colors.primary, marginBottom: 4 }]}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
          <Text style={styles.saveProfileText}>Save profile</Text>
        </TouchableOpacity>
        <ActionRow icon="logo-google" label="Sign in with Google" onPress={handleGoogleSignIn} colors={colors} />
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="server-outline" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
        </View>
        <ActionRow icon="download-outline" label="Export all data as JSON" onPress={exportAllData} colors={colors} />
        <ActionRow icon="calendar-outline" label="Sync deadlines to calendar (.ics)" onPress={exportCalendarIcs} colors={colors} />
        <ActionRow icon="refresh-outline" label="Show welcome screen again" onPress={confirmReplayOnboarding} colors={colors} />
        <ActionRow icon="trash-outline" label="Clear all data" onPress={confirmClear} destructive colors={colors} />
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        </View>
        <View style={[styles.versionRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.versionLabel, { color: colors.textSecondary }]}>Version</Text>
          <Text style={[styles.versionValue, { color: colors.text }]}>{version}</Text>
        </View>
        <ActionRow icon="shield-checkmark-outline" label="Privacy policy" onPress={() => Linking.openURL('https://nexara.app/privacy')} colors={colors} />
        <ActionRow icon="mail-outline" label="Send feedback" onPress={() => Linking.openURL('mailto:feedback@nexara.app')} colors={colors} />
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', ...SECTION_HEADING },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, ...LABEL },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  appsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  appChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  addAppRow: { flexDirection: 'row', gap: 8 },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  addBtn: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  appearanceRow: { flexDirection: 'row', gap: 8 },
  appearanceBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  saveProfileBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10, marginBottom: 4 },
  saveProfileText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  actionIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionText: { flex: 1, fontSize: 15, fontWeight: '500' },
  versionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 4 },
  versionLabel: { fontSize: 15 },
  versionValue: { fontSize: 15, fontWeight: '600' },
});
