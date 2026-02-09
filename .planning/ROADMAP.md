# Roadmap

## Phase 1: Foundation & Critical Fixes
**Goal**: Stabilize the application and fix immediate bugs.
*   [ ] **CORE-01**: Implement `cleanupAudio` hook or context to stop engines on unmount.
*   [ ] **SYNC-01**: Fix ghost note audio in `rhythmEngine.ts`.
*   [ ] **POLY-01**: Fix visualizer state staleness in `PolyrhythmGenerator.tsx`.

### Phase 1: Design System & App Shell [✓ Complete]

- Goal: Establish the new visual language and layout structure.
- Requirements: UI-NEW-01, UI-NEW-02
- Success Criteria:
  - New global CSS variables (Themes).
  - Collapsible Sidebar implemented.
  - Clean, minimalist typography active globally.

### Phase 2: Module Internal Refactors [✓ Complete]

- Goal: Update individual modules to use the new system and improve "screen density".
- Completed: 2026-02-09
- Requirements: UI-NEW-03
- Success Criteria:
  - `ChordLab` updated.
  - `EarTraining` updated.
  - `Dashboard` fully consolidated.

## Phase 2: Syncopation Overhaul
**Goal**: Transform Syncopation from a toy into a training tool.
*   [ ] **CORE-02**: Apply new design to Syncopation builder.
*   [ ] **SYNC-02**: Build "Groove Dictation" game logic.
*   [ ] **SYNC-03**: Implement difficulty tiers for Syncopation.

## Phase 3: Polyrhythm & Subdivision
**Goal**: Make abstract concepts interactive and testable.
*   [ ] **CORE-02**: Apply new design to Polyrhythm & Subdivision.
*   [ ] **POLY-02**: Build "Tap the Polyrhythm" game.
*   [ ] **SUB-01**: Make Subdivision Pyramid interactive.
*   [ ] **SUB-02**: Build "Subdivision Switch" game.

## Phase 4: Polish & Integration
**Goal**: Ensure a cohesive "Pro" experience.
*   [ ] **GAME-01**: Verify XP systems across all new modules.
*   [ ] **SYNC-04**: Implement MIDI export for Syncopation.
*   [ ] **CORE-02**: Final design polish (animations, transitions).
