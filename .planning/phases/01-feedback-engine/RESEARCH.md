# Research: Phase 1 (The Feedback Engine)

## Microphone Stack
- **Source**: `src/hooks/useMicrophone.ts`.
- **Pitch Detection**: `src/core/audio/pitchDetection.ts` (Uses high-clarity threshold > 0.9).
- **Aural Mirror**: `src/hooks/useAuralMirror.ts` provides `liveNote` and `midi`.

## Scoring Logic
- **Store**: `src/core/store/useScoringStore.ts`.
- **Status**: Already exists with `processNote` logic that handles:
    - Root/Quality parsing via `parseChord`.
    - Interval matching.
    - Target note bonuses (3rds/7ths).
    - Measure-based heatmap tracking.

## AI Integration
- **Logic**: `src/modules/JazzKiller/ai/jazzTeacherLogic.ts`.
- **Current**: Handles harmonic analysis and "Smart Lessons."
- **Missing**: Performance-aware critique (needs to consume `useScoringStore` data).

## Missing Components
- **Guided Routine Manager**: Need a timer-based state machine for the 15-minute routine.
- **Heatmap Layer**: `LeadSheet.tsx` needs an overlay to display `heatmap[measureIndex]`.
- **Practice Report**: A new UI to synthesize the session results.

## Key Technical Hazards
1. **Latency**: scoring `processNote` needs to account for audio-to-visual latency (currently tracked in `usePracticeStore.userLatency`).
2. **Nano Context**: Need to keep the heatmap summary small enough for Nano's token window. Use bucketed averages if the song is long.
