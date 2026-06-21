import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { PlannerBlock } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../ui/Button';
import { SUBJECT_COLORS } from '../../constants/milestones';
import {
  PLANNER_DAY_INDICES,
  PLANNER_DAY_LABELS,
  PlannerBlockInput,
  PlannerPriority,
} from '../../types/planner';
import { formatDuration } from '../../services/planner/plannerUtils';
import * as Haptics from 'expo-haptics';

interface StudyBlockEditorModalProps {
  visible: boolean;
  initial?: PlannerBlock | null;
  defaultDay: number;
  onClose: () => void;
  onSave: (input: PlannerBlockInput) => boolean;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

const PRIORITIES: PlannerPriority[] = ['low', 'medium', 'high'];

export function StudyBlockEditorModal({
  visible,
  initial,
  defaultDay,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}: StudyBlockEditorModalProps) {
  const { colors } = useTheme();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(defaultDay);
  const [startHour, setStartHour] = useState('9');
  const [startMinute, setStartMinute] = useState('0');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [priority, setPriority] = useState<PlannerPriority>('medium');
  const [color, setColor] = useState(SUBJECT_COLORS[0]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (initial) {
      setSubject(initial.subject ?? initial.title);
      setDescription(initial.description ?? '');
      setDayOfWeek(initial.dayOfWeek);
      setStartHour(String(initial.startHour));
      setStartMinute(String(initial.startMinute));
      setDurationMinutes(String(initial.durationMinutes));
      setPriority(initial.priority ?? 'medium');
      setColor(initial.color);
    } else {
      setSubject('');
      setDescription('');
      setDayOfWeek(defaultDay);
      setStartHour('9');
      setStartMinute('0');
      setDurationMinutes('60');
      setPriority('medium');
      setColor(SUBJECT_COLORS[0]);
    }
  }, [visible, initial, defaultDay]);

  const handleSave = () => {
    if (!subject.trim()) {
      Alert.alert('Missing subject', 'Enter a subject for this study block.');
      return;
    }

    const hour = Number(startHour);
    const minute = Number(startMinute);
    const duration = Number(durationMinutes);

    if (Number.isNaN(hour) || Number.isNaN(minute) || Number.isNaN(duration) || duration <= 0) {
      Alert.alert('Invalid time', 'Check your start time and duration.');
      return;
    }

    const ok = onSave({
      title: subject.trim(),
      subject: subject.trim(),
      description: description.trim(),
      dayOfWeek,
      startHour: hour,
      startMinute: minute,
      durationMinutes: duration,
      color,
      priority,
    });

    if (!ok) {
      Alert.alert('Schedule conflict', 'This block overlaps another session. Adjust the time or day.');
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const durationValue = Number(durationMinutes);
  const endPreview = !Number.isNaN(durationValue)
    ? formatDuration(durationValue)
    : '—';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {initial ? 'Edit study block' : 'Add study block'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Field label="Subject" colors={colors}>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g. Calculus"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
              />
            </Field>

            <Field label="Description" colors={colors}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What will you cover?"
                placeholderTextColor={colors.textMuted}
                multiline
                style={[styles.input, styles.multiline, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
              />
            </Field>

            <Field label="Day" colors={colors}>
              <View style={styles.chipRow}>
                {PLANNER_DAY_INDICES.map((day, index) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setDayOfWeek(day)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: dayOfWeek === day ? colors.primary : colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Text style={{ color: dayOfWeek === day ? '#FFF' : colors.text, fontWeight: '700', fontSize: 11 }}>
                      {PLANNER_DAY_LABELS[index]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <View style={styles.row}>
              <View style={styles.half}>
                <Field label="Start hour" colors={colors}>
                  <TextInput
                    value={startHour}
                    onChangeText={setStartHour}
                    keyboardType="number-pad"
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
                  />
                </Field>
              </View>
              <View style={styles.half}>
                <Field label="Start minute" colors={colors}>
                  <TextInput
                    value={startMinute}
                    onChangeText={setStartMinute}
                    keyboardType="number-pad"
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
                  />
                </Field>
              </View>
            </View>

            <Field label={`Duration (${endPreview})`} colors={colors}>
              <TextInput
                value={durationMinutes}
                onChangeText={setDurationMinutes}
                keyboardType="number-pad"
                style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
              />
            </Field>

            <Field label="Priority" colors={colors}>
              <View style={styles.chipRow}>
                {PRIORITIES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setPriority(item)}
                    style={[
                      styles.chip,
                      { backgroundColor: priority === item ? colors.primary : colors.surfaceSecondary },
                    ]}
                  >
                    <Text style={{ color: priority === item ? '#FFF' : colors.text, fontWeight: '700', textTransform: 'capitalize' }}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <Field label="Color category" colors={colors}>
              <View style={styles.colorRow}>
                {SUBJECT_COLORS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setColor(item)}
                    style={[
                      styles.colorSwatch,
                      {
                        backgroundColor: item,
                        borderColor: color === item ? colors.text : 'transparent',
                        borderWidth: color === item ? 2 : 0,
                      },
                    ]}
                  />
                ))}
              </View>
            </Field>
          </ScrollView>

          <View style={styles.actions}>
            {initial && onDuplicate ? (
              <Button title="Duplicate" onPress={onDuplicate} variant="secondary" style={styles.flex} />
            ) : null}
            {initial && onDelete ? (
              <Button title="Delete" onPress={onDelete} variant="ghost" style={styles.flex} />
            ) : null}
            <Button title="Cancel" onPress={onClose} variant="ghost" style={styles.flex} />
            <Button title="Save" onPress={handleSave} style={styles.flex} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  colors,
  children,
}: {
  label: string;
  colors: { textSecondary: string };
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '800' },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { borderRadius: 10, padding: 12, fontSize: 15 },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: { width: 28, height: 28, borderRadius: 14 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  flex: { flex: 1, minWidth: 100 },
});
