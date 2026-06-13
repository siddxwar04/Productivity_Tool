import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.back} />
      )}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{right ?? <View style={styles.back} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  back: { width: 40 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  right: { width: 40, alignItems: 'flex-end' },
});
