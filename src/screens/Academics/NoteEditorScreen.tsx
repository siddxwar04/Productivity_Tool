import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useNotesStore } from '../../stores/notesStore';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'NoteEditor'>;

const CONTENT_MAX = 5000;

export function NoteEditorScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const noteId = route.params?.noteId;
  const getNote = useNotesStore((s) => s.getNote);
  const addNote = useNotesStore((s) => s.addNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const existing = noteId ? getNote(noteId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [contentFocused, setContentFocused] = useState(false);
  const saveScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setContent(existing.content);
    }
  }, [noteId]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const hasChanges = title.trim() || content.trim();

  const save = () => {
    Animated.sequence([
      Animated.spring(saveScale, { toValue: 0.94, useNativeDriver: true, friction: 8 }),
      Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start(() => {
      if (noteId) {
        updateNote(noteId, { title, content });
      } else {
        addNote({ title: title || 'Untitled', content });
      }
      navigation.goBack();
    });
  };

  return (
    <ScreenWrapper scroll={false}>
      <ScreenHeader
        title={noteId ? 'Edit note' : 'New note'}
        onBack={() => navigation.goBack()}
        right={
          <Animated.View style={{ transform: [{ scale: saveScale }] }}>
            <TouchableOpacity
              onPress={save}
              disabled={!hasChanges}
              style={[
                styles.saveBtn,
                { backgroundColor: hasChanges ? colors.primary : colors.surfaceSecondary },
              ]}
            >
              <Ionicons name="checkmark" size={18} color={hasChanges ? '#FFF' : colors.textMuted} />
            </TouchableOpacity>
          </Animated.View>
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TextInput
          style={[styles.titleInput, { color: colors.text }]}
          placeholder="Title"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
          maxLength={120}
        />

        <View
          style={[
            styles.contentWrap,
            {
              backgroundColor: colors.surface,
              borderColor: contentFocused ? colors.primary : colors.border,
            },
          ]}
        >
          <TextInput
            style={[styles.contentInput, { color: colors.text }]}
            placeholder="Start writing…"
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={(t) => setContent(t.slice(0, CONTENT_MAX))}
            multiline
            textAlignVertical="top"
            onFocus={() => setContentFocused(true)}
            onBlur={() => setContentFocused(false)}
          />
          <View style={styles.contentFooter}>
            <Text style={[styles.wordCount, { color: colors.textMuted }]}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </Text>
            <Text style={[styles.charCount, { color: content.length > CONTENT_MAX * 0.9 ? colors.error : colors.textMuted }]}>
              {content.length}/{CONTENT_MAX}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 8,
    marginBottom: 16,
  },
  contentWrap: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    padding: 0,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  wordCount: { fontSize: 11 },
  charCount: { fontSize: 11 },
  saveBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
