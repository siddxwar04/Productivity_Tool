import React, { memo, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { usePlannerStore } from '../../stores/plannerStore';
import { useUserProfileStore } from '../../stores/userProfileStore';
import { StudyStackParamList } from '../../navigation/types';
import { PlannerAnalyticsPanel } from '../../components/planner/PlannerAnalyticsPanel';
import { WeeklyTimetableGrid } from '../../components/planner/WeeklyTimetableGrid';
import { DayTimelineView } from '../../components/planner/DayTimelineView';
import { StudyBlockEditorModal } from '../../components/planner/StudyBlockEditorModal';
import {
  PLANNER_DAY_INDICES,
  PLANNER_DAY_LABELS,
  PlannerBlockInput,
  PlannerViewMode,
} from '../../types/planner';
import { computeWeeklyAnalytics } from '../../services/planner/plannerUtils';
import { PlannerBlock } from '../../types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Planner'>;

export function PlannerScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const blocks = usePlannerStore((s) => s.blocks);
  const addBlock = usePlannerStore((s) => s.addBlock);
  const updateBlock = usePlannerStore((s) => s.updateBlock);
  const deleteBlock = usePlannerStore((s) => s.deleteBlock);
  const duplicateBlock = usePlannerStore((s) => s.duplicateBlock);
  const moveBlock = usePlannerStore((s) => s.moveBlock);
  const toggleBlockComplete = usePlannerStore((s) => s.toggleBlockComplete);
  const studyHoursPerDay = useUserProfileStore((s) => s.goals.studyHoursPerDay);

  const [viewMode, setViewMode] = useState<PlannerViewMode>('week');
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PlannerBlock | null>(null);

  const weeklyGoalHours = studyHoursPerDay * 7;
  const analytics = useMemo(
    () => computeWeeklyAnalytics(blocks, weeklyGoalHours),
    [blocks, weeklyGoalHours],
  );

  const selectedDayLabel =
    PLANNER_DAY_LABELS[PLANNER_DAY_INDICES.indexOf(selectedDay as (typeof PLANNER_DAY_INDICES)[number])] ?? 'Day';

  const dayBlocks = useMemo(
    () => blocks.filter((b) => b.dayOfWeek === selectedDay),
    [blocks, selectedDay],
  );

  const openCreate = () => {
    setEditingBlock(null);
    setEditorVisible(true);
  };

  const openEdit = (block: PlannerBlock) => {
    setEditingBlock(block);
    setEditorVisible(true);
  };

  const handleSave = (input: PlannerBlockInput): boolean => {
    if (editingBlock) {
      return updateBlock(editingBlock.id, {
        title: input.title,
        subject: input.subject,
        description: input.description,
        dayOfWeek: input.dayOfWeek,
        startHour: input.startHour,
        startMinute: input.startMinute,
        durationMinutes: input.durationMinutes,
        color: input.color,
        priority: input.priority,
        subjectId: input.subjectId,
      });
    }

    const id = addBlock({
      title: input.title,
      subject: input.subject,
      description: input.description,
      dayOfWeek: input.dayOfWeek,
      startHour: input.startHour,
      startMinute: input.startMinute,
      durationMinutes: input.durationMinutes,
      color: input.color,
      priority: input.priority,
      subjectId: input.subjectId,
    });
    return id.length > 0;
  };

  const handleMove = (blockId: string, dayOfWeek: number, startHour: number, startMinute: number) => {
    const ok = moveBlock(blockId, dayOfWeek, startHour, startMinute);
    if (!ok) {
      Alert.alert('Schedule conflict', 'That time slot overlaps another study session.');
    }
  };

  const handleDelete = () => {
    if (!editingBlock) return;
    Alert.alert('Delete block', 'Remove this study session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBlock(editingBlock.id);
          setEditorVisible(false);
          setEditingBlock(null);
        },
      },
    ]);
  };

  const handleDuplicate = () => {
    if (!editingBlock) return;
    const id = duplicateBlock(editingBlock.id);
    if (!id) {
      Alert.alert('Could not duplicate', 'Try a different time slot to avoid overlap.');
      return;
    }
    setEditorVisible(false);
    setEditingBlock(null);
  };

  return (
    <ScreenWrapper scroll={false}>
      <ScreenHeader title="Weekly planner" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <PlannerAnalyticsPanel analytics={analytics} />

        <View style={[styles.toggleRow, { backgroundColor: colors.surfaceSecondary }]}>
          <MemoToggleButton
            label="Week grid"
            active={viewMode === 'week'}
            onPress={() => setViewMode('week')}
            colors={colors}
          />
          <MemoToggleButton
            label="Day timeline"
            active={viewMode === 'day'}
            onPress={() => setViewMode('day')}
            colors={colors}
          />
        </View>

        {viewMode === 'week' ? (
          <WeeklyTimetableGrid
            blocks={blocks}
            onBlockPress={openEdit}
            onBlockMove={handleMove}
          />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPicker}>
              {PLANNER_DAY_INDICES.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={[
                    styles.dayChip,
                    { backgroundColor: selectedDay === day ? colors.primary : colors.surfaceSecondary },
                  ]}
                >
                  <Text style={{ color: selectedDay === day ? '#FFF' : colors.text, fontWeight: '700' }}>
                    {PLANNER_DAY_LABELS[index]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <DayTimelineView
              dayOfWeek={selectedDay}
              dayLabel={selectedDayLabel}
              blocks={dayBlocks}
              allBlocks={blocks}
              onBlockPress={openEdit}
              onBlockMove={handleMove}
            />
          </>
        )}

        <Button title="+ Add study block" onPress={openCreate} variant="secondary" style={styles.addBtn} />

        {editingBlock ? (
          <Button
            title={editingBlock.completed ? 'Mark incomplete' : 'Mark complete'}
            onPress={() => toggleBlockComplete(editingBlock.id)}
            variant="ghost"
          />
        ) : null}
      </ScrollView>

      <StudyBlockEditorModal
        visible={editorVisible}
        initial={editingBlock}
        defaultDay={selectedDay}
        onClose={() => {
          setEditorVisible(false);
          setEditingBlock(null);
        }}
        onSave={handleSave}
        onDelete={editingBlock ? handleDelete : undefined}
        onDuplicate={editingBlock ? handleDuplicate : undefined}
      />
    </ScreenWrapper>
  );
}

function ToggleButton({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: { primary: string; surface: string; text: string };
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.toggleBtn,
        { backgroundColor: active ? colors.primary : 'transparent' },
      ]}
    >
      <Text style={{ color: active ? '#FFF' : colors.text, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );
}

const MemoToggleButton = memo(ToggleButton);

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  dayPicker: { marginBottom: 12 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  addBtn: { marginTop: 16 },
});
