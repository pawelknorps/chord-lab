# Innovative Exercises Revamp – Requirements

## v1 Requirements (Current Milestone)

### Progress & Data Layer

#### REQ-IER-01: Progress summary for AI

- **Requirement**: Provide an aggregated **progress summary** that the AI can consume to craft recommendations.
- **Content**: At least (a) recent session history (last N PerformanceSegments: standardId, weak measures, overallScore, key), (b) per-standard or per-song accuracy/heatmap where available, (c) mastery tree state (unlocked skills, XP or equivalent), (d) song progress (e.g. hotspots, max BPM, mastered flags).
- **Format**: Structured object (e.g. JSON-serializable) suitable for prompt injection or API call.
- **Source**: useSessionHistoryStore, useScoringStore, useMasteryStore / useMasteryTreeStore, useProfileStore; Standards exercise heatmap store; optional itmSyncService for cloud history.
- **Acceptance**: A function or service can produce this summary on demand; summary includes at least session history and one of mastery/song progress/standards heatmap when data exists.

#### REQ-IER-02: Read-only consumption of progress

- **Requirement**: Innovative Exercises revamp **reads** from session history, profile, mastery, and standards heatmaps only; it does **not** write or mutate those stores.
- **Acceptance**: No new writes to useSessionHistoryStore, useProfileStore, useMasteryStore, useMasteryTreeStore, or standards heatmap store from the Innovative Exercises recommendation path.

---

### AI Exercise Crafting

#### REQ-IER-03: AI recommendation function

- **Requirement**: Implement an AI-driven function (e.g. `generateInnovativeExerciseRecommendations(progressSummary)`) that returns **structured recommendations** for Innovative Exercises.
- **Input**: Progress summary (REQ-IER-01).
- **Output**: One or more recommendations; each includes: **exerciseId** (ghost-note | intonation-heatmap | voice-leading | swing-pocket | call-response | ghost-rhythm), **params** (key, chord(s), tempo, lickId or progression slice, difficulty hint as needed), **reason** (short human-readable explanation for UI).
- **Tech**: Reuse Gemini Nano (createGeminiSession) and jazzTeacherLogic pattern; prompt must ask for structured output (e.g. JSON or fixed format) so UI can parse and launch.
- **Acceptance**: Given a non-empty progress summary, the function returns at least one recommendation with valid exerciseId and params; reason is present for display.

#### REQ-IER-04: Fallback when no or sparse progress

- **Requirement**: When progress summary is empty or very sparse, the system still shows a sensible default (e.g. generic “Try Voice-Leading Maze in C” or list of all six exercises) so the module is usable for new users.
- **Acceptance**: New user (no sessions, no song progress) can open Innovative Exercises and see either default recommendations or the full list of six exercises without errors.

---

### Mic-Ready Delivery & Library Audio

#### REQ-IER-05: Parameterized launch of existing exercises

- **Requirement**: Each of the six existing exercise types must be **launchable with parameters** (key, chord(s), lickId, tempo, etc.) so AI recommendations can drive concrete content.
- **Scope**: At minimum Voice-Leading Maze (key + progression), Ghost Note (lickId or equivalent), Intonation Heatmap (key + scale); Swing Pocket / Call and Response / Ghost Rhythm (tempo, reference break id if applicable).
- **Acceptance**: UI can start e.g. Voice-Leading Maze with Dm7–G7–Cmaj7 in F and Ghost Note with a specific lick from the library; exercise runs with mic and shows correct targets.

#### REQ-IER-06: Musical content from existing library

- **Requirement**: Recommended exercises use **musical audio from the existing library**: licks (ghost-note licks, call-and-response breaks), ChordScaleEngine/GuideToneCalculator for scales and guide tones, existing backing/stems or Tone.js patterns.
- **Acceptance**: No “placeholder” or generic-only content for recommended exercises; at least one exercise type (e.g. Ghost Note or Voice-Leading Maze) uses library lick or library-driven chords/scales in a recommended run.

#### REQ-IER-07: Mic pipeline unchanged

- **Requirement**: All exercises continue to use the existing mic pipeline (SwiftF0, useITMPitchStore, useHighPerformancePitch, frequencyToNote) and optional MIDI; no new input stack.
- **Acceptance**: Recommended exercise runs with mic on; pitch and rhythm feedback behave as in Phase 17.

---

### UI & Navigation

#### REQ-IER-08: “For You” / Recommended section

- **Requirement**: Innovative Exercises module includes a **“For You”** (or “Recommended”) section that displays AI-generated recommendations (reason + exercise name + optional params summary).
- **Acceptance**: User can open Innovative Exercises and see at least one recommendation when progress data exists; clicking a recommendation launches the corresponding exercise with the recommended params.

#### REQ-IER-09: Manual exercise list preserved

- **Requirement**: The existing sidebar list of all six exercises remains available so users can pick an exercise manually without using recommendations.
- **Acceptance**: User can ignore “For You” and select any of the six exercises from the list; behavior matches current Phase 17.

#### REQ-IER-10: Recommendations refresh from progress

- **Requirement**: Recommendations can be refreshed (e.g. after returning from a practice session or on explicit “Refresh”); new progress (e.g. latest session, updated heatmap) should influence the next recommendations.
- **Acceptance**: After completing an ITM or Standards session, reopening Innovative Exercises (or refreshing) shows updated recommendations when progress summary has changed.

---

## v2 / Deferred

- **REQ-IER-11**: Teacher-assigned exercises (teacher picks an exercise + params for a student from dashboard).
- **REQ-IER-12**: Real-time adaptation (AI changes difficulty or focus mid-session based on live performance).
- **REQ-IER-13**: Explicit “Ear / Rhythm” progress integration (useEarPerformanceStore, Rhythm Architect) in progress summary and recommendations.
- **REQ-IER-14**: New exercise types (beyond the six) that are still mic-ready and library-backed.

---

## Out of Scope

- Duplicate or replacement pitch/rhythm pipelines.
- Full DAW-style exercise authoring.
- Multi-user real-time jam inside Innovative Exercises.

---

## Summary

| ID | Category | Description |
|----|----------|-------------|
| REQ-IER-01 | Progress | Aggregated progress summary for AI |
| REQ-IER-02 | Progress | Read-only consumption of progress stores |
| REQ-IER-03 | AI | AI recommendation function (structured output) |
| REQ-IER-04 | AI | Fallback when no/sparse progress |
| REQ-IER-05 | Delivery | Parameterized launch of existing exercises |
| REQ-IER-06 | Delivery | Musical content from existing library |
| REQ-IER-07 | Delivery | Mic pipeline unchanged |
| REQ-IER-08 | UI | “For You” / Recommended section |
| REQ-IER-09 | UI | Manual exercise list preserved |
| REQ-IER-10 | UI | Recommendations refresh from progress |

All REQ-IER-01 through REQ-IER-10 are **v1** for this milestone.
