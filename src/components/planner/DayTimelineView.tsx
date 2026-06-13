import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlannerBlock } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import {
  PLANNER_END_HOUR,
  PLANNER_ROW_HEIGHT,
  PLANNER_START_HOUR,
} from '../../types/planner';
import { findConflicts, formatBlockTime, getBlockHeight, getBlockTopOffset, getEndTimeLabel, getSubjectLabel } from '../../services/planner/plannerUtils';
import { DraggableStudyBlock } from './DraggableStudyBlock';

interface DayTimelineViewProps {
  dayOfWeek: number;
  dayLabel: string;
  blocks: PlannerBlock[];
  allBlocks: PlannerBlock[];
  onBlockPress: (block: PlannerBlock) => void;
  onBlockMove: (blockId: string, dayOfWeek: number, startHour: number, startMinute: number) => void;
}

const HOURS = Array.from(
  { length: PLANNER_END_HOUR - PLANNER_START_HOUR },
  (_, i) => PLANNER_START_HOUR + i,
);

export function DayTimelineView({
  dayOfWeek,
  dayLabel,
  blocks,
  allBlocks,
  onBlockPress,
  onBlockMove,
}: DayTimelineViewProps) {
  const { colors } = useTheme();
  const gridHeight = HOURS.length * PLANNER_ROW_HEIGHT;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop =
    now.getDay() === dayOfWeek && nowMinutes >= PLANNER_START_HOUR * 60 && nowMinutes <= PLANNER_END_HOUR * 60
      ? ((nowMinutes - PLANNER_START_HOUR * 60) / 60) * PLANNER_ROW_HEIGHT
      : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{dayLabel} timeline</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.timeline, { height: gridHeight }]}>
          <View style={[styles.timeRail, { borderColor: colors.border }]}>
            {HOURS.map((hour) => (
              <View key={hour} style={[styles.hourRow, { height: PLANNER_ROW_HEIGHT, borderColor: colors.border }]}>
                <Text style={[styles.hourLabel, { color: colors.textMuted }]}>{hour}:00</Text>
              </View>
            ))}
          </View>

          <View style={[styles.eventsColumn, { borderColor: colors.border }]}>
            {HOURS.map((hour) => (
              <View
                key={hour}
                style={[styles.gridLine, { top: (hour - PLANNER_START_HOUR) * PLANNER_ROW_HEIGHT, borderColor: colors.border }]}
              />
            ))}

            {nowTop !== null ? (
              <View style={[styles.nowLine, { top: nowTop, backgroundColor: colors.error }]} />
            ) : null}

            {blocks.map((block) => (
              <DraggableStudyBlock
                key={block.id}
                block={block}
                dayIndices={[dayOfWeek]}
                dayIndex={0}
                dayColumnWidth={320}
                hasConflict={findConflicts(allBlocks, block).length > 0}
                onPress={() => onBlockPress(block)}
                onDragEnd={(_, hour, minute) => onBlockMove(block.id, dayOfWeek, hour, minute)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.list}>
        {blocks.map((block) => (
          <View key={block.id} style={[styles.listItem, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={[styles.colorBar, { backgroundColor: block.color }]} />
            <View style={styles.listBody}>
              <Text style={[styles.listTitle, { color: colors.text }]}>{getSubjectLabel(block)}</Text>
              <Text style={[styles.listMeta, { color: colors.textSecondary }]}>
                {formatBlockTime(block.startHour, block.startMinute)} – {getEndTimeLabel(block)} · {block.durationMinutes}m
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  scroll: { maxHeight: 420 },
  timeline: { flexDirection: 'row' },
  timeRail: { width: 52, borderRightWidth: StyleSheet.hairlineWidth },
  hourRow: { borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 4, paddingLeft: 4 },
  hourLabel: { fontSize: 10, fontWeight: '600' },
  eventsColumn: { flex: 1, position: 'relative', borderLeftWidth: 0 },
  gridLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: StyleSheet.hairlineWidth },
  nowLine: { position: 'absolute', left: 0, right: 0, height: 2, zIndex: 2 },
  list: { marginTop: 12, gap: 8 },
  listItem: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden' },
  colorBar: { width: 4 },
  listBody: { padding: 10, flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '700' },
  listMeta: { fontSize: 12, marginTop: 2 },
});
