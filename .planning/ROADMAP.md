# Roadmap: Codebase Health & Scalability

## Phase 1: Shared UI & Foundational Cleanup
- **Step 1**: Identify all duplicate UI primitives in modules and consolidate them into `src/components/ui`.
- **Step 2**: Create the `SharedInstrumentService` to deduplicate audio samples.
- **Step 3**: Implement a "Performance Monitor" widget for dev mode to track re-renders and audio jank.

## Phase 2: State Standardisation & Engine Refactor
- **Step 4**: Audit `useFunctionalEarTrainingStore` and `JazzKiller` state. Move high-freq trackers (playback time, active notes) to Signals.
- **Step 5**: Standardize the "Audio Lifecycle" across all modules (Start/Stop/Suspend).
- **Step 6**: Refactor `midiToNoteName` to be globally context-aware based on the active key signal.

## Phase 3: Responsiveness & UX Polish
- **Step 7**: Layout audit for all 12 modules. Fix horizontal scrolling on mobile (especially for Piano/Fretboard).
- **Step 8**: Smooth out lazy-loading transitions with module-specific skeleton loaders.
- **Step 9**: Resolve high-priority bugs identified in `CONCERNS.md`.

## Phase 4: Final Validation & Testing
- **Step 10**: Add Vitest unit tests for the centralized `SharedInstrumentService`.
- **Step 11**: Perform a full "Module Transition" stress test (switching labs rapidly).
