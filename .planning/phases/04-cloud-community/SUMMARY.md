# Phase 4: Cloud & Community – Summary

## Wave 1: Supabase & Auth + Progress Sync ✅

- **W1-T1**: Added `@supabase/supabase-js`, `src/core/supabase/client.ts` with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` and `isSupabaseConfigured()`.
- **W1-T2**: Added `src/core/supabase/schema.sql`: `profiles` (id, display_name, avatar_url, role), `song_progress` (user_id, song_title, max_bpm, attempts, last_practiced, mastered, hotspot_scores JSONB), RLS and triggers.
- **W1-T3**: Auth flow: `src/core/supabase/auth.ts` (signIn, signUp, signOut, ensureProfile, onAuthStateChange), `AuthContext`, `AuthDialog`, "Sign in to sync" in GlobalSettings when Supabase configured and no session; `AuthProvider` in App.
- **W1-T4**: `useSupabaseProgressSync` hook: push local `useProfileStore` progress to Supabase (upsert), hydrate from Supabase on sign-in; `mergeProgressFromCloud` on profile store.
- **W1-T5**: `SyncBridge` in App mounts the sync hook; hydrate on sign-in then push once; debounced sync on profile changes.

## Wave 2: Teacher Dashboard UI (in progress)

- Pending: schema extension (classrooms, classroom_students), TeacherDashboard page/route, StudentProgressView, teacher role guard.
