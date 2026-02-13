# Phase 30 Research: Innovative Exercises Revamp + Layers/Levels

## Purpose

Plan the **Innovative Exercises Revamp** (progress-connected, AI recommendations, "For You" UI) and the addition of **exercise layers and levels** so recommendations and manual play can target difficulty and progression.

## Existing Assets

### Module (Phase 17)

- **Route**: `/innovative-exercises`; **Module**: `InnovativeExercisesModule.tsx` (sidebar of six exercises, mic toggle, `MicPianoVisualizer`).
- **Panels**: `GhostNoteMatchPanel`, `IntonationHeatmapPanel`, `VoiceLeadingMazePanel`, `SwingPocketPanel`, `CallAndResponsePanel`, `GhostRhythmPanel`.
- **Hooks**: `useGhostNoteMatch`, `useIntonationHeatmap`, `useVoiceLeadingMaze`, `useSwingPocket`, `useCallAndResponse`, `useGhostRhythm`.
- **Types**: `LickEvent`, `GhostNoteLick`, `IntonationClassification`, `SwingPocketResult`, `CallResponsePair`; exercise IDs: `ghost-note | intonation-heatmap | voice-leading | swing-pocket | call-response | ghost-rhythm`.
- **Voice-Leading**: `getVoiceLeadingProgressionsFromStandards(standards)` → `VoiceLeadingProgressionOption[]` (id, name, chords, standard?); default ii–V–I (Dm7 G7 Cmaj7). Panel already supports progression picker and band backing via `useJazzBand`.

### Progress & AI

- **Stores**: `useSessionHistoryStore`, `useScoringStore`, `useMasteryStore`, `useMasteryTreeStore`, `useProfileStore`; standards heatmap (e.g. from Standards Exercises).
- **AI**: `jazzTeacherLogic.ts` — `createGeminiSession(systemPrompt, opts)`, `generateStandardsExerciseAnalysis(sessionData)`; pattern: structured prompt → parse JSON from model reply.
- **Sync**: `itmSyncService` for cloud history when needed.

### Theory & Audio

- **ChordScaleEngine**, **GuideToneCalculator** (per-chord 3rd/7th); **ghost-note licks** in `data/ghostNoteLicks.ts`; **call-and-response** reference in `data/callAndResponseBreak.ts`.
- **Mic**: SwiftF0, `useITMPitchStore`, `useHighPerformancePitch`, `frequencyToNote`; optional MIDI via `ExerciseInputAdapter` (JazzKiller).

## Layers vs Levels (Definition)

- **Layer**: A **category or band** used for grouping and filtering, and for AI to target recommendations. Not necessarily a difficulty ladder.
  - **Category layer**: Ear vs Rhythm (maps to exercise types: Ghost Note, Intonation Heatmap, Voice-Leading = Ear; Swing Pocket, Call and Response, Ghost Rhythm = Rhythm).
  - **Difficulty layer** (optional): Beginner | Intermediate | Advanced — used in "For You" and in exercise config to choose params (tempo, number of chords, key complexity).
- **Level**: A **per-exercise progression step** that changes concrete params (key, chords, tempo, bars, lick, tolerance). Levels are what the panel and hook actually run with.
  - **Voice-Leading Maze**: Level 1 = 2 chords one key (e.g. Dm7–G7), Level 2 = 3 chords one key (ii–V–I), Level 3 = same in 2–3 keys or longer progression from library.
  - **Ghost Note**: Level 1 = one ghost, slow BPM; Level 2 = one ghost faster or harder lick; Level 3 = optional second ghost (if we add multi-ghost later) or faster.
  - **Intonation Heatmap**: Level 1 = degrees 1–5; Level 2 = full 1–7; Level 3 = optional just intonation bands (blue) or multiple scales.
  - **Swing Pocket**: Level 1 = 80 BPM; Level 2 = 120; Level 3 = 160 or "Push/Lay Back" challenge.
  - **Call and Response**: Level 1 = simple 2-bar break; Level 2 = harder break id; Level 3 = longer or syncopated.
  - **Ghost Rhythm**: Level 1 = 80 BPM 4/4; Level 2 = 120; Level 3 = 140 or stricter tolerance.

Levels are **numeric (1–3)** or **named (e.g. beginner, intermediate, advanced)**; implementation can use a small config map per `exerciseId` → list of level configs (key, tempo, progressionId, lickId, etc.).

## Integration with Revamp

- **Progress summary**: Include optional "last level completed" or "preferred level" per exercise from a lightweight store (e.g. `useInnovativeExerciseProgressStore`) so AI can suggest "next level" or "same level, different key." v1 can skip persistence and derive difficulty from mastery/session data only.
- **AI recommendations**: Output includes `level` (1 | 2 | 3 or string) and optional `layer` (ear | rhythm, beginner | intermediate | advanced). UI and parameterized launch pass `level` into panels.
- **Parameterized launch**: Panels accept `initialParams: { key?, progressionId?, lickId?, tempo?, level? }`. When `level` is present, resolve to concrete key/progression/tempo/lick from a level config; otherwise keep current behavior (user picks manually).
- **"For You" UI**: Show layer/level on recommendation cards (e.g. "Intermediate • Voice-Leading Maze • ii–V–I in F").

## Constraints

- **Read-only progress**: Revamp and level logic **read** from session/mastery/profile/heatmap; any "level completed" or "last level played" for Innovative Exercises can live in a **separate** small store that only this module writes to (so REQ-IER-02 is satisfied for the main progress stores).
- **No new exercise types**: Layers/levels only parameterize the existing six exercises (REQ-IER-14 "new exercise types" remains deferred).
- **Mic pipeline unchanged**: Same SwiftF0/useITMPitchStore/useHighPerformancePitch; levels only change content and difficulty, not input stack.

## Open Decisions

- **Level persistence**: v1 = no persistence (level comes from recommendation or manual pick only); v2 = optional store for "last level per exercise" to suggest "next level" and show progress.
- **Level config location**: Single module config file (e.g. `innovativeExerciseLevels.ts`) mapping `exerciseId` → `LevelConfig[]` (tempo, key, progressionId, lickId, bars, tolerance) vs. inline in each panel. Prefer **single config** so AI and "For You" share one source of truth.
- **Ear/Rhythm and difficulty layers**: Expose in UI as filters (e.g. "Ear" / "Rhythm"; "Beginner" / "Intermediate" / "Advanced") and in AI prompt so recommendations can say "focus on rhythm" or "try intermediate."

## References

- Milestone: `.planning/milestones/innovative-exercises-revamp/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- Phase 17: `.planning/phases/17-innovative-exercises/` (PLAN.md, SUMMARY.md, VERIFICATION.md).
- jazzTeacherLogic: `src/modules/JazzKiller/ai/jazzTeacherLogic.ts` (createGeminiSession, generateStandardsExerciseAnalysis).
- Voice-leading progressions: `src/modules/InnovativeExercises/core/voiceLeadingProgressions.ts`.
