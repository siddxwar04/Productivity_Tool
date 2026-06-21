import { getSupabase } from './supabaseClient';
import {
  LeaderboardEntry,
  FriendUser,
  PendingRequest,
  UserSearchResult,
} from '../types/leaderboard';

// ─── Date helpers ────────────────────────────────────────────────────────────

export function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun … 6=Sat
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysToMonday),
  );
  return monday.toISOString().split('T')[0];
}

export function getPreviousWeekStart(): string {
  const cur = new Date(getCurrentWeekStart());
  cur.setUTCDate(cur.getUTCDate() - 7);
  return cur.toISOString().split('T')[0];
}

export function formatMinutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── Mock fallback (shown when Supabase is not configured) ───────────────────

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    userId: 'mock-1',
    displayName: 'Priya R.',
    avatarInitials: 'PR',
    avatarColor: '#10B981',
    currentTitle: 'Scholar Supreme',
    isBonusTitle: false,
    minutesThisWeek: 762,
    hoursDisplay: '12h 42m',
    rank: 1,
    rankChangeVsLastWeek: 1,
    isCurrentUser: false,
  },
  {
    userId: 'mock-2',
    displayName: 'Arjun K.',
    avatarInitials: 'AK',
    avatarColor: '#3B82F6',
    currentTitle: 'Knowledge Knight',
    isBonusTitle: false,
    minutesThisWeek: 640,
    hoursDisplay: '10h 40m',
    rank: 2,
    rankChangeVsLastWeek: -1,
    isCurrentUser: false,
  },
  {
    userId: 'mock-you',
    displayName: 'You',
    avatarInitials: 'YO',
    avatarColor: '#6366F1',
    currentTitle: 'Brain Cadet',
    isBonusTitle: false,
    minutesThisWeek: 480,
    hoursDisplay: '8h 0m',
    rank: 3,
    rankChangeVsLastWeek: 2,
    isCurrentUser: true,
  },
  {
    userId: 'mock-4',
    displayName: 'Maya S.',
    avatarInitials: 'MS',
    avatarColor: '#EC4899',
    currentTitle: 'Rising Mind',
    isBonusTitle: false,
    minutesThisWeek: 355,
    hoursDisplay: '5h 55m',
    rank: 4,
    rankChangeVsLastWeek: 0,
    isCurrentUser: false,
  },
  {
    userId: 'mock-5',
    displayName: 'Dev P.',
    avatarInitials: 'DP',
    avatarColor: '#F59E0B',
    currentTitle: 'Study Spark',
    isBonusTitle: false,
    minutesThisWeek: 210,
    hoursDisplay: '3h 30m',
    rank: 5,
    rankChangeVsLastWeek: -1,
    isCurrentUser: false,
  },
];

// ─── Sync ─────────────────────────────────────────────────────────────────────

/**
 * Called after every focus session completes (from focusStore).
 * Upserts the user's total minutes for the current week.
 */
export async function syncWeeklyMinutes(totalMinutes: number): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const weekStart = getCurrentWeekStart();
  await supabase.from('weekly_study_minutes').upsert(
    {
      user_id: user.id,
      week_start: weekStart,
      minutes: totalMinutes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,week_start' },
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function getFriendsLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = getSupabase();
  if (!supabase) return MOCK_LEADERBOARD;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return MOCK_LEADERBOARD;

    const weekStart = getCurrentWeekStart();
    const prevWeekStart = getPreviousWeekStart();

    const { data: friendships } = await supabase
      .from('friendships')
      .select('user_a, user_b')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'accepted');

    const friendIds = (friendships ?? []).map((f: any) =>
      f.user_a === user.id ? f.user_b : f.user_a,
    );
    const allIds: string[] = [user.id, ...friendIds];

    const [currentRes, prevRes, profilesRes] = await Promise.all([
      supabase
        .from('weekly_study_minutes')
        .select('user_id, minutes')
        .in('user_id', allIds)
        .eq('week_start', weekStart),
      supabase
        .from('weekly_study_minutes')
        .select('user_id, minutes')
        .in('user_id', allIds)
        .eq('week_start', prevWeekStart),
      supabase
        .from('user_profiles')
        .select('id, display_name, avatar_initials, avatar_color, current_title')
        .in('id', allIds),
    ]);

    const profileMap = new Map(
      (profilesRes.data ?? []).map((p: any) => [p.id, p]),
    );
    const currentMap = new Map(
      (currentRes.data ?? []).map((w: any) => [w.user_id, w.minutes as number]),
    );
    const prevMap = new Map(
      (prevRes.data ?? []).map((w: any) => [w.user_id, w.minutes as number]),
    );

    const sorted = allIds
      .map((id) => ({ id, minutes: currentMap.get(id) ?? 0 }))
      .sort((a, b) => b.minutes - a.minutes);

    const prevSorted = allIds
      .map((id) => ({ id, minutes: prevMap.get(id) ?? 0 }))
      .sort((a, b) => b.minutes - a.minutes);
    const prevRankMap = new Map(prevSorted.map((e, i) => [e.id, i + 1]));

    return sorted.map((entry, index) => {
      const rank = index + 1;
      const profile = profileMap.get(entry.id) as any;
      const prevRank = prevRankMap.get(entry.id) ?? rank;
      const rankChange = prevRank - rank; // positive = improved (climbed up)

      return {
        userId: entry.id,
        displayName: profile?.display_name ?? 'Unknown',
        avatarInitials:
          profile?.avatar_initials ??
          (profile?.display_name?.slice(0, 2).toUpperCase() ?? '??'),
        avatarColor: profile?.avatar_color ?? '#6366F1',
        currentTitle: profile?.current_title ?? 'Getting started',
        isBonusTitle: false,
        minutesThisWeek: entry.minutes,
        hoursDisplay: formatMinutesToHours(entry.minutes),
        rank,
        rankChangeVsLastWeek: rankChange,
        isCurrentUser: entry.id === user.id,
      };
    });
  } catch {
    return MOCK_LEADERBOARD;
  }
}

