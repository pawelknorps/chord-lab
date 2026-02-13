# Innovative Exercises Revamp – Roadmap

## Phase 1: Progress Summary & Data Layer

**Focus**: Aggregate student progress from all app sources into a single summary for AI consumption.

- **Success Criteria**: A function or service produces a structured progress summary (session history, mastery, song progress, standards heatmap when available); summary is read-only from existing stores.
- **Tasks**:
  - [ ] **REQ-IER-01**: Implement progress summary builder (e.g. `buildInnovativeExerciseProgressSummary()` or `InnovativeExerciseProgressService.getSummary()`). Consume useSessionHistoryStore, useScoringStore, useMasteryStore/useMasteryTreeStore, useProfileStore; optionally standards heatmap store. Output JSON-serializable structure.
  - [ ] **REQ-IER-02**: Ensure no writes to those stores from this path; document read-only usage.
- **Deliverables**: Progress summary API; integration with session history, profile, mastery, and (if available) standards heatmap. No new persistence.

## Phase 2: AI Recommendation Engine

**Focus**: AI consumes progress summary and returns structured exercise recommendations.

- **Success Criteria**: Given a progress summary, AI returns one or more recommendations with exerciseId, params (key, chords, lickId, tempo, etc.), and reason; when summary is empty, fallback recommendations or full list available.
- **Tasks**:
  - [ ] **REQ-IER-03**: Implement `generateInnovativeExerciseRecommendations(progressSummary)` using Gemini Nano (jazzTeacherLogic pattern). Prompt must enforce structured output (e.g. JSON) with exerciseId, params, reason. Parse and validate before returning to UI.
  - [ ] **REQ-IER-04**: When progress summary is empty or sparse, return sensible defaults (e.g. one generic recommendation per category or “Try all six”) so new users can use the module.
- **Deliverables**: AI recommendation function; fallback logic; unit or integration test with mock summary.

## Phase 3: Parameterized Exercises & Library Audio

**Focus**: Existing exercises accept launch parameters; recommended content uses library.

- **Success Criteria**: Voice-Leading Maze, Ghost Note, Intonation Heatmap (and optionally Swing Pocket, Call and Response, Ghost Rhythm) accept key, chord(s), lickId, tempo; exercises run with mic and use library content (licks, ChordScaleEngine, GuideToneCalculator, backing).
- **Tasks**:
  - [ ] **REQ-IER-05**: Extend existing panels/hooks to accept initial params (key, progression, lickId, tempo). Wire from recommendation payload to panel state so “Start” uses those params.
  - [ ] **REQ-IER-06**: Ensure recommended runs use library: e.g. Ghost Note with a lick from ghost-note lick library; Voice-Leading Maze with ChordScaleEngine/GuideToneCalculator for chosen key/chords; no placeholder-only content.
  - [ ] **REQ-IER-07**: Confirm mic pipeline (SwiftF0, useITMPitchStore, useHighPerformancePitch) is unchanged; no new input stack.
- **Deliverables**: Parameterized launch for at least Voice-Leading Maze, Ghost Note, Intonation Heatmap; library-backed content in recommendations; mic behavior unchanged.

## Phase 4: “For You” UI & Refresh

**Focus**: Show recommendations in the module and allow refresh from latest progress.

- **Success Criteria**: User sees “For You” / “Recommended” section with AI recommendations (reason + exercise); clicking launches exercise with recommended params; manual list of six exercises preserved; recommendations can refresh after new progress.
- **Tasks**:
  - [ ] **REQ-IER-08**: Add “For You” / “Recommended” section to InnovativeExercisesModule; call recommendation function on mount (and on refresh); render recommendation cards with reason and exercise name; on click set selected exercise + params and show corresponding panel.
  - [ ] **REQ-IER-09**: Keep existing sidebar list of all six exercises; selection still allows manual pick without recommendation.
  - [ ] **REQ-IER-10**: Add refresh trigger (e.g. “Refresh recommendations” button or refresh when route is re-entered after a session); progress summary is re-fetched so new session/heatmap data influences next recommendations.
- **Deliverables**: “For You” section in Innovative Exercises; parameterized launch from recommendation; manual list intact; refresh behavior.

## Dependencies

- Phase 2 depends on Phase 1 (progress summary must exist for AI input).
- Phase 3 can start in parallel with Phase 2 (parameterization and library usage are independent of AI); Phase 4 depends on Phase 2 and Phase 3 (UI needs both recommendations and parameterized launch).

## Success Metrics (Overall)

- Student with existing progress sees personalized “For You” recommendations.
- Recommended exercise launches with AI-chosen params and is mic-ready with library audio.
- New user sees defaults or full list; no errors.
- New practice (ITM, Standards) influences next recommendations after refresh.
- Manual exercise list and current mic behavior preserved.
