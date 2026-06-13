import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { MOOD_EMOJI, useMoodStore } from '../../stores/moodStore';
import { WellnessStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'Mood'> | NativeStackScreenProps<RootStackParamList, 'LogMood'>;

export function LogMoodScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const logMood = useMoodStore((s) => s.logMood);
  const getRecent = useMoodStore((s) => s.getRecent);
  const [selected, setSelected] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [note, setNote] = useState('');

  const save = () => {
    logMood(selected, note || undefined);
    navigation.goBack();
  };

  const recent = getRecent(7);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Log mood" onBack={() => navigation.goBack()} />
      <Text style={[styles.question, { color: colors.text }]}>How are you feeling?</Text>
      <View style={styles.moods}>
        {([1, 2, 3, 4, 5] as const).map((m) => (
          <TouchableOpacity key={m} onPress={() => setSelected(m)} style={[styles.moodBtn, selected === m && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
            <Text style={styles.emoji}>{MOOD_EMOJI[m - 1]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={[styles.note, { color: colors.text, backgroundColor: colors.surfaceSecondary }]} placeholder="Optional note..." placeholderTextColor={colors.textMuted} value={note} onChangeText={setNote} multiline />
      <Button title="Save mood" onPress={save} />
      {recent.length > 0 && (
        <View style={styles.history}>
          <Text style={[styles.histTitle, { color: colors.textSecondary }]}>Recent</Text>
          {recent.slice(0, 5).map((e) => (
            <Text key={e.id} style={[styles.histItem, { color: colors.text }]}>
              {e.date}: {MOOD_EMOJI[e.mood - 1]} {e.note ?? ''}
            </Text>
          ))}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  question: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  moods: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  moodBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  emoji: { fontSize: 28 },
  note: { borderRadius: 12, padding: 14, fontSize: 15, minHeight: 80, marginBottom: 20 },
  history: { marginTop: 32 },
  histTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  histItem: { fontSize: 14, marginBottom: 4 },
});