// ─── Friend management ────────────────────────────────────────────────────────

export async function sendFriendRequest(
  targetUserId: string,
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase not configured' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const { error } = await supabase
    .from('friendships')
    .insert({ user_a: user.id, user_b: targetUserId, status: 'pending' });

  return error ? { error: error.message } : {};
}

export async function acceptFriendRequest(
  friendshipId: string,
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId);

  return error ? { error: error.message } : {};
}

export async function declineFriendRequest(
  friendshipId: string,
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  return error ? { error: error.message } : {};
}

export async function removeFriend(
  friendshipId: string,
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  return error ? { error: error.message } : {};
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const supabase = getSupabase();
  if (!supabase || !query.trim()) return [];

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_initials, avatar_color, current_title')
    .ilike('display_name', `%${query.trim()}%`)
    .limit(20);

  if (error || !data) return [];

  return (data as any[]).map((p) => ({
    userId: p.id,
    displayName: p.display_name,
    avatarInitials:
      p.avatar_initials ?? p.display_name.slice(0, 2).toUpperCase(),
    avatarColor: p.avatar_color ?? '#6366F1',
    currentTitle: p.current_title ?? 'Getting started',
  }));
}

export async function getPendingRequests(): Promise<PendingRequest[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('friendships')
    .select(
      'id, user_a, created_at, user_profiles!friendships_user_a_fkey(display_name, avatar_initials, avatar_color)',
    )
    .eq('user_b', user.id)
    .eq('status', 'pending');

  if (error || !data) return [];

  return (data as any[]).map((f) => ({
    id: f.id,
    fromUserId: f.user_a,
    fromDisplayName: f.user_profiles?.display_name ?? 'Unknown',
    fromAvatarInitials: f.user_profiles?.avatar_initials ?? '??',
    fromAvatarColor: f.user_profiles?.avatar_color ?? '#6366F1',
    createdAt: f.created_at,
  }));
}

export async function getFriends(): Promise<FriendUser[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: friendships, error } = await supabase
    .from('friendships')
    .select('id, user_a, user_b')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .eq('status', 'accepted');

  if (error || !friendships || friendships.length === 0) return [];

  const friendshipList = friendships as any[];
  const friendIds = friendshipList.map((f) =>
    f.user_a === user.id ? f.user_b : f.user_a,
  );

  const weekStart = getCurrentWeekStart();

  const [profilesRes, minutesRes] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('id, display_name, avatar_initials, avatar_color, current_title')
      .in('id', friendIds),
    supabase
      .from('weekly_study_minutes')
      .select('user_id, minutes')
      .in('user_id', friendIds)
      .eq('week_start', weekStart),
  ]);

  const minutesMap = new Map(
    (minutesRes.data ?? []).map((m: any) => [m.user_id, m.minutes as number]),
  );

  return (profilesRes.data ?? []).map((p: any) => {
    const friendship = friendshipList.find(
      (f) => f.user_a === p.id || f.user_b === p.id,
    );
    return {
      userId: p.id,
      friendshipId: friendship?.id ?? '',
      displayName: p.display_name,
      avatarInitials:
        p.avatar_initials ?? p.display_name.slice(0, 2).toUpperCase(),
      avatarColor: p.avatar_color ?? '#6366F1',
      currentTitle: p.current_title ?? 'Getting started',
      isBonusTitle: false,
      minutesThisWeek: minutesMap.get(p.id) ?? 0,
    };
  });
}

// ─── Realtime ─────────────────────────────────────────────────────────────────

export function subscribeToLeaderboard(onUpdate: () => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('leaderboard-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'weekly_study_minutes' },
      onUpdate,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
