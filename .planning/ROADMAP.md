# Jazz Evolution Roadmap

## Phase 1: Foundation & High-Quality Audio
**Success Criteria**: New samples loaded, legacy engine preserved, audio mix improved.
- [ ] Task 1: Create `useJazzSamples.ts` hook for robust multi-sample loading.
- [ ] Task 2: Refactor `useJazzPlayback.ts` to separate the "Engine" from the "Playback Loop".
- [ ] Task 3: Implement the "Legacy Toggle" state.

## Phase 2: The Walking Bass (Ron Carter Style)
**Success Criteria**: Bass lines feel melodic and connected, moving beyond simple chord tones.
- [ ] Task 1: Develop `WalkingBassLogic.ts` with chromatic/scale approach strategies.
- [ ] Task 2: Implement "Ghost Note" and "Triplet Skip" humanization for bass.

## Phase 3: The Comping Engine (Garland & Hancock)
**Success Criteria**: Piano plays pro-level voicings with rhythmic awareness.
- [ ] Task 1: Create `JazzVoicingGenerator.ts` (Rootless, Quartal, Block).
- [ ] Task 2: Implement rhythmic pattern library (Charleston, Red Garland syncopation).

## Phase 4: Interactivity & Humanization
**Success Criteria**: Band feels cohesive (Drums catch Piano hits), micro-timing variations applied.
- [ ] Task 1: Implement "Event Bus" for instruments to listen to each other.
- [ ] Task 2: Dynamic Velocity scaling based on tempo and "energy" level.

## Phase 5: UI & Polish
- [ ] Task 1: Add "Style/Energy" controls to the JazzKiller UI.
- [ ] Task 2: Final mix balance and performance optimization.

---
## Project State Tracking
- **Current Phase**: Phase 1
- **Status**: Initializing
- **Next Milestone**: Multi-sampled audio engine implementation.
