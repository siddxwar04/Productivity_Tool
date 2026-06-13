import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { SocialActivity } from '../../types/social';

interface ActivityFeedItemProps {
  activity: SocialActivity;
  onPress?: () => void;
  showDivider?: boolean;
}

function ActivityFeedItemComponent({
  activity,
  onPress,
  showDivider = true,
}: ActivityFeedItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.row}>
        <Avatar name={activity.actorName} size={40} color={activity.avatarColor} />
        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }]}>{activity.actorName}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {activity.description}
          </Text>
        </View>
        <Text style={[styles.time, { color: colors.textMuted }]}>{activity.timestamp}</Text>
      </View>
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      ) : null}
    </TouchableOpacity>
  );
}

export const ActivityFeedItem = memo(ActivityFeedItemComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
  },
  content: {
    flex: 1,
    paddingTop: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
