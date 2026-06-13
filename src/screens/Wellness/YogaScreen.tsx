import React, { useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { WellnessStackParamList } from '../../navigation/types';
import {
  WELLNESS_VIDEOS,
  WELLNESS_VIDEO_CATEGORIES,
  WellnessVideoCategory,
  getYouTubeThumbnail,
} from '../../services/wellnessVideos';

type Props = NativeStackScreenProps<WellnessStackParamList, 'Yoga'>;

type Filter = WellnessVideoCategory | 'All';

const FILTERS: Filter[] = ['All', ...WELLNESS_VIDEO_CATEGORIES];

export function YogaScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<Filter>('All');

  const videos = useMemo(
    () => (filter === 'All' ? WELLNESS_VIDEOS : WELLNESS_VIDEOS.filter((v) => v.category === filter)),
    [filter],
  );

  return (
    <ScreenWrapper>
      <ScreenHeader title="Yoga & Meditation" onBack={() => navigation.goBack()} />
      <Text style={[styles.intro, { color: colors.textSecondary }]}>
        Take a mindful break with guided yoga, meditation, and breathing sessions.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? '#FFFFFF' : colors.text }]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {videos.map((video) => (
          <TouchableOpacity
            key={video.id}
            activeOpacity={0.85}
            style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('YogaPlayer', { videoId: video.videoId, title: video.title })}
          >
            <View style={styles.thumbWrap}>
              <Image
                source={{ uri: getYouTubeThumbnail(video.videoId) }}
                style={styles.thumb}
                resizeMode="cover"
              />
              <View style={styles.playOverlay}>
                <Ionicons name="play" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            </View>
            <View style={styles.itemBody}>
              <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                {video.title}
              </Text>
              <Text style={[styles.itemChannel, { color: colors.textSecondary }]} numberOfLines={1}>
                {video.channel}
              </Text>
              <View style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>{video.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  chips: { gap: 8, paddingBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  list: { gap: 12 },
  item: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    gap: 12,
  },
  thumbWrap: { width: 128, height: 80, borderRadius: 12, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  itemBody: { flex: 1, justifyContent: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  itemChannel: { fontSize: 13, marginBottom: 8 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '600' },
});
