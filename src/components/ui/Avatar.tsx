import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getInitials } from '../../utils/helpers';
import { avatarColorFor } from '../../data/socialMockData';

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, size = 40, color }: AvatarProps) {
  const bg = color ?? avatarColorFor(name);
  const fontSize = size <= 32 ? 11 : size <= 40 ? 13 : 15;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
