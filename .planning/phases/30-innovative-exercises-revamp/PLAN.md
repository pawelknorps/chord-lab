---
phase: 30
name: Innovative Exercises Revamp (Progress + AI + Layers/Levels)
waves: 5
dependencies:
  - "Phase 17: Innovative Interactive Exercises (six panels, hooks, mic pipeline)"
  - "Phase 13: Standards Exercises (ExerciseInputAdapter, GuideToneCalculator)"
  - "JazzKiller: useJazzLibrary, jazzTeacherLogic, globalAudio"
  - "Stores: useSessionHistoryStore, useScoringStore, useMasteryStore, useMasteryTreeStore, useProfileStore"
files_modified:
  - "src/modules/InnovativeExercises/InnovativeExercisesModule.tsx"
  - "src/modules/InnovativeExercises/components/GhostNoteMatchPanel.tsx"
  - "src/modules/InnovativeExercises/components/IntonationHeatmapPanel.tsx"
  - "src/modules/InnovativeExercises/components/VoiceLeadingMazePanel.tsx"
  - "src/modules/InnovativeExercises/components/SwingPocketPanel.tsx"
  - "src/modules/InnovativeExercises/components/CallAndResponsePanel.tsx"
  - "src/modules/InnovativeExercises/components/GhostRhythmPanel.tsx"
  - "src/modules/JazzKiller/ai/jazzTeacherLogic.ts"
files_created:
  - "src/modules/InnovativeExercises/services/InnovativeExerciseProgressService.ts"
  - "src/modules/InnovativeExercises/config/innovativeExerciseLevels.ts"
  - "src/modules/InnovativeExercises/ai/generateInnovativeExerciseRecommendations.ts"
  - "src/modules/InnovativeExercises/components/ForYouSection.tsx"
---

# Phase 30 Plan: Innovative Exercises Revamp + Layers/Levels

**Focus**: Connect the Innovative Exercises module to student progress and AI recommendations, and add **exercise layers** (Ear/Rhythm, optional Beginner/Intermediate/Advanced) and **levels** (per-exercise difficulty steps) so recommendations and manual play can target the right difficulty. Delivers "For You" section, parameterized launch with library content, and level-aware panels.

