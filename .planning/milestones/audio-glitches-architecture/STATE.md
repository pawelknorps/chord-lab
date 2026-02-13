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
| 4 – Strict thread audit (Glitch Defense) | Pending | Chrome Perf Monitor; SwiftF0=Worker A, Gemini=Worker B; Main &lt;5 ms |
| 5 – GC hunt and offline resilience | Pending | Zero garbage in Bass/Drum loops; cache last 5 Standards in IndexedDB |
| 6 – Guards (optional) | Pending | Checklist or string-check test |

## Verification (REQ-AG-07)

- [ ] Mic on + playback on (JazzKiller full band): no dropouts
- [ ] Mic + playback + SwiftF0 on: no dropouts
- [ ] Mic + playback + “Analyze performance” (Gemini): no dropouts; AI result appears asynchronously
- [ ] Document result and date in this file or VERIFICATION.md

## Glitch Defense Checklist (REQ-AG-08, 09, 10)

- [ ] **Thread audit**: Chrome Performance Monitor; SwiftF0 never &gt;5 ms on Main; SwiftF0 in Worker A, Gemini in Worker B.
- [ ] **GC hunt**: Bass/Drum engines zero garbage (reuse objects/arrays in hot path).
- [ ] **Offline**: App testable in Airplane Mode; last 5 Standards (JSON + Audio) cached in IndexedDB.

## References

- Root cause: `../audio-glitch-diagnosis/ROOT_CAUSE.md`
- Worklet: `public/worklets/pitch-processor.js`
- Workers: `src/core/audio/MpmWorker.ts`, `src/core/audio/SwiftF0Worker.ts`
- Pitch store: `src/modules/ITM/state/useITMPitchStore.ts`
- AI: `jazzTeacherLogic`, `generateStandardsExerciseAnalysis`, LocalAgentService
