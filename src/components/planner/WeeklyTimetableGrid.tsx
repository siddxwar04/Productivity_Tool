import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlannerBlock } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import {
  PLANNER_DAY_INDICES,
  PLANNER_DAY_LABELS,
  PLANNER_END_HOUR,
  PLANNER_ROW_HEIGHT,
  PLANNER_START_HOUR,
} from '../../types/planner';
import { findConflicts } from '../../services/planner/plannerUtils';
import { DraggableStudyBlock } from './DraggableStudyBlock';

interface WeeklyTimetableGridProps {
  blocks: PlannerBlock[];
  onBlockPress: (block: PlannerBlock) => void;
  onBlockMove: (blockId: string, dayOfWeek: number, startHour: number, startMinute: number) => void;
}

const HOURS = Array.from(
  { length: PLANNER_END_HOUR - PLANNER_START_HOUR },
  (_, i) => PLANNER_START_HOUR + i,
);

export function WeeklyTimetableGrid({ blocks, onBlockPress, onBlockMove }: WeeklyTimetableGridProps) {
  const { colors } = useTheme();
  const columnWidth = 92;
  const gridHeight = HOURS.length * PLANNER_ROW_HEIGHT;

  const blocksByDay = useMemo(() => {
    const map = new Map<number, PlannerBlock[]>();
    for (const block of blocks) {
      const dayBlocks = map.get(block.dayOfWeek);
      if (dayBlocks) {
        dayBlocks.push(block);
      } else {
        map.set(block.dayOfWeek, [block]);
      }
    }
    return map;
  }, [blocks]);

  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    for (const block of blocks) {
      if (findConflicts(blocks, block).length > 0) {
        ids.add(block.id);
      }
    }
    return ids;
  }, [blocks]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.headerRow}>
          <View style={[styles.timeHeader, { borderColor: colors.border }]} />
          {PLANNER_DAY_LABELS.map((label) => (
            <View
              key={label}
              style={[styles.dayHeader, { width: columnWidth, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
            >
              <Text style={[styles.dayHeaderText, { color: colors.text }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.body}>
          <View style={[styles.timeColumn, { height: gridHeight, borderColor: colors.border }]}>
            {HOURS.map((hour) => (
              <View key={hour} style={[styles.timeCell, { height: PLANNER_ROW_HEIGHT, borderColor: colors.border }]}>
                <Text style={[styles.timeLabel, { color: colors.textMuted }]}>
                  {hour}:00
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.dayColumns}>
            {PLANNER_DAY_INDICES.map((dayOfWeek, dayIndex) => {
              const dayBlocks = blocksByDay.get(dayOfWeek) ?? [];
              return (
                <View
                  key={dayOfWeek}
                  style={[
                    styles.dayColumn,
                    {
                      width: columnWidth,
                      height: gridHeight,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  {HOURS.map((hour) => (
                    <View
                      key={hour}
                      style={[styles.gridLine, { top: (hour - PLANNER_START_HOUR) * PLANNER_ROW_HEIGHT, borderColor: colors.border }]}
                    />
                  ))}

                  {dayBlocks.map((block) => (
                    <DraggableStudyBlock
                      key={block.id}
                      block={block}
                      dayColumnWidth={columnWidth}
                      dayIndex={dayIndex}
                      dayIndices={PLANNER_DAY_INDICES}
                      hasConflict={conflictIds.has(block.id)}
                      onPress={() => onBlockPress(block)}
                      onDragEnd={(day, hour, minute) => onBlockMove(block.id, day, hour, minute)}
                    />
                  ))}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row' },
  timeHeader: { width: 48, borderRightWidth: StyleSheet.hairlineWidth },
  dayHeader: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  dayHeaderText: { fontSize: 12, fontWeight: '800' },
  body: { flexDirection: 'row' },
  timeColumn: { width: 48, borderRightWidth: StyleSheet.hairlineWidth },
  timeCell: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingLeft: 4,
  },
  timeLabel: { fontSize: 10, fontWeight: '600' },
  dayColumns: { flexDirection: 'row' },
  dayColumn: { position: 'relative', borderRightWidth: StyleSheet.hairlineWidth },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
