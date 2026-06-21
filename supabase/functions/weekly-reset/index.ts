// Supabase Edge Function — weekly-reset
// Schedule: every Monday at 00:00 UTC
//   pg_cron SQL:
//   SELECT cron.schedule('weekly-leaderboard-reset', '0 0 * * 1',
//     $$SELECT net.http_post(url := '<SUPABASE_URL>/functions/v1/weekly-reset',
//       headers := '{"Authorization":"Bearer <SERVICE_ROLE_KEY>"}')$$);

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl  = Deno.env.get('SUPABASE_URL')!;
const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase     = createClient(supabaseUrl, serviceKey);

// ─── Title logic ──────────────────────────────────────────────────────────────

function titleForRank(rank: number): string {
  if (rank === 1) return 'Scholar Supreme';
  if (rank === 2) return 'Knowledge Knight';
  if (rank === 3) return 'Brain Cadet';
  if (rank <= 6)  return 'Rising Mind';
  return 'Study Spark';
}

function xpForRank(rank: number): number {
  if (rank === 1) return 200;
  if (rank === 2) return 150;
  if (rank === 3) return 100;
  if (rank <= 6)  return 50;
  return 0;
}

// ─── Week helpers ─────────────────────────────────────────────────────────────

function getWeekStart(d: Date): string {
  const day = d.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - daysToMonday),
  );
  return monday.toISOString().split('T')[0];
}

function nextWeekStart(weekStart: string): string {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().split('T')[0];
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Allow only POST from internal scheduler (or GET for manual trigger)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const endingWeek  = getWeekStart(new Date()); // current Monday = ending week
  const newWeekDate = nextWeekStart(endingWeek);

  // 1. Get all users who studied this week
  const { data: weekRows, error: weekErr } = await supabase
    .from('weekly_study_minutes')
    .select('user_id, minutes')
    .eq('week_start', endingWeek);

  if (weekErr) {
    console.error('weekly_study_minutes fetch error:', weekErr.message);
    return new Response(JSON.stringify({ error: weekErr.message }), { status: 500 });
  }

  const allUserIds = (weekRows ?? []).map((r: any) => r.user_id as string);

  if (allUserIds.length === 0) {
    // Nothing to process — insert new-week rows for all profile holders
    const { data: allProfiles } = await supabase
      .from('user_profiles')
      .select('id');
    const inserts = (allProfiles ?? []).map((p: any) => ({
      user_id: p.id,
      week_start: newWeekDate,
      minutes: 0,
    }));
    if (inserts.length > 0) {
      await supabase.from('weekly_study_minutes').upsert(inserts, { onConflict: 'user_id,week_start' });
    }
    return new Response(JSON.stringify({ processed: 0 }), { status: 200 });
  }

  // 2. Build a minutes map
  const minutesMap = new Map<string, number>(
    (weekRows ?? []).map((r: any) => [r.user_id as string, r.minutes as number]),
  );

  // 3. For each user, get their friend group and compute rank within it
  const { data: friendships } = await supabase
    .from('friendships')
    .select('user_a, user_b')
    .eq('status', 'accepted')
    .or(allUserIds.map((id) => `user_a.eq.${id}`).join(',') + ',' +
        allUserIds.map((id) => `user_b.eq.${id}`).join(','));

  const friendGraph = new Map<string, Set<string>>();
  for (const id of allUserIds) friendGraph.set(id, new Set([id]));
  for (const f of (friendships ?? []) as any[]) {
    const a = f.user_a as string;
    const b = f.user_b as string;
    friendGraph.get(a)?.add(b);
    friendGraph.get(b)?.add(a);
  }

  // 4. Compute rank for each user within their social group
  const userResults: Array<{ userId: string; rank: number; minutes: number }> = [];

  for (const userId of allUserIds) {
    const groupIds = [...(friendGraph.get(userId) ?? new Set([userId]))];
    const groupSorted = groupIds
      .map((id) => ({ id, mins: minutesMap.get(id) ?? 0 }))
      .sort((a, b) => b.mins - a.mins);
    const rank = groupSorted.findIndex((e) => e.id === userId) + 1;
    userResults.push({ userId, rank, minutes: minutesMap.get(userId) ?? 0 });
  }

  // 5. Update titles, XP, and prepare push notifications
  const profileUpdates: Array<{ id: string; current_title: string; total_xp_increment: number }> = [];

  for (const { userId, rank } of userResults) {
    profileUpdates.push({
      id: userId,
      current_title: titleForRank(rank),
      total_xp_increment: xpForRank(rank),
    });
  }

  // Batch update profiles — upsert one at a time (Supabase doesn't support batch += natively)
  const updatePromises = profileUpdates.map(async (u) => {
    // Fetch current XP first
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_xp')
      .eq('id', u.id)
      .single();

    const currentXp = (profile as any)?.total_xp ?? 0;

    return supabase
      .from('user_profiles')
      .update({ current_title: u.current_title, total_xp: currentXp + u.total_xp_increment })
      .eq('id', u.id);
  });

  await Promise.all(updatePromises);

  // 6. Insert new-week rows (minutes = 0) for all known users
  const newWeekInserts = allUserIds.map((id) => ({
    user_id: id,
    week_start: newWeekDate,
    minutes: 0,
  }));
  await supabase
    .from('weekly_study_minutes')
    .upsert(newWeekInserts, { onConflict: 'user_id,week_start' });

  // 7. Fetch push tokens and send notifications
  // Assumes a push_tokens table: { user_id, token, platform }
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('user_id, token')
    .in('user_id', allUserIds);

  const tokenMap = new Map<string, string>(
    (tokens ?? []).map((t: any) => [t.user_id as string, t.token as string]),
  );

  const pushMessages = userResults
    .filter(({ userId }) => tokenMap.has(userId))
    .map(({ userId, rank, minutes }) => ({
      to: tokenMap.get(userId)!,
      title: '🏆 Weekly results are in!',
      body: `You finished #${rank} with ${formatHours(minutes)} studied! Title earned: ${titleForRank(rank)}. New week starts now — good luck!`,
      data: { type: 'weekly_reset', rank, title: titleForRank(rank) },
    }));

  if (pushMessages.length > 0) {
    // Send via Expo Push API in batches of 100
    const BATCH = 100;
    for (let i = 0; i < pushMessages.length; i += BATCH) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pushMessages.slice(i, i + BATCH)),
      });
    }
  }

  return new Response(
    JSON.stringify({ processed: userResults.length, newWeek: newWeekDate }),
    { status: 200 },
  );
});
