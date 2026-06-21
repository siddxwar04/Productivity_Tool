import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { ActivityFeedItem } from '../../components/social/ActivityFeedItem';
import { PeerRow } from '../../components/social/PeerRow';
import { StreakCard } from '../../components/social/StreakCard';
import { usePeersStore } from '../../stores/peersStore';
import { useGroupsStore } from '../../stores/groupsStore';
import { useStreakStore } from '../../stores/streakStore';
import { MOCK_ACTIVITIES, MOCK_ONLINE_PEERS, avatarColorFor } from '../../data/socialMockData';
import { SocialTab } from '../../types/social';
import { MainTabParamList, RootStackParamList, SocialStackParamList } from '../../navigation/types';
import { SCREEN_TITLE } from '../../utils/typography';

type Props = NativeStackScreenProps<SocialStackParamList, 'SocialHub'>;

type SocialNav = CompositeNavigationProp<
  NativeStackNavigationProp<SocialStackParamList, 'SocialHub'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Social'>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

const TABS: { id: SocialTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'groups', label: 'Groups' },
  { id: 'peers', label: 'Peers' },
  { id: 'leaderboard', label: 'Ranks' },
];

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

export function SocialHubScreen({ navigation: stackNav }: Props) {
  const navigation = useNavigation<SocialNav>();
  const { colors } = useTheme();
  const peers = usePeersStore((s) => s.peers);
  const groups = useGroupsStore((s) => s.groups);
  const joinedIds = useGroupsStore((s) => s.joinedIds);
  const joinGroup = useGroupsStore((s) => s.joinGroup);
  const leaveGroup = useGroupsStore((s) => s.leaveGroup);
  const togglePartner = usePeersStore((s) => s.togglePartner);
  const currentStreak = useStreakStore((s) => s.current);

  const [activeTab, setActiveTab] = useState<SocialTab>('overview');
  const [search, setSearch] = useState('');
  const [hasUnread, setHasUnread] = useState(true);

  const partner = peers.find((p) => p.isPartner);
  const streakFriendName = partner?.name ?? 'Priya R.';
  const activeGroupCount = joinedIds.length > 0 ? joinedIds.length : groups.length;

  const filteredActivities = useMemo(
    () =>
      MOCK_ACTIVITIES.filter(
        (a) =>
          !search.trim()
          || matchesQuery(a.actorName, search)
          || matchesQuery(a.description, search),
      ),
    [search],
  );

  const filteredOnlinePeers = useMemo(
    () =>
      MOCK_ONLINE_PEERS.filter(
        (p) => !search.trim() || matchesQuery(p.name, search) || matchesQuery(p.statusText, search),
      ),
    [search],
  );

  const filteredGroups = useMemo(
    () => groups.filter((g) => !search.trim() || matchesQuery(g.name, search)),
    [groups, search],
  );

  const filteredPeers = useMemo(
    () => peers.filter((p) => !search.trim() || matchesQuery(p.name, search)),
    [peers, search],
  );

  const onlineByName = useMemo(() => {
    const map = new Map<string, (typeof MOCK_ONLINE_PEERS)[0]>();
    MOCK_ONLINE_PEERS.forEach((p) => map.set(p.name.split(' ')[0].toLowerCase(), p));
    return map;
  }, []);

  const handleNotifications = () => {
    setHasUnread(false);
    navigation.navigate('Profile', { screen: 'Notifications' });
  };

  const handleInvite = () => {
    Alert.alert(
      'Invite a study partner',
      'Share your invite link with friends to study together. (Coming soon)',
    );
  };

  const renderSectionLabel = (label: string) => (
    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
  );

  const renderOverview = () => (
    <>
      {renderSectionLabel('YOUR SPACES')}
      <View style={styles.spacesGrid}>
        <TouchableOpacity
          style={[styles.spaceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => stackNav.navigate('Groups')}
        >
          <View style={[styles.spaceIcon, { backgroundColor: `${colors.success}22` }]}>
            <Ionicons name="people" size={18} color={colors.success} />
          </View>
          <Text style={[styles.spaceTitle, { color: colors.text }]}>Groups</Text>
          <Text style={[styles.spaceSub, { color: colors.textSecondary }]}>Study together</Text>
          <View style={styles.spaceMeta}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.spaceMetaText, { color: colors.textMuted }]}>
              {activeGroupCount} active
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.spaceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => stackNav.navigate('Peers')}
        >
          <View style={[styles.spaceIcon, { backgroundColor: `${colors.primary}22` }]}>
            <Ionicons name="person" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.spaceTitle, { color: colors.text }]}>Peers</Text>
          <Text style={[styles.spaceSub, { color: colors.textSecondary }]}>Accountability</Text>
          <View style={styles.spaceMeta}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.spaceMetaText, { color: colors.textMuted }]}>
              {peers.length} friends
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionGap} />
      <TouchableOpacity
        style={[styles.leaderboardBanner, { backgroundColor: `${colors.warning}18`, borderColor: `${colors.warning}55` }]}
        activeOpacity={0.85}
        onPress={() => stackNav.navigate('Leaderboard')}
      >
        <Ionicons name="trophy" size={22} color={colors.warning} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>Weekly Leaderboard</Text>
          <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
            See how you rank among friends this week
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={styles.sectionGap} />
      <StreakCard
        friendName={streakFriendName}
        streakCount={partner?.streak ?? currentStreak}
        onPress={() => stackNav.navigate('Peers')}
      />

      <View style={styles.sectionGap} />
      {renderSectionLabel('RECENT ACTIVITY')}
      <View style={[styles.feedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {filteredActivities.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No activity found</Text>
        ) : (
          filteredActivities.map((activity, index) => (
            <ActivityFeedItem
              key={activity.id}
              activity={activity}
              showDivider={index < filteredActivities.length - 1}
              onPress={() => {
                // TODO: open activity detail
              }}
            />
          ))
        )}
      </View>

      <View style={styles.sectionGap} />
      {renderSectionLabel('PEERS ONLINE NOW')}
      <View style={[styles.feedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {filteredOnlinePeers.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No peers online</Text>
        ) : (
          filteredOnlinePeers.map((peer, index) => (
            <PeerRow
              key={peer.id}
              name={peer.name}
              statusText={peer.statusText}
              isOnline={peer.isOnline}
              avatarColor={peer.avatarColor}
              compact
              showDivider={index < filteredOnlinePeers.length - 1}
              onPress={() => stackNav.navigate('Peers')}
            />
          ))
        )}
      </View>

      <TouchableOpacity style={styles.inviteRow} onPress={handleInvite} activeOpacity={0.75}>
        <Ionicons name="person-add-outline" size={18} color={colors.primary} />
        <Text style={[styles.inviteText, { color: colors.primary }]}>Invite a study partner</Text>
      </TouchableOpacity>
    </>
  );

  const renderGroupsTab = () => (
    <>
      {filteredGroups.map((g) => {
        const joined = joinedIds.includes(g.id);
        return (
          <View
            key={g.id}
            style={[styles.listRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.listInfo}>
              <Text style={[styles.listTitle, { color: colors.text }]}>{g.name}</Text>
              <Text style={[styles.listMeta, { color: colors.textSecondary }]}>
                {g.memberCount} members · {g.lastMessage ?? 'No messages yet'}
              </Text>
            </View>
            <Button
              title={joined ? 'Leave' : 'Join'}
              variant={joined ? 'ghost' : 'primary'}
              onPress={() => (joined ? leaveGroup(g.id) : joinGroup(g.id))}
              style={styles.listBtn}
            />
          </View>
        );
      })}
      {filteredGroups.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No groups found</Text>
      ) : null}
      <Button
        title="Manage all groups"
        variant="secondary"
        onPress={() => stackNav.navigate('Groups')}
        style={styles.manageBtn}
      />
    </>
  );

  const renderPeersTab = () => (
    <>
      {filteredPeers.map((p) => {
        const online = onlineByName.get(p.name.toLowerCase());
        return (
          <View
            key={p.id}
            style={[styles.feedCard, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 10 }]}
          >
            <PeerRow
              name={p.name}
              statusText={
                online?.statusText
                ?? `🔥 ${p.streak}d streak · ${p.studyHoursWeek}h this week`
              }
              isOnline={online?.isOnline ?? false}
              avatarColor={avatarColorFor(p.name)}
              showDivider={false}
            />
            <View style={[styles.peerActions, { borderTopColor: colors.border }]}>
              <Button
                title={p.isPartner ? 'Partner ✓' : 'Set as partner'}
                variant={p.isPartner ? 'primary' : 'secondary'}
                onPress={() => togglePartner(p.id)}
                style={styles.listBtn}
              />
            </View>
          </View>
        );
      })}
      {filteredPeers.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No peers found</Text>
      ) : null}
      <TouchableOpacity style={styles.inviteRow} onPress={handleInvite} activeOpacity={0.75}>
        <Ionicons name="person-add-outline" size={18} color={colors.primary} />
        <Text style={[styles.inviteText, { color: colors.primary }]}>Invite a study partner</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <ScreenWrapper>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>Social</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Collaborate & stay accountable
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bellBtn, { backgroundColor: colors.surfaceSecondary }]}
          onPress={handleNotifications}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {hasUnread ? (
            <View style={[styles.unreadDot, { backgroundColor: colors.success }]} />
          ) : null}
        </TouchableOpacity>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Find people or groups…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabBtn}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.text : colors.textMuted },
                  active && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              {active ? (
                <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'groups' && renderGroupsTab()}
      {activeTab === 'peers' && renderPeersTab()}
      {activeTab === 'leaderboard' && (
        <TouchableOpacity
          style={[styles.leaderboardBanner, { backgroundColor: `${colors.warning}18`, borderColor: `${colors.warning}55`, marginTop: 8 }]}
          activeOpacity={0.85}
          onPress={() => stackNav.navigate('Leaderboard')}
        >
          <Ionicons name="trophy" size={22} color={colors.warning} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>Open Leaderboard</Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              See this week's full rankings
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    ...SCREEN_TITLE,
  },
  sub: {
    fontSize: 15,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    borderRadius: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  sectionGap: {
    height: 20,
  },
  spacesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  spaceCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  spaceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  spaceTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  spaceSub: {
    fontSize: 12,
    marginBottom: 10,
  },
  spaceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spaceMetaText: {
    fontSize: 11,
  },
  feedCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 13,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
  },
  inviteText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  listBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  manageBtn: {
    marginTop: 8,
  },
  peerActions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  leaderboardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
  },
});
