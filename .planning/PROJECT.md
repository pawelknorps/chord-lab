# Project Milestone: Codebase Health & Scalability (The Resilient Lab)

## Vision Statement
To mature the Chord-Lab architecture into a truly resilient, performance-oriented modular monolith. We will eliminate technical debt, unify the UI core, and ensure the application remains "fast and fluid" even as we add more complex music-theory modules. Scalability and premium user experience are our North Stars.

## Core Value Proposition
- **Shared Foundation**: Eliminate UI duplication between modules by establishing a robust `src/components/ui` layer.
- **Optimized Performance**: Implement intelligent asset management (especially for audio samples) and refined lazy-loading patterns.
- **State Clarity**: Standardize the usage of Zustand (Global App State) vs. Signals (High-Frequency Engine State) to reduce complexity-induced bugs.
- **Resilient UX**: Ensure 100% responsiveness and "zero-jank" transitions between the 12+ experimental labs.

## Key Targets
1. **The UI Core**: Refactor `src/components/ui` to be the single source of truth for all modules.
2. **Audio Asset Pipeline**: Centralize sample loading and instrument management to prevent duplicate memory usage.
3. **State Best Practices**: Documentation and refactoring of one core module (likely `ChordLab` or `JazzKiller`) to serve as an architectural blueprint.
4. **Resiliency Audit**: Fix known bugs in module transitions and playback head timing.

## Architectural Decisions
- **Signals vs Zustand**:
    - **Zustand**: User profiles, global settings, "coarsely" defined session state.
    - **Signals**: Playback heads, visualizer data, high-frequency theory analysis updates.
- **Component Pattern**: Modules should import primitives from `src/components/ui` and provide only *arrangement* and *domain-specific* logic.

## Out of Scope
- Rewriting the entire routing system (we can live with `App.tsx` for now).
- Adding new music theory logic (unless required to fix existing bugs).
- Implementing a server-side backend (staying local-first).
