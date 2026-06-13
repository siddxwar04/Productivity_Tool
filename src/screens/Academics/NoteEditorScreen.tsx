import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useNotesStore } from '../../stores/notesStore';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'NoteEditor'>;

export function NoteEditorScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const noteId = route.params?.noteId;
  const getNote = useNotesStore((s) => s.getNote);
  const addNote = useNotesStore((s) => s.addNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const existing = noteId ? getNote(noteId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setContent(existing.content);
    }
  }, [noteId]);

  const save = () => {
    if (noteId) {
      updateNote(noteId, { title, content });
    } else {
      addNote({ title: title || 'Untitled', content });
    }
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title={noteId ? 'Edit note' : 'New note'} onBack={() => navigation.goBack()} />
      <TextInput
        style={[styles.title, { color: colors.text }]}
        placeholder="Title"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.content, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
        placeholder="Start writing..."
        placeholderTextColor={colors.textMuted}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />
      <Button title="Save" onPress={save} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  content: { flex: 1, minHeight: 300, borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, lineHeight: 24, marginBottom: 20 },
});
