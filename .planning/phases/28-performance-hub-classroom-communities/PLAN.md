# Phase 28 Plan: Performance Hub - Classroom & Communities 🏫

Focus: Transform individual practice data into a collaborative ecosystem. Connect students via the "Lick Hub" and empower teachers with the "Classroom Dashboard."

## Wave 1: Data Sync Logic
*Priority: High. Requirement: REQ-CC-01.*

<task id="itmSyncService">
- [ ] **Task 1: Implement itmSyncService**
  - Create `itmSyncService.ts` to push/pull performance history and solos.
  - Integration: `useSessionHistoryStore` and `useSoloStore` subscribe to sync events.
  - Schema: `performance_history` (standard_id, score, bpm, user_id), `solos` (transcription, notes_json, user_id, is_public).
</task>

<task id="syncUI">
- [ ] **Task 2: Sync Status & Sharing Controls**
  - Add `CloudUpload` / `CloudCheck` icons to the `ProgressPage` header.
  - Implement "Post to Lick Hub" toggle in the solo detail modal.
  - Files: `src/pages/ProgressPage.tsx`, `src/modules/ITM/components/SoloDetailView.tsx`.
</task>

## Wave 2: The Lick Hub
*Focus: Peer learning and qualitative discovery.*

<task id="lickHubView">
- [ ] **Task 3: Implementation of LickHub Page**
  - Create a "Discovery" feed of community licks.
  - Sort by Standard or Instrument.
  - Audition: Clicking a lick plays it back using the browser's MIDI `Synth`.
  - Files: `src/pages/LickHubPage.tsx`, `src/modules/Community/components/LickCard.tsx`.
</task>

<task id="aiLickBreakdown">
- [ ] **Task 4: AI Musical Analysis Overlay**
  - Use Gemini Nano to explain why a shared lick works (e.g., "Student used a descending C-7 arpeggio into an F7 altered scale").
  - Files: `src/modules/JazzKiller/ai/jazzTeacherLogic.ts`.
</task>

## Wave 3: Teacher Dashboard
*Focus: Monitoring and Pedagogy at Scale.*

<task id="teacherDashboard">
- [ ] **Task 5: Implement Classroom Dashboard**
  - Interface for users with role `teacher`.
  - View: Student list with "Last Practice" and "Mastery Level" columns.
  - Deep Dive: Clicking a student renders their specific Mastery Tree (read-only) and Trend charts.
  - Files: `src/pages/TeacherDashboardPage.tsx`.
</task>

<task id="teacherSync">
- [ ] **Task 6: Implement Teacher Analytics Service**
  - Aggregate stats across all students to show "Class Hotspots" (e.g., "60% of students struggle with bar 12 of Misty").
  - Files: `src/core/services/TeacherAnalyticsService.ts`.
</task>

## Verification Criteria

- [ ] Successful sync of a local performance segment to Supabase verified via console/IDE.
- [ ] Solos marked as "Public" appear in the Lick Hub feed.
- [ ] Teacher view correctly fetches and renders a different user's session data.
- [ ] "Add to Practice" adds a community lick to the local `useSoloStore` successfully.
- [ ] AI Analysis provides musically accurate context for shared community licks.
