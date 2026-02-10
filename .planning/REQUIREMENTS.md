# Requirements: Codebase Health & Scalability

## v1 Milestone: The Resilient Foundation

### UI & UX (UI)
- **REQ-UI-01**: Consolidate `src/modules/*/components/ui` into `src/components/ui`. Eliminate duplicates (e.g., Select, Slider, Button).
- **REQ-UI-02**: All 12+ modules must pass a "Responsive Stress Test" (Mobile, Tablet, Desktop).
- **REQ-UI-03**: Implement a global `AudioInitOverlay` to ensure Tone.js context is resumed gracefully across all modules.

### Performance (PERF)
- **REQ-PERF-01**: Refactor instrument loading (`soundfont-player`, `tonejs-instrument-*`) into a centralized `SharedInstrumentService`.
- **REQ-PERF-02**: Ensure heavy modules (Tonnetz, ChordBuildr) release WebGL/Audio resources on unmount to prevent leaks.
- **REQ-PERF-03**: Optimize the index.css and Tailwind 4 bundles for smaller initial LCP.

### State & Logic (STATE)
- **REQ-STATE-01**: Migrate module-level theory analysis (e.g., `chordManager.ts`) to use Preact Signals for real-time UI updates without re-renders.
- **REQ-STATE-02**: Restrict Zustand to "Serialized State" (Settings, Mastery, User Progress).

### Bug Elimination (BUG)
- **REQ-BUG-01**: Fix "Ghost Playback" bug where audio continues or fails to start during module transitions.
- **REQ-BUG-02**: Audit all `midiToNoteName` calls for context-aware enharmonic spelling (Major/Minor key awareness).

## v2 / Deferred
- **REQ-EXT-01**: Full E2E regression suite using Vitest + Playwright.
- **REQ-EXT-02**: Dynamic Plugin Routing (loading modules from dedicated JSON manifests).

## Out of Scope
- Redesigning the core navigation dashboard.
- Modifying the iReal Pro parsing logic.
