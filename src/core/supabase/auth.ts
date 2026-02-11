import { supabase, isSupabaseConfigured } from './client';

export { isSupabaseConfigured } from './client';
import type { User } from '@supabase/supabase-js';

export type AuthSession = { user: User } | null;

export async function getSession(): Promise<AuthSession> {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { user: session.user } : null;
}

export async function signIn(email: string, password: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error };
  return { error: null };
}

export async function signUp(
  email: string,
  password: string,
  options?: { displayName?: string }
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: options?.displayName ? { display_name: options.displayName } : undefined,
    },
  });
  if (error) return { error };
  return { error: null };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

/** Create or update profiles row for the signed-in user. Call after sign-in. */
export async function ensureProfile(user: User): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) return { error: null };
  const displayName = (user.user_metadata?.display_name as string) ?? user.email ?? 'User';
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        display_name: displayName,
        role: (user.user_metadata?.role as string) ?? 'student',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  return error ? { error } : { error: null };
}

export function onAuthStateChange(callback: (session: AuthSession) => void): () => void {
  if (!isSupabaseConfigured()) {
    callback(null);
    return () => {};
  }
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
    if (session?.user) {
      await ensureProfile(session.user);
      callback({ user: session.user });
    } else {
      callback(null);
    }
  });
  return () => subscription.unsubscribe();
}
