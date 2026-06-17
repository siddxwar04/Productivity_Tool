import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useNotesStore } from '../../stores/notesStore';
import { Note } from '../../types';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Notes'>;

function NoteCard({
  note,
  onPress,
  onLongPress,
}: {
  note: Note;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {note.title || 'Untitled'}
            </Text>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {new Date(note.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>

        {note.content ? (
          <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
            {note.content}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={[styles.wordChip, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.wordCount, { color: colors.textMuted }]}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </Text>
          </View>
          <View style={styles.deleteHint}>
            <Ionicons name="trash-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.deleteHintText, { color: colors.textMuted }]}>Hold to delete</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function NotesListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const notes = useNotesStore((s) => s.notes);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  const sorted = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Notes"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate('NoteEditor', {})}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        }
      />

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="document-text-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No notes yet</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Tap + to write your first study note.
          </Text>
        </View>
      ) : (
        sorted.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            onPress={() => navigation.navigate('NoteEditor', { noteId: n.id })}
            onLongPress={() => deleteNote(n.id)}
          />
        ))
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  date: { fontSize: 11 },
  preview: { fontSize: 14, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  wordCount: { fontSize: 11 },
  deleteHint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deleteHintText: { fontSize: 11 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
