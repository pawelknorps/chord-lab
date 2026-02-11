# Phase 4: Cloud & Community – Verification

**Phase goal (from ROADMAP)**: Students can share licks and teachers can see their dashboards remotely.

## Verification checklist

- [ ] **Progress sync**: Signed-in user's progress (BPM, mastered, hotspot summary) appears in Supabase and survives new session. *Requires Supabase project with schema applied and env vars set.*
- [ ] **Teacher dashboard**: Teacher can create a classroom, share invite code; student can join (via classroom_students); teacher sees that student's progress in the dashboard. *Requires profile.role = 'teacher' and classroom_students populated.*
- [ ] **Lick feed**: A published lick appears in the Lick Feed; another user can "Copy to my library" and use it in Lick Library. *Requires at least one published lick and Supabase licks table.*
- [ ] **PWA**: App installs from browser (Add to Home Screen); app loads from cache when offline. *Auth and sync require network when back online.*

## Implemented

| Requirement | Implementation |
|-------------|----------------|
| REQ-CC-01 Teacher Dashboard | TeacherDashboard page, ClassroomList, StudentProgressView, RLS for classrooms and song_progress read by teachers |
| REQ-CC-02 Lick Sharing | licks table, Publish in LickLibrary, LickFeed with Copy to library, /lick-feed route |
| REQ-CC-03 Mobile PWA | manifest.json (Chord Lab, icons), vite-plugin-pwa (service worker, autoUpdate) |

## Notes

- Supabase schema must be run manually in the Supabase SQL Editor (`src/core/supabase/schema.sql`).
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for auth and sync.
- Teacher role: set `profiles.role = 'teacher'` in Supabase for the teacher user.
- Student join flow: not yet implemented (teacher can add students via Supabase or a future "Join classroom" UI with invite code).
