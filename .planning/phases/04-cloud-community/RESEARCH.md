# Research: Phase 4 – Cloud & Community

**Roadmap**: Phase 4: Cloud & Community  
**Goal**: Students can share licks and teachers can see their dashboards remotely.

---

## What We Need to Know to Plan This Phase

### 1. Current State (No Cloud Yet)

- **Profiles**: `useProfileStore` (Zustand + persist) holds `StudentProfile[]` with `songProgress: Map<string, SongProgress>`, `totalPracticeTime`, `achievements`. Stored locally only.
- **Progress**: `SongProgress` has `songTitle`, `maxBpm`, `attempts`, `lastPracticed`, `mastered`, `hotspotScores: Map<number, number>`. Maps are serialized via Zustand persist; Supabase will need normalized tables (e.g. `song_progress`, `hotspot_scores`).
- **Licks**: `LickLibrary` uses `SavedLick { id, name, template }` in localStorage (`chord-lab-lick-library`). Template is degree-based (e.g. `"1 2 b3 5"`). No server; sharing = publish to cloud + feed to consume.
- **PWA**: `public/manifest.json` exists (short_name, name, icons, start_url, display, theme/background). No service worker found; offline and installability need to be completed.

### 2. Supabase Integration

- **Auth**: Use Supabase Auth (email/password or OAuth) so users have a stable `user.id` for profiles and progress. Anonymous or “device profile” → “signed-in profile” merge is optional for later.
- **Schema**: 
  - `profiles` (1:1 with auth.users): display_name, avatar_url, role (student | teacher), created_at.
  - `classrooms`: teacher_id, name, invite_code; students linked via `classroom_students(classroom_id, student_id)`.
  - `song_progress`: user_id, song_title, max_bpm, attempts, last_practiced, mastered; optional `hotspot_scores` JSONB or separate table.
  - `licks`: id, user_id, name, template, created_at; public flag or visibility for feed.
- **RLS**: Students see own progress and own licks; teachers see progress of students in their classrooms; lick feed can be public or follow-based.
- **Realtime (optional)**: Supabase Realtime for live dashboard updates (e.g. when a student completes a run); can be Wave 2+.

### 3. Teacher Dashboard (REQ-CC-01)

- **Data**: Aggregate per student: BPM per song, heatmap/summary of hotspot scores, last practiced. Stored in `song_progress` (+ optional snapshot for heatmap blob).
- **UI**: Classroom list → Student list → Student detail (songs, BPM, heatmaps). No backend yet for “heatmap blob”; can sync summary stats first and add heatmap export in a follow-up.

### 4. Lick Social Feed (REQ-CC-02)

- **Publish**: From LickLibrary, “Publish to feed” saves to `licks` with user_id and template/name; optional tags (chord type, style).
- **Subscribe**: Feed UI: list public (or followed) licks with template, author, “Copy to my library” (insert into local or synced SavedLick).

### 5. PWA Optimization (REQ-CC-03)

- **Service worker**: Vite PWA plugin or Workbox; cache app shell and static assets; optional cache-first for audio stems.
- **Offline**: App loads from cache; auth and sync queue when back online (optional: persist mutations in IndexedDB and flush to Supabase).
- **Manifest**: Update name/short_name to product name (e.g. Chord Lab / ITM), add proper icons (logo128.png, logo512.png already in public), categories, display.

### 6. Dependencies

- Phase 3 (Sonic Layer) is not a hard dependency for Phase 4; Cloud can proceed in parallel or after. Dependency: Phase 2 (Mastery Tree) provides song tagging and progress semantics that align with `song_progress` and teacher views.

---

## Summary

- **Supabase**: New dependency; add `@supabase/supabase-js`; env vars for URL and anon key.
- **Auth first**: Then profiles and progress sync (one-way or two-way with conflict strategy).
- **Teacher dashboard**: Reads from Supabase; classrooms and RLS define who sees what.
- **Lick feed**: Write from LickLibrary to Supabase; new Feed component to read and “copy to library”.
- **PWA**: Service worker + manifest update + offline strategy for practice room use.
