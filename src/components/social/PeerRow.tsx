import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Avatar } from '../ui/Avatar';

interface PeerRowProps {
  name: string;
  statusText: string;
  isOnline: boolean;
  avatarColor?: string;
  compact?: boolean;
  onPress?: () => void;
  showDivider?: boolean;
}

function PeerRowComponent({
  name,
  statusText,
  isOnline,
  avatarColor,
  compact = false,
  onPress,
  showDivider = true,
}: PeerRowProps) {
  const { colors } = useTheme();
  const dotColor = isOnline ? colors.success : colors.textMuted;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.row, compact && styles.rowCompact]}>
        <View style={styles.avatarWrap}>
          <Avatar name={name} size={compact ? 32 : 40} color={avatarColor} />
          <View style={[styles.dot, { backgroundColor: dotColor, borderColor: colors.surface }]} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }, compact && styles.nameCompact]}>
            {name}
          </Text>
          <Text
            style={[styles.status, { color: colors.textSecondary }, compact && styles.statusCompact]}
            numberOfLines={1}
          >
            {statusText}
          </Text>
        </View>
      </View>
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      ) : null}
    </TouchableOpacity>
  );
}

export const PeerRow = memo(PeerRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowCompact: {
    paddingVertical: 10,
  },
  avatarWrap: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  nameCompact: {
    fontSize: 13,
    marginBottom: 1,
  },
  status: {
    fontSize: 12,
  },
  statusCompact: {
    fontSize: 11,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
