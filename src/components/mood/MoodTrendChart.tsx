import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { MoodDayTrend } from '../../stores/moodStore';
import { MOOD_ACCENT_COLORS } from '../../utils/moodHelpers';

interface MoodTrendChartProps {
  days: MoodDayTrend[];
}

const CHART_HEIGHT = 100;
const BAR_WIDTH = 28;
const GAP = 8;

function MoodTrendChartComponent({ days }: MoodTrendChartProps) {
  const { colors } = useTheme();
  const chartWidth = days.length * BAR_WIDTH + (days.length - 1) * GAP;
  const maxMood = 5;

  return (
    <View>
      <View style={[styles.chartWrap, { width: chartWidth, height: CHART_HEIGHT }]}>
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <Line
            x1={0}
            y1={CHART_HEIGHT - 8}
            x2={chartWidth}
            y2={CHART_HEIGHT - 8}
            stroke={colors.border}
            strokeWidth={1}
          />
          {days.map((day, i) => {
            const x = i * (BAR_WIDTH + GAP);
            if (day.mood === null) {
              return (
                <Rect
                  key={day.date}
                  x={x + 4}
                  y={CHART_HEIGHT - 28}
                  width={BAR_WIDTH - 8}
                  height={20}
                  rx={6}
                  fill="transparent"
                  stroke={colors.border}
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  opacity={0.5}
                />
              );
            }
            const barHeight = (day.mood / maxMood) * (CHART_HEIGHT - 24);
            const y = CHART_HEIGHT - 8 - barHeight;
            return (
              <Rect
                key={day.date}
                x={x + 4}
                y={y}
                width={BAR_WIDTH - 8}
                height={barHeight}
                rx={6}
                fill={MOOD_ACCENT_COLORS[day.mood]}
                opacity={0.9}
              />
            );
          })}
        </Svg>
      </View>
      <View style={[styles.labels, { width: chartWidth }]}>
        {days.map((day) => (
          <Text
            key={day.date}
            style={[styles.dayLabel, { color: colors.textMuted, width: BAR_WIDTH + GAP }]}
          >
            {day.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export const MoodTrendChart = memo(MoodTrendChartComponent);

const styles = StyleSheet.create({
  chartWrap: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  labels: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dayLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
});
