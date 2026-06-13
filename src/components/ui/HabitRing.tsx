import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface HabitRingProps {
  name: string;
  progress: number;
  color: string;
  size?: number;
}

export function HabitRing({ name, progress, color, size = 72 }: HabitRingProps) {
  const { colors } = useTheme();
  const pct = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { width: size + 16 }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colors.surfaceSecondary,
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: size - 12,
              height: size - 12,
              borderRadius: (size - 12) / 2,
              borderColor: color,
              borderWidth: 4,
              opacity: 0.3 + pct * 0.7,
            },
          ]}
        />
        <Text style={[styles.pct, { color: colors.text }]}>{Math.round(pct * 100)}%</Text>
      </View>
      <Text style={[styles.name, { color: colors.textSecondary }]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginRight: 12 },
  ring: {
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
  },
  pct: { fontSize: 13, fontWeight: '700' },
  name: { fontSize: 11, marginTop: 6, textAlign: 'center' },
});
