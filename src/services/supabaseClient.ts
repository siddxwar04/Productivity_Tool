import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable Google sign-in.' };
  }
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  return error ? { error: error.message } : {};
}

export async function signOut(): Promise<void> {
  await getSupabase()?.auth.signOut();
}
