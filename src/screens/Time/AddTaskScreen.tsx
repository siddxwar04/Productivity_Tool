import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudyStackParamList } from '../../navigation/types';
import { SECTION_HEADING } from '../../utils/typography';

type Props = NativeStackScreenProps<StudyStackParamList, 'AddTask'>;

type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  priority: Priority;
}

const COLORS = {
  background: '#0d0d1a',
  card: '#1a1a2e',
  accent: '#6c5ce7',
  high: '#d63031',
  low: '#3a3a52',
  text: '#ffffff',
  textMuted: '#8a8aa0',
  border: '#2a2a44',
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86400000);
}

function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function daysLeftLabel(daysLeft: number): string {
  if (daysLeft < 0) return 'Overdue';
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return '1 day left';
  return `${daysLeft} days left`;
}

function priorityColor(priority: Priority): string {
  if (priority === 'high') return COLORS.high;
  if (priority === 'medium') return COLORS.accent;
  return COLORS.low;
}

function PulsingDot() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <View style={styles.dotWrap}>
      <Animated.View
        style={[styles.dotPulse, { transform: [{ scale }], opacity }]}
      />
      <View style={styles.dotCore} />
    </View>
  );
}

interface CalendarModalProps {
  visible: boolean;
  selected: Date | null;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

function CalendarModal({ visible, selected, onClose, onSelect }: CalendarModalProps) {
  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState<Date>(selected ?? today);

  useEffect(() => {
    if (visible) setViewDate(selected ?? today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));

  const goMonth = (delta: number) => setViewDate(new Date(year, month + delta, 1));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => goMonth(-1)} style={styles.navBtn}>
              <Text style={styles.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{`${MONTHS[month]} ${year}`}</Text>
            <TouchableOpacity onPress={() => goMonth(1)} style={styles.navBtn}>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w) => (
              <View key={w} style={styles.dayCell}>
                <Text style={styles.weekday}>{w}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((date, idx) => {
              if (!date) {
                // eslint-disable-next-line react/no-array-index-key
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }
              const isPast = daysBetween(today, date) < 0;
              const isSelected = selected != null && daysBetween(selected, date) === 0;
              const isToday = daysBetween(today, date) === 0;
              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={styles.dayCell}
                  disabled={isPast}
                  onPress={() => {
                    onSelect(date);
                    onClose();
                  }}
                >
                  <View style={[styles.dayInner, isSelected && styles.daySelected]}>
                    <Text
                      style={[
                        styles.dayText,
                        isPast && styles.dayDisabled,
                        isToday && !isSelected && styles.dayToday,
                        isSelected && styles.daySelectedText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.calendarClose} onPress={onClose}>
            <Text style={styles.calendarCloseText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export function AddTaskScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alert, setAlert] = useState<{ title: string } | null>(null);

  const canSave = title.trim().length > 0 && dueDate != null;

  const handleSave = () => {
    if (!canSave || dueDate == null) return;

    const daysLeft = daysBetween(new Date(), dueDate);
    let finalPriority = priority;
    let escalated = false;

    if (daysLeft <= 1 && priority === 'medium') {
      finalPriority = 'high';
      escalated = true;
    }

    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      dueDate,
      priority: finalPriority,
    };

    setTasks((prev) => [newTask, ...prev]);

    if (escalated) {
      setAlert({ title: newTask.title });
    }

    setTitle('');
    setPriority('medium');
    setDueDate(null);
  };

  const priorities: Priority[] = useMemo(() => ['low', 'medium', 'high'], []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Add Assignment</Text>
          <View style={styles.backBtn} />
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Assignment name"
          placeholderTextColor={COLORS.textMuted}
        />

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {priorities.map((p) => {
            const active = priority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBtn,
                  active && { backgroundColor: priorityColor(p), borderColor: priorityColor(p) },
                ]}
                onPress={() => setPriority(p)}
                activeOpacity={0.8}
              >
                <Text style={[styles.priorityText, active && styles.priorityTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Due date</Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setCalendarOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dateText, dueDate == null && styles.datePlaceholder]}>
            {dueDate != null ? formatDate(dueDate) : 'Select a due date'}
          </Text>
          <Text style={styles.dateIcon}>📅</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveText}>Save Assignment</Text>
        </TouchableOpacity>

        {tasks.length > 0 && <Text style={styles.sectionTitle}>Assignments</Text>}

        {tasks.map((task) => {
          const daysLeft = daysBetween(new Date(), task.dueDate);
          const showPulse = task.priority === 'high' && daysLeft <= 1;
          return (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskTopRow}>
                <View style={styles.taskTitleWrap}>
                  {showPulse && <PulsingDot />}
                  <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: priorityColor(task.priority) }]}>
                  <Text style={styles.badgeText}>{task.priority.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.taskMetaRow}>
                <Text style={styles.taskMeta}>{formatDate(task.dueDate)}</Text>
                <Text
                  style={[
                    styles.taskMeta,
                    daysLeft <= 1 && { color: COLORS.high, fontWeight: '700' },
                  ]}
                >
                  {daysLeftLabel(daysLeft)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <CalendarModal
        visible={calendarOpen}
        selected={dueDate}
        onClose={() => setCalendarOpen(false)}
        onSelect={setDueDate}
      />

      <Modal visible={alert != null} transparent animationType="fade" onRequestClose={() => setAlert(null)}>
        <View style={styles.overlay}>
          <View style={styles.alertCard}>
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>Upgraded to HIGH priority</Text>
            </View>
            <Text style={styles.alertTitle}>{alert?.title}</Text>
            <Text style={styles.alertMessage}>
              Deadline tomorrow! This task has been upgraded to HIGH priority because it is due
              in 1 day and is not yet completed.
            </Text>
            <TouchableOpacity style={styles.alertBtn} onPress={() => setAlert(null)} activeOpacity={0.85}>
              <Text style={styles.alertBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: COLORS.text, fontSize: 34, lineHeight: 34, marginTop: -4 },
  screenTitle: { flex: 1, color: COLORS.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },

  label: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginTop: 18, marginBottom: 8 },

  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 16,
  },

  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  priorityText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },
  priorityTextActive: { color: COLORS.text },

  dateBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  datePlaceholder: { color: COLORS.textMuted, fontWeight: '400' },
  dateIcon: { fontSize: 16 },

  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },

  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginTop: 32, marginBottom: 12, ...SECTION_HEADING },

  taskCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  taskTitleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  taskTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600', flexShrink: 1 },
  taskMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  taskMeta: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },

  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: COLORS.text, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  dotWrap: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  dotPulse: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.high },
  dotCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.high },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  calendarCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  navArrow: { color: COLORS.text, fontSize: 26, lineHeight: 28, marginTop: -2 },
  calendarTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayInner: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: COLORS.accent },
  weekday: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  dayText: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  dayDisabled: { color: COLORS.border },
  dayToday: { color: COLORS.accent, fontWeight: '700' },
  daySelectedText: { color: COLORS.text, fontWeight: '700' },
  calendarClose: { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  calendarCloseText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },

  alertCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alertBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.high,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
  },
  alertBadgeText: { color: COLORS.text, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  alertTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  alertMessage: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 20 },
  alertBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  alertBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
});
