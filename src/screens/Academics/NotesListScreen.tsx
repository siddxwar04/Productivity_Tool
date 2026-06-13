import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useNotesStore } from '../../stores/notesStore';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Notes'>;

export function NotesListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Notes" onBack={() => navigation.goBack()} />
      <Button title="+ New note" onPress={() => navigation.navigate('NoteEditor', {})} style={styles.add} />
      {notes.map((n) => (
        <TouchableOpacity
          key={n.id}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('NoteEditor', { noteId: n.id })}
          onLongPress={() => deleteNote(n.id)}
        >
          <Text style={[styles.title, { color: colors.text }]}>{n.title || 'Untitled'}</Text>
          <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>{n.content}</Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {new Date(n.updatedAt).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      ))}
      {notes.length === 0 && <Text style={[styles.empty, { color: colors.textSecondary }]}>No notes yet</Text>}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  add: { marginBottom: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  preview: { fontSize: 14, lineHeight: 20 },
  date: { fontSize: 12, marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 40 },
});
