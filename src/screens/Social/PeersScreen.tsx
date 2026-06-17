import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { usePeersStore } from '../../stores/peersStore';
import { SocialStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SocialStackParamList, 'Peers'>;

const AVATAR_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#F97316'];

function PeerCard({
  peer,
  onToggle,
  index,
}: {
  peer: { id: string; name: string; streak: number; studyHoursWeek: number; isPartner: boolean };
  onToggle: () => void;
  index: number;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start(onToggle);
  };

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardTop}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{peer.name[0].toUpperCase()}</Text>
          </View>
          <View style={styles.nameWrap}>
            <Text style={[styles.name, { color: colors.text }]}>{peer.name}</Text>
            {peer.isPartner && (
              <View style={[styles.partnerBadge, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="star" size={10} color={colors.primary} />
                <Text style={[styles.partnerText, { color: colors.primary }]}>Partner</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statText, { color: colors.text }]}>{peer.streak}d streak</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="library-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.text }]}>{peer.studyHoursWeek}h this week</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={1}
          style={[
            styles.partnerBtn,
            {
              backgroundColor: peer.isPartner ? colors.primary : 'transparent',
              borderColor: peer.isPartner ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons
            name={peer.isPartner ? 'star' : 'star-outline'}
            size={16}
            color={peer.isPartner ? '#FFF' : colors.textSecondary}
          />
          <Text style={[styles.partnerBtnText, { color: peer.isPartner ? '#FFF' : colors.textSecondary }]}>
            {peer.isPartner ? 'Partner ✓' : 'Set as partner'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export function PeersScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const peers = usePeersStore((s) => s.peers);
  const togglePartner = usePeersStore((s) => s.togglePartner);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Peers" onBack={() => navigation.goBack()} />

      {peers.length === 0 && (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="person-add-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No peers yet</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Add study partners to stay accountable together.
          </Text>
        </View>
      )}

      {peers.map((p, i) => (
        <PeerCard
          key={p.id}
          peer={p}
          onToggle={() => togglePartner(p.id)}
          index={i}
        />
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  cardWrap: { marginBottom: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
  nameWrap: { flex: 1, gap: 4 },
  name: { fontSize: 16, fontWeight: '700' },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  partnerText: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statEmoji: { fontSize: 12 },
  statText: { fontSize: 12, fontWeight: '500' },
  partnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  partnerBtnText: { fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },
});
