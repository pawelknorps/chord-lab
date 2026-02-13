# Audio Glitches & Architecture – State

## Current Status

- **Milestone**: audio-glitches-architecture
- **Phase**: Phase 1–4 complete (Phase 23 execution); Phase 5 pending
- **Next**: Phase 5 – GC hunt and offline resilience (REQ-AG-09, REQ-AG-10) or optional Phase 6 guards

## Progress

| Phase | Status | Notes |
|-------|--------|--------|
| 1 – Document & verify isolation | Done | RESEARCH.md data flow; worklet light (REQ-AG-01); pitch in workers only (REQ-AG-02); SAB ownership (REQ-AG-06) |
| 2 – Async AI and main-thread guarantees | Done | AiWorker (Worker B); no blocking LLM on real-time path (REQ-AG-03, REQ-AG-04) |
| 3 – Latency budget and verification | Done | &lt;10 ms budget documented; SAB latencyScore; combined-load checklist in VERIFICATION.md (REQ-AG-07) |
| 4 – Strict thread audit (Glitch Defense) | Done | Thread ownership doc; SwiftF0=Worker A, Gemini=Worker B; audit steps in VERIFICATION.md (REQ-AG-08) |
| 5 – GC hunt and offline resilience | Pending | Zero garbage in Bass/Drum loops (REQ-AG-09); cache last 5 Standards in IndexedDB (REQ-AG-10) |
| 6 – Guards (optional) | Pending | Checklist or string-check test |

## Verification (REQ-AG-07)

- [ ] Mic on + playback on (JazzKiller full band): no dropouts
- [ ] Mic + playback + SwiftF0 on: no dropouts
- [ ] Mic + playback + “Analyze performance” (Gemini): no dropouts; AI result appears asynchronously
- [ ] Document result and date in this file or VERIFICATION.md

## Glitch Defense Checklist (REQ-AG-08, 09, 10)

- [x] **Thread audit**: Chrome Performance Monitor; SwiftF0 in Worker A, Gemini in Worker B; Main &lt;5 ms for pitch path (doc in RESEARCH.md + VERIFICATION.md).
- [ ] **GC hunt**: Bass/Drum engines zero garbage (reuse objects/arrays in hot path) — Phase 5.
- [ ] **Offline**: App testable in Airplane Mode; last 5 Standards (JSON + Audio) cached in IndexedDB — Phase 5.

## References

- Root cause: `../audio-glitch-diagnosis/ROOT_CAUSE.md`
- Worklet: `public/worklets/pitch-processor.js`
- Workers: `src/core/audio/MpmWorker.ts`, `src/core/audio/SwiftF0Worker.ts`
- Pitch store: `src/modules/ITM/state/useITMPitchStore.ts`
- AI: `jazzTeacherLogic`, `generateStandardsExerciseAnalysis`, LocalAgentService
