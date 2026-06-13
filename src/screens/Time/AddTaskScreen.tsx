import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useDeadlinesStore } from '../../stores/deadlinesStore';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'AddTask'>;

export function AddTaskScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const addDeadline = useDeadlinesStore((s) => s.addDeadline);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000));
  const [showPicker, setShowPicker] = useState(false);

  const save = () => {
    if (!title.trim()) return;
    addDeadline({ title: title.trim(), dueAt: dueDate.toISOString(), priority, completed: false });
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Add assignment" onBack={() => navigation.goBack()} />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        value={title}
        onChangeText={setTitle}
        placeholder="Assignment name"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
      <View style={styles.row}>
        {(['low', 'medium', 'high'] as const).map((p) => (
          <Button
            key={p}
            title={p}
            variant={priority === p ? 'primary' : 'secondary'}
            onPress={() => setPriority(p)}
            style={styles.chip}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Due date</Text>
      <Button title={dueDate.toLocaleDateString()} onPress={() => setShowPicker(true)} variant="secondary" />
      {showPicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => { if (Platform.OS === 'android') setShowPicker(false); if (d) setDueDate(d); }}
        />
      )}
      <Button title="Save assignment" onPress={save} style={styles.save} disabled={!title.trim()} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1 },
  save: { marginTop: 32 },
});
