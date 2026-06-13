import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  label?: string;
}

export function ProgressBar({ progress, color, height = 8, label }: ProgressBarProps) {
  const { colors } = useTheme();
  const fillColor = color ?? colors.primary;
  const pct = Math.min(Math.max(progress, 0), 1);

  return (
    <View>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <View style={[styles.track, { backgroundColor: colors.surfaceSecondary, height, borderRadius: height / 2 }]}>
        <View
          style={{
            width: `${pct * 100}%`,
            backgroundColor: fillColor,
            height,
            borderRadius: height / 2,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, marginBottom: 6 },
  track: { overflow: 'hidden' },
});
