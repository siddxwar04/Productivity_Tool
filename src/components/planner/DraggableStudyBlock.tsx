import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PlannerBlock } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import {
  formatBlockTime,
  getBlockHeight,
  getBlockTopOffset,
  getSubjectLabel,
  minutesToTime,
  snapMinutesFromDrag,
} from '../../services/planner/plannerUtils';

interface DraggableStudyBlockProps {
  block: PlannerBlock;
  hasConflict: boolean;
  onPress: () => void;
  onDragEnd: (dayOfWeek: number, startHour: number, startMinute: number) => void;
  dayColumnWidth?: number;
  dayIndex?: number;
  dayIndices: readonly number[];
}

export function DraggableStudyBlock({
  block,
  hasConflict,
  onPress,
  onDragEnd,
  dayColumnWidth = 88,
  dayIndex = 0,
  dayIndices,
}: DraggableStudyBlockProps) {
  const { colors } = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4,
      onPanResponderGrant: () => {
        Animated.spring(scale, { toValue: 1.03, useNativeDriver: true }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        Animated.parallel([
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        ]).start();

        const originalStart = block.startHour * 60 + block.startMinute;
        const snappedStart = snapMinutesFromDrag(gesture.dy, originalStart);
        const { hour, minute } = minutesToTime(snappedStart);

        const dayOffset = Math.round(gesture.dx / dayColumnWidth);
        const nextDayIndex = Math.max(0, Math.min(dayIndices.length - 1, dayIndex + dayOffset));
        const nextDay = dayIndices[nextDayIndex];

        onDragEnd(nextDay, hour, minute);
      },
    }),
  ).current;

  const priorityBorder =
    block.priority === 'high' ? colors.error :
    block.priority === 'low' ? colors.textMuted :
    colors.primary;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.wrapper,
        {
          top: getBlockTopOffset(block),
          height: getBlockHeight(block),
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }],
          opacity: block.completed ? 0.65 : 1,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[
          styles.block,
          {
            backgroundColor: `${block.color}33`,
            borderColor: hasConflict ? colors.error : priorityBorder,
            borderWidth: hasConflict ? 2 : 1,
          },
        ]}
      >
        <Text style={[styles.subject, { color: colors.text }]} numberOfLines={1}>
          {getSubjectLabel(block)}
        </Text>
        <Text style={[styles.time, { color: colors.textSecondary }]} numberOfLines={1}>
          {formatBlockTime(block.startHour, block.startMinute)}
        </Text>
        {block.completed ? (
          <Text style={[styles.done, { color: colors.success }]}>Done</Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 4,
    right: 4,
  },
  block: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  subject: { fontSize: 11, fontWeight: '800' },
  time: { fontSize: 10, marginTop: 2, fontWeight: '600' },
  done: { fontSize: 9, marginTop: 2, fontWeight: '700' },
});
