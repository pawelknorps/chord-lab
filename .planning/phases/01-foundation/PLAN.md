# Phase 1: Shared UI & Foundational Cleanup

## Overview
This phase focused on establishing a robust "UI Core" and deduplicating foundational audio services. By centralizing UI primitives and instrument management, we reduce bundle size, eliminate duplication-related bugs, and improve overall maintainability.

## Waves & Dependencies

- **Wave 1**: UI Core Consolidation (No dependencies)
- **Wave 2**: Shared Instrument Service (Depends on Wave 1 for UI integration)
- **Wave 3**: Performance Baseline (Depends on Wave 2 to monitor audio health)

## Files Modified

- `src/components/ui/*` (New)
- `src/modules/ChordBuildr/components/ui/*` (Moved)
- `src/core/services/InstrumentService.ts` (New)
- `src/core/services/AudioManager.ts` (Refactor)
- `src/components/shared/PerformanceMonitor.tsx` (New)

## Tasks

### Wave 1: UI Core Consolidation

- [ ] **Task 1: Establish src/components/ui**
    1. Create `src/components/ui` directory.
    2. Move all files from `src/modules/ChordBuildr/components/ui/` to `src/components/ui/`.
    3. Update imports in `src/modules/ChordBuildr` to point to the new location.
    4. Verify `ChordBuildr` still functions correctly.

- [ ] **Task 2: Global UI Theming Audit**
    1. Verify that `index.css` (Tailwind 4) contains the necessary design tokens for the unified UI.
    2. Add any missing tokens (muted colors, glow effects, premium gradients) to the global CSS.

### Wave 2: Shared Instrument Service

- [ ] **Task 3: Implement InstrumentService**
    1. Create `src/core/services/InstrumentService.ts`.
    2. Implement a singleton that manages Tone.js Samplers and Synths.
    3. Add support for lazy-loading high-quality samples (Piano, Rhodes, Guitar).
    4. Ensure samples are re-used across all modules.

- [ ] **Task 4: Refactor AudioManager**
    1. Update `AudioManager.ts` to delegate instrument creation to `InstrumentService`.
    2. Simplify `AudioManager` to focus only on global playback control and visualization orchestration.

### Wave 3: Performance & Health

- [ ] **Task 5: Create PerformanceMonitor Component**
    1. Implement `src/components/shared/PerformanceMonitor.tsx` using Preact Signals to monitor:
        - React re-render counts (via a custom hook).
        - Tone.js cpuUsage and state.
        - Memory usage (if available in browser).
    2. Add the monitor to `App.tsx` (dev-only visibility).

## Verification

- **Success Criteria**:
- `src/components/ui` exists and contains 8+ primitives (Button, Select, etc.).
- `InstrumentService` is the sole source of Tone.js instruments.
- `PerformanceMonitor` displays real-time metrics in the dev environment.
- **Silent Sentry**: Audio context state changes from `suspended` to `running` on first click/keypress without an overlay.
- No "Ghost Playback" or duplicate sample loading logs in console.
