import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { SCREEN_TITLE, BODY } from '../../utils/typography';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
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
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  back: { width: 40 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', textAlign: 'center', ...SCREEN_TITLE },
  right: { width: 40, alignItems: 'flex-end' },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 4, ...BODY },
});
