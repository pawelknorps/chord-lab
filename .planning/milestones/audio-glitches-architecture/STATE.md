# Audio Glitches & Architecture – State

## Current Status

- **Milestone**: audio-glitches-architecture
- **Phase**: Not started
- **Next**: Phase 1 – Document & verify current isolation (REQ-AG-01, REQ-AG-02, REQ-AG-06)

## Progress

| Phase | Status | Notes |
|-------|--------|--------|
| 1 – Document & verify isolation | Pending | Worklet and workers to be audited; RESEARCH.md to be written |
| 2 – Async AI and main-thread guarantees | Pending | AI entry points to be audited |
| 3 – Latency budget and verification | Pending | Glitch test under combined load |
| 4 – Guards (optional) | Pending | Checklist or string-check test |

## Verification (REQ-AG-07)

- [ ] Mic on + playback on (JazzKiller full band): no dropouts
- [ ] Mic + playback + SwiftF0 on: no dropouts
- [ ] Mic + playback + “Analyze performance” (Gemini): no dropouts; AI result appears asynchronously
- [ ] Document result and date in this file or VERIFICATION.md

## References

- Root cause: `../audio-glitch-diagnosis/ROOT_CAUSE.md`
- Worklet: `public/worklets/pitch-processor.js`
- Workers: `src/core/audio/MpmWorker.ts`, `src/core/audio/SwiftF0Worker.ts`
- Pitch store: `src/modules/ITM/state/useITMPitchStore.ts`
- AI: `jazzTeacherLogic`, `generateStandardsExerciseAnalysis`, LocalAgentService