**Milestone**: `.planning/milestones/innovative-exercises-revamp/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).

**Success Criteria**:
- REQ-IER-01..10 (progress summary, read-only, AI recommendations, fallback, parameterized launch, library audio, mic unchanged, "For You" UI, manual list preserved, refresh).
- **Layers**: Category (Ear | Rhythm) and optional difficulty band (Beginner | Intermediate | Advanced) available for filtering and AI; recommendation output includes `layer` and `level`.
- **Levels**: Per-exercise level config (1–3 or named) drives key, progression, tempo, lickId, etc.; panels accept `initialParams.level` and resolve to concrete params from config.

---

## Context (Existing Assets)

- **Phase 17**: Six exercises, `InnovativeExercisesModule`, panels/hooks, mic + optional MIDI; Voice-Leading uses `getVoiceLeadingProgressionsFromStandards`, Ghost Note uses ghost-note licks, Call and Response uses reference break.
- **Progress**: useSessionHistoryStore, useScoringStore, useMasteryStore, useMasteryTreeStore, useProfileStore; standards heatmap where available.
- **AI**: jazzTeacherLogic `createGeminiSession`, `generateStandardsExerciseAnalysis`; structured prompt → parse JSON.
- **Research**: See RESEARCH.md for layers vs levels definition and level config per exercise.

---

## Wave 1: Progress Summary & Data Layer

*Goal: Aggregate progress from all app sources into a single summary for AI; read-only.*

- <task id="W1-T1">**Progress summary builder**  
  Implement `InnovativeExerciseProgressService.getSummary()` (or `buildInnovativeExerciseProgressSummary()`). Consume useSessionHistoryStore (last N PerformanceSegments: standardId, weak measures, overallScore, key), useScoringStore, useMasteryStore/useMasteryTreeStore (unlocked skills, XP), useProfileStore (song progress, hotspots, max BPM); optionally standards heatmap store. Output a JSON-serializable structure (e.g. `InnovativeExerciseProgressSummary` type) suitable for prompt injection. File: `src/modules/InnovativeExercises/services/InnovativeExerciseProgressService.ts`.</task>

- <task id="W1-T2">**Read-only guarantee**  
  Ensure the progress summary path only reads from the above stores; no writes. Document in service or REQUIREMENTS that REQ-IER-02 is satisfied (no mutations to session history, profile, mastery, heatmap from this module).</task>

---

## Wave 2: AI Recommendation Engine

*Goal: AI consumes progress summary and returns structured recommendations including exerciseId, params (key, chords, lickId, tempo, level), layer, and reason.*

- <task id="W2-T1">**Recommendation function**  
  Implement `generateInnovativeExerciseRecommendations(progressSummary)` (e.g. in `src/modules/InnovativeExercises/ai/generateInnovativeExerciseRecommendations.ts`). Use Gemini Nano via createGeminiSession (reuse pattern from jazzTeacherLogic). Prompt must require **structured output** (JSON): array of recommendations with `exerciseId`, `params` (key, chord(s), tempo, lickId, progressionId, **level**), **layer** (ear | rhythm; optional difficulty: beginner | intermediate | advanced), and **reason**. Parse and validate (exerciseId in allowed set, level 1–3 or named) before returning to UI.</task>

- <task id="W2-T2">**Fallback when empty or sparse progress**  
  When progress summary is empty or very sparse, return sensible defaults: e.g. one generic recommendation per category (Ear + Rhythm) or "Try all six" with default level 1 params, so new users can use the module without errors (REQ-IER-04).</task>

---

## Wave 3: Exercise Levels Config & Parameterized Launch

*Goal: Define level config per exercise; panels accept initial params (key, progression, lickId, tempo, level) and resolve level to concrete content; library-backed content.*

- <task id="W3-T1">**Level config**  
  Create `innovativeExerciseLevels.ts` (or equivalent): for each exerciseId, define a small list of levels (e.g. 1, 2, 3) with concrete params (key, tempo, progressionId or chords, lickId, bars, tolerance where applicable). Voice-Leading: level 1 = 2 chords one key, level 2 = ii–V–I one key, level 3 = ii–V–I in 2 keys or progression from library. Ghost Note: level 1 = one lick slow BPM, level 2 = same or different lick faster. Intonation: level 1 = degrees 1–5, level 2 = 1–7. Swing Pocket / Call and Response / Ghost Rhythm: level 1–3 = BPM and/or reference break id. Expose helper `getParamsForLevel(exerciseId, level)` returning params for launch.</task>

- <task id="W3-T2">**Parameterized launch – Voice-Leading, Ghost Note, Intonation**  
  Extend VoiceLeadingMazePanel, GhostNoteMatchPanel, IntonationHeatmapPanel (and their hooks) to accept `initialParams?: { key?, progressionId?, chords?, lickId?, tempo?, level? }`. On mount, if initialParams is set, apply it (e.g. set selected progression, key, BPM); if `level` is set, resolve via getParamsForLevel and apply resulting params. Wire so "Start" uses these params; content comes from library (progressions from getVoiceLeadingProgressionsFromStandards, licks from ghostNoteLicks, scales from ChordScaleEngine). REQ-IER-05, REQ-IER-06.</task>

- <task id="W3-T3">**Parameterized launch – Swing Pocket, Call and Response, Ghost Rhythm**  
  Extend SwingPocketPanel, CallAndResponsePanel, GhostRhythmPanel to accept `initialParams?: { tempo?, level?, referenceBreakId? }`. Resolve level to BPM and optional reference; panels use these when user starts the exercise. REQ-IER-05, REQ-IER-06.</task>

- <task id="W3-T4">**Mic pipeline unchanged**  
  Confirm all six exercises still use SwiftF0, useITMPitchStore, useHighPerformancePitch (and optional MIDI via existing adapters); no new input stack. REQ-IER-07.</task>

---

## Wave 4: "For You" UI & Refresh

*Goal: "For You" / Recommended section with recommendation cards (reason, exercise name, layer/level); click launches exercise with recommended params; manual list preserved; refresh from progress.*

- <task id="W4-T1">**For You section**  
  Add a "For You" / "Recommended" section to InnovativeExercisesModule (e.g. above or beside the sidebar). Create `ForYouSection.tsx`: on mount (and on refresh), call `InnovativeExerciseProgressService.getSummary()` then `generateInnovativeExerciseRecommendations(summary)`; render recommendation cards showing reason, exercise name, and optional layer/level (e.g. "Intermediate • Voice-Leading Maze"). On card click: set selected exercise and pass recommended params (including level) into the corresponding panel so it launches with those params. REQ-IER-08.</task>

- <task id="W4-T2">**Manual list preserved**  
  Keep the existing sidebar list of all six exercises; user can ignore "For You" and select any exercise manually; behavior matches current Phase 17 when no initialParams are passed. REQ-IER-09.</task>

- <task id="W4-T3">**Refresh**  
  Add a refresh trigger (e.g. "Refresh recommendations" button or refresh when route is re-entered after a session). Re-fetch progress summary and recommendations so new session/heatmap data influences next "For You" list. REQ-IER-10.</task>

---

## Wave 5: Verification & Docs

*Goal: Manual verification, optional tests, update milestone STATE and phase SUMMARY.*

- <task id="W5-T1">**Verification**  
  Run through: (1) New user: open Innovative Exercises → see default recommendations or full list, no errors. (2) User with progress: see "For You" cards with reason and layer/level; click one → exercise launches with correct key/progression/tempo. (3) Manual pick: choose any exercise from sidebar → works as before. (4) Refresh: after doing an ITM or Standards session, refresh recommendations → list updates when summary changed. (5) Levels: launch Voice-Leading at level 2 → ii–V–I in one key; level 1 → 2 chords. REQ-IER-01..10 and level behavior.</task>

- <task id="W5-T2">**Docs**  
  Update `.planning/milestones/innovative-exercises-revamp/STATE.md` with phase completion and next steps. Add phase SUMMARY.md under `.planning/phases/30-innovative-exercises-revamp/` summarizing waves and deliverables. Optionally add VERIFICATION.md checklist.</task>

---

## Plan Verification

- [ ] Phase 30 aligns with milestone `.planning/milestones/innovative-exercises-revamp/` (REQ-IER-01..10).
- [ ] All five waves covered: progress summary, AI recommendations (with level/layer), level config + parameterized launch, "For You" UI + refresh, verification & docs.
- [ ] Layers (Ear/Rhythm, optional difficulty) and levels (per-exercise 1–3) defined in RESEARCH.md and implemented in config + AI output + UI.
- [ ] Dependencies (Phase 17, stores, jazzTeacherLogic, library) documented and satisfied.
- [ ] No new exercise types; mic pipeline unchanged; read-only consumption of progress stores.
