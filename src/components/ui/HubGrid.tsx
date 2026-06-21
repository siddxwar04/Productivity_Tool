import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { HEADING } from '../../utils/typography';

export interface HubItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

interface HubGridProps {
  items: HubItem[];
}

export function HubGrid({ items }: HubGridProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={item.onPress}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${item.color}20` }]}>
            <Ionicons name={item.icon} size={28} color={item.color} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>{item.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 130,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4, ...HEADING },
  sub: { fontSize: 12, lineHeight: 16 },
});
