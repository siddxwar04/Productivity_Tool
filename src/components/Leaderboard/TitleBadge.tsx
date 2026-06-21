import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BADGE } from '../../utils/typography';

interface TitleConfig {
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
  isBonus: boolean;
}

const TITLE_MAP: Record<string, TitleConfig> = {
  'Scholar Supreme':  { color: '#F9CA24', bg: '#F9CA2422', icon: 'trophy',        isBonus: false },
  'Knowledge Knight': { color: '#BDC3C7', bg: '#BDC3C722', icon: 'shield',        isBonus: false },
  'Brain Cadet':      { color: '#E67E22', bg: '#E67E2222', icon: 'star',          isBonus: false },
  'Rising Mind':      { color: '#8B5CF6', bg: '#8B5CF622', icon: 'trending-up',   isBonus: false },
  'Study Spark':      { color: '#14B8A6', bg: '#14B8A622', icon: 'flame',         isBonus: false },
  'Getting started':  { color: '#9CA3AF', bg: '#9CA3AF22', icon: 'leaf-outline',  isBonus: false },
  'Century Scholar':  { color: '#F9CA24', bg: '#F9CA2422', icon: 'school',        isBonus: true  },
  'Streak Lord':      { color: '#8B5CF6', bg: '#8B5CF622', icon: 'infinite',      isBonus: true  },
  'Night Owl':        { color: '#6366F1', bg: '#6366F122', icon: 'moon',          isBonus: true  },
  'Early Bird':       { color: '#F59E0B', bg: '#F59E0B22', icon: 'sunny',         isBonus: true  },
};

const DEFAULT_CONFIG: TitleConfig = {
  color: '#9CA3AF',
  bg: '#9CA3AF22',
  icon: 'leaf-outline',
  isBonus: false,
};

interface Props {
  title: string;
}

export function TitleBadge({ title }: Props) {
  const cfg = TITLE_MAP[title] ?? DEFAULT_CONFIG;

  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
      {cfg.isBonus ? (
        <Text style={[styles.bolt, { color: cfg.color }]}>⚡</Text>
      ) : (
        <Ionicons name={cfg.icon} size={10} color={cfg.color} />
      )}
      <Text style={[styles.label, { color: cfg.color }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    ...BADGE,
  },
  bolt: {
    fontSize: 10,
  },
});
