import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TitleBadge } from '../../components/Leaderboard/TitleBadge';
import { formatMinutesToHours } from '../../services/leaderboardService';
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getPendingRequests,
  getFriends,
} from '../../services/leaderboardService';
import { FriendUser, PendingRequest, UserSearchResult } from '../../types/leaderboard';
import { SocialStackParamList } from '../../navigation/types';
import { getSupabase } from '../../services/supabaseClient';

type Props = NativeStackScreenProps<SocialStackParamList, 'Friends'>;

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 42 }: { initials: string; color: string; size?: number }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function FriendsScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  // ── Load friends + pending requests ────────────────────────────────────────
  const refresh = useCallback(async () => {
    const [p, f] = await Promise.all([getPendingRequests(), getFriends()]);
    setPending(p);
    setFriends(f);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Search ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchUsers(query);
      setSearchResults(results);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleSendRequest = async (userId: string, name: string) => {
    const { error } = await sendFriendRequest(userId);
    if (error) {
      Alert.alert('Error', error);
    } else {
      setSentIds((prev) => new Set(prev).add(userId));
      Alert.alert('Request sent', `Friend request sent to ${name}!`);
    }
  };

  const handleAccept = async (req: PendingRequest) => {
    const { error } = await acceptFriendRequest(req.id);
    if (error) {
      Alert.alert('Error', error);
    } else {
      await refresh();
    }
  };

  const handleDecline = async (req: PendingRequest) => {
    const { error } = await declineFriendRequest(req.id);
    if (!error) await refresh();
  };

  const handleRemove = (friend: FriendUser) => {
    Alert.alert(
      'Remove friend',
      `Remove ${friend.displayName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFriend(friend.friendshipId);
            await refresh();
          },
        },
      ],
    );
  };

  const handleShareProfile = async () => {
    const supabase = getSupabase();
    const userId = supabase
      ? (await supabase.auth.getUser()).data.user?.id ?? 'demo'
      : 'demo';

    await Share.share({
      message: `Study with me on Nexara! Add me as a friend: studyflow://user/${userId}`,
      title: 'Join me on Nexara',
    });
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderSearchResult = (item: UserSearchResult) => {
    const isFriend = friends.some((f) => f.userId === item.userId);
    const isSent = sentIds.has(item.userId);

    return (
      <View
        key={item.userId}
        style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Avatar initials={item.avatarInitials} color={item.avatarColor} />
        <View style={styles.rowInfo}>
          <Text style={[styles.rowName, { color: colors.text }]}>{item.displayName}</Text>
          <TitleBadge title={item.currentTitle} />
        </View>
        {isFriend ? (
          <View style={[styles.tagChip, { backgroundColor: `${colors.success}20` }]}>
            <Ionicons name="checkmark" size={12} color={colors.success} />
            <Text style={[styles.tagText, { color: colors.success }]}>Friends</Text>
          </View>
        ) : isSent ? (
          <View style={[styles.tagChip, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.tagText, { color: colors.textMuted }]}>Sent</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={() => handleSendRequest(item.userId, item.displayName)}
          >
            <Ionicons name="person-add-outline" size={14} color="#FFF" />
            <Text style={styles.actionBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPendingRequest = (req: PendingRequest) => (
    <View
      key={req.id}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Avatar initials={req.fromAvatarInitials} color={req.fromAvatarColor} />
      <View style={styles.rowInfo}>
        <Text style={[styles.rowName, { color: colors.text }]}>{req.fromDisplayName}</Text>
        <Text style={[styles.rowSub, { color: colors.textMuted }]}>Wants to be your friend</Text>
      </View>
      <View style={styles.requestBtns}>
        <TouchableOpacity
          style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => handleAccept(req)}
        >
          <Text style={styles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.declineBtn, { borderColor: colors.border }]}
          activeOpacity={0.75}
          onPress={() => handleDecline(req)}
        >
          <Text style={[styles.declineBtnText, { color: colors.textSecondary }]}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriend = (friend: FriendUser) => (
    <View
      key={friend.userId}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Avatar initials={friend.avatarInitials} color={friend.avatarColor} />
      <View style={styles.rowInfo}>
        <Text style={[styles.rowName, { color: colors.text }]}>{friend.displayName}</Text>
        <TitleBadge title={friend.currentTitle} />
        <Text style={[styles.rowSub, { color: colors.textMuted }]}>
          {formatMinutesToHours(friend.minutesThisWeek)} this week
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.removeBtn, { borderColor: colors.border }]}
        activeOpacity={0.75}
        onPress={() => handleRemove(friend)}
      >
        <Ionicons name="person-remove-outline" size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScreenHeader title="Friends" onBack={() => navigation.goBack()} />

      {/* ── Search bar ────────────────────────────────────────────────────── */}
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {searching && <ActivityIndicator size="small" color={colors.primary} />}
        {query.length > 0 && !searching && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Search results ────────────────────────────────────────────────── */}
      {query.trim().length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SEARCH RESULTS</Text>
          {searchResults.length === 0 && !searching ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No users found for "{query}"
            </Text>
          ) : (
            searchResults.map(renderSearchResult)
          )}
        </>
      )}

      {/* ── Pending requests ──────────────────────────────────────────────── */}
      {pending.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            FRIEND REQUESTS ({pending.length})
          </Text>
          {pending.map(renderPendingRequest)}
        </>
      )}

      {/* ── Friends list ──────────────────────────────────────────────────── */}
      {!loading && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            MY FRIENDS {friends.length > 0 ? `(${friends.length})` : ''}
          </Text>

          {friends.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="people-outline" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No friends yet</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Invite your classmates to compete on the leaderboard together!
              </Text>
            </View>
          ) : (
            friends.map(renderFriend)
          )}
        </>
      )}

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {/* ── Share profile ─────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.shareBtn, { borderColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={handleShareProfile}
      >
        <Ionicons name="share-outline" size={18} color={colors.primary} />
        <Text style={[styles.shareBtnText, { color: colors.primary }]}>Share my profile</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '800',
  },
  rowInfo: {
    flex: 1,
    gap: 3,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  requestBtns: {
    gap: 6,
  },
  acceptBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  declineBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  declineBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: 12,
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 16,
    marginBottom: 8,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
