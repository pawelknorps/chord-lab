import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

// Only treat as configured when URL looks valid (avoids createClient() getting empty string)
const isConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  supabaseUrl.startsWith('https://');

const noop = () => {};
const emptyPromise = Promise.resolve({ data: null, error: null });
const emptyData = () => ({ data: { session: null }, error: null });
const emptyUser = () => ({ data: { user: null }, error: null });
const chain = () => ({
  select: () => chain(),
  insert: () => chain(),
  upsert: () => chain(),
  eq: () => chain(),
  in: () => chain(),
  order: () => chain(),
  range: () => chain(),
  then: (resolve: (v: { data: null; error: null }) => void) => {
    resolve({ data: null, error: null });
    return emptyPromise;
  },
});

/** No-op Supabase client when env vars are missing (e.g. local dev). Never calls the real SDK. */
const mockClient = {
  auth: {
    getSession: () => Promise.resolve(emptyData()),
    getUser: () => Promise.resolve(emptyUser()),
    signInWithPassword: () => emptyPromise,
    signUp: () => emptyPromise,
    signOut: () => emptyPromise,
    onAuthStateChange: (_: (e: string, s: unknown) => void) => ({
      data: { subscription: { unsubscribe: noop } },
    }),
  },
  from: () => chain(),
} as unknown as SupabaseClient;

export const supabase: SupabaseClient =
  isConfigured && supabaseUrl.length > 0 && supabaseAnonKey.length > 0
    ? createClient(supabaseUrl, supabaseAnonKey)
    : mockClient;

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}
