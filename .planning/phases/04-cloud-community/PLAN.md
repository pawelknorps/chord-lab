---
phase: 4
name: Cloud & Community
waves: 4
dependencies: ["Phase 2: The Mastery Tree"]
files_modified: [
  "src/core/profiles/useProfileStore.ts",
  "src/core/profiles/ProfileTypes.ts",
  "src/modules/JazzKiller/components/LickLibrary.tsx",
  "public/manifest.json",
  "package.json",
  "src/App.tsx"
]
files_created: [
  "src/core/supabase/client.ts",
  "src/core/supabase/auth.ts",
  "src/core/supabase/schema.sql",
  "src/pages/TeacherDashboard.tsx",
  "src/components/TeacherDashboard/ClassroomList.tsx",
  "src/components/TeacherDashboard/StudentProgressView.tsx",
  "src/components/LickFeed/LickFeed.tsx",
  "src/components/LickFeed/PublishLickModal.tsx",
  "src/hooks/useSupabaseProgressSync.ts",
  "src/hooks/useLickFeed.ts"
]
---

# Phase 4 Plan: Cloud & Community

Focus: Scale from local-first to a connected ecosystem. Students share licks; teachers see dashboards remotely.

**Success Criteria**: Students can share licks and teachers can see their dashboards remotely.

---

## Wave 1: Supabase & Auth + Progress Sync

*Goal: Backend in place and user progress syncing to Supabase.*

- <task id="W1-T1">Add Supabase dependency and create `src/core/supabase/client.ts` with env-based URL and anon key.</task>
- <task id="W1-T2">Create Supabase schema: `profiles` (id, display_name, avatar_url, role), `song_progress` (user_id, song_title, max_bpm, attempts, last_practiced, mastered, hotspot_scores JSONB), and RLS policies so users see only their own data.</task>
- <task id="W1-T3">Implement auth flow: sign-up/sign-in UI (or minimal auth gate), persist session; create or update `profiles` row on sign-in.</task>
- <task id="W1-T4">Create `useSupabaseProgressSync` hook: on session present, push local `useProfileStore` song progress to Supabase (upsert by user_id + song_title); on load, optionally hydrate store from Supabase for signed-in users.</task>
- <task id="W1-T5">Wire sync into app lifecycle: run sync after login and after significant progress updates (e.g. session end or BPM update).</task>

---

## Wave 2: Teacher Dashboard UI

*Goal: Teachers can create classrooms and view student progress (BPM, heatmaps).*

- <task id="W2-T1">Extend schema: `classrooms` (id, teacher_id, name, invite_code), `classroom_students` (classroom_id, student_id). RLS: teachers see their classrooms and those students’ progress.</task>
- <task id="W2-T2">Build `TeacherDashboard` page and route: list classrooms; create classroom (name, generate invite code); view students in a classroom.</task>
- <task id="W2-T3">Build `StudentProgressView`: per-student list of songs with max BPM, last practiced, mastered flag; optional link or embed to heatmap summary (if we store heatmap data in progress or a separate table).</task>
- <task id="W2-T4">Add role to `profiles`: allow “teacher” role to access dashboard route; students get normal app only.</task>

---

## Wave 3: Lick Social Feed

*Goal: Publish and subscribe to lick formulas.*

- <task id="W3-T1">Add `licks` table: id, user_id, name, template, created_at, public (boolean). RLS: owner can CRUD; public licks readable by all.</task>
- <task id="W3-T2">Add “Publish to feed” in `LickLibrary`: save current lick to Supabase with user_id; show success state.</task>
- <task id="W3-T3">Build `LickFeed` component: fetch public licks (paginated); display name, template, author; “Copy to my library” inserts into local LickLibrary storage and optionally into user’s synced licks.</task>
- <task id="W3-T4">Add Feed entry point to app (e.g. tab or section in Lick Library or dashboard).</task>

---

## Wave 4: PWA Optimization

*Goal: Reliable install and offline practice room use.*

- <task id="W4-T1">Update `public/manifest.json`: product name (e.g. Chord Lab / ITM), add icons (logo128.png, logo512.png), set categories and display for standalone.</task>
- <task id="W4-T2">Register a service worker (Vite PWA plugin or Workbox): cache app shell and critical static assets; ensure start_url and scope correct.</task>
- <task id="W4-T3">Test install on mobile/desktop and offline: app loads from cache; document any limitations (e.g. auth/sync require network).</task>

---

## Verification

- [ ] Signed-in user’s progress (BPM, mastered, hotspot summary) appears in Supabase and survives new session.
- [ ] Teacher can create a classroom, share invite; student can join; teacher sees that student’s progress in the dashboard.
- [ ] A published lick appears in the Lick Feed; another user can “Copy to my library” and use it in LickLibrary.
- [ ] PWA installs from browser; app loads from cache when offline (with documented limits for sync/auth).
