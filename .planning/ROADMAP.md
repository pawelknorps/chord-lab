# Roadmap: Codebase Health & Scalability

## Phase 1: Shared UI & Foundational Cleanup

- **Step 1**: Identify all duplicate UI primitives in modules and consolidate them into `src/components/ui`.
- **Step 2**: Create the `SharedInstrumentService` to deduplicate audio samples.
- **Step 3**: Implement a "Performance Monitor" widget for dev mode to track re-renders and audio jank.

## Phase 2: State Standardisation & Engine Refactor

- **Step 4**: Audit `useFunctionalEarTrainingStore` and `JazzKiller` state. Move high-freq trackers (playback time, active notes) to Signals.
- **Step 5**: Standardize the "Audio Lifecycle" across all modules (Start/Stop/Suspend).
- **Step 6**: Refactor `midiToNoteName` to be globally context-aware based on the active key signal.

## Phase 3: Chord Lab UX & Visuals (Current)

- **Step 7**: Implement Piano/Fretboard toggles and persistence in `useSettingsStore`.
- **Step 8**: Refactor `globalAudio.ts` to support "Legato Visuals" (holding visualization until next event).
- **Step 9**: UI layout audit for Chord Lab to accommodate toggles gracefully.

## Phase 4: Responsiveness & UX Polish

- **Step 10**: Layout audit for all 12 modules. Fix horizontal scrolling on mobile (especially for Piano/Fretboard).
- **Step 11**: Smooth out lazy-loading transitions with module-specific skeleton loaders.
- **Step 12**: Resolve high-priority bugs identified in `CONCERNS.md`.

## Phase 5: Final Validation & Testing

- **Step 13**: Add Vitest unit tests for the centralized `SharedInstrumentService`.

- **Step 14**: Perform a full "Module Transition" stress test (switching labs rapidly).

## Phase 6: The "Incredible Teaching Machine" (AI Agent)

- **Step 15**: **AOT Script**: Create `scripts/generate-lessons.js` to process standards and generate specific lesson JSONs.
- **Step 16**: **Lesson Player**: Implement `SmartLessonPane` to visualize the generated harmonic roadmap.
- **Step 17**: **Interactive Drills**: Build "Spotlight Drill" and "Blindfold Challenge".
- **Step 18**: **Local Agent**: Implement `window.ai` integration for real-time advice.

