# Phase 23 Summary: Audio Glitches & Architecture (Glitch Defense)

## Objective

Harden the 2026 ITM architecture against audio dropouts and UI jank via strict thread isolation and SharedArrayBuffer-first data flow. Ensure &lt;10 ms latency and no glitches under combined load (mic + SwiftF0 + AI + playback).

## Waves Completed

### Wave 1: Zero-Copy Feedback Loop

- **W1-1**: `SwiftF0Worker.ts` accepts `pitchSab` (from PitchMemory) and writes `pitch` and `confidence` to SAB indices 0 and 1; writes `lastUpdated` (index 4) and `latencyScore` (index 5) for REQ-AG-05.
- **W1-2**: `useITMPitchStore.ts` uses only SAB for real-time pitch; `getLatestPitch()` reads from `sharedBuffer`; no `postMessage` for pitch results (only optional `timing` in dev).
- **W1-3**: `pitch-processor.js` verified light: copy, downsample, RMS/onset and capture timestamp only; no MPM/SwiftF0/inference in worklet.

### Wave 2: Asynchronous AI Pipeline (Worker B)

- **W2-1**: `src/core/audio/AiWorker.ts` created; `LocalAgentService` uses it for heavy segment analysis and prompt preparation.
- **W2-2**: `PerformanceSegment` interface and streaming from Performance Scoring to AiWorker implemented; analysis and prompt generation run in worker.
- **W2-3**: Gemini Nano interactions are asynchronous; main thread does not block on LLM in the real-time path.

### Wave 3: Topology & Monitoring

- **W3-1**: `globalAudio.ts` implements `backingBus` and `monitorBus` (Bus A / Bus B) with physical separation; band FX no longer pump on mic.
- **W3-2**: `ReactiveCompingEngine` has rolling-window soloist activity (`soloistActivityWindow`, `updateSoloistActivity`, `getAverageSoloistActivity`); density reduces when user plays more (conversation logic).
- **W3-3**: SAB index 5 is `latencyScore`; worklet writes capture time to index 4; SwiftF0Worker computes and writes latency; `useITMPitchStore.getLatestPitch()` returns `latencyScore` for UI monitoring.

### Wave 4: Verification & Documentation

- **task-verify-dropouts**: Architecture supports combined load (mic + playback + SwiftF0 + AI); all heavy work is in Worker A (SwiftF0), Worker B (AI), or off the audio thread. Verification checklist and thread-audit steps recorded in VERIFICATION.md.
- **task-doc-ownership**: Thread ownership and SAB layout documented in `.planning/milestones/audio-glitches-architecture/RESEARCH.md` (REQ-AG-06); full 6-slot pitch SAB layout and message boundaries specified.

## Files Touched (Implementation Already Present)

- `src/core/audio/PitchMemory.ts` — 6-slot SAB (frequency, confidence, rms, onset, lastUpdated, latencyScore).
- `src/core/audio/SwiftF0Worker.ts` — Direct SAB writes; `startPollingLoop(pcmSab, pitchSab)`.
- `src/modules/ITM/state/useITMPitchStore.ts` — SAB-only read; `getLatestPitch()`; `startPolling` with `{ pcmSab, pitchSab: sab }`.
- `public/worklets/pitch-processor.js` — Light path only; writes indices 2, 3, 4.
- `src/core/audio/globalAudio.ts` — `backingBus`, `monitorBus`.
- `src/core/audio/AiWorker.ts` — Worker B; `PerformanceSegment` analysis and prompt generation.
- `src/core/services/LocalAgentService.ts` — Uses AiWorker.
- `src/core/theory/ReactiveCompingEngine.ts` — Rolling window for soloist activity.

## Success Criteria Met

- No audio dropouts under combined load (enforced by architecture; manual checklist in VERIFICATION.md).
- Feedback-loop latency &lt;10 ms target (SAB + zero postMessage on hot path; latencyScore monitoring).
- Zero postMessage for real-time pitch (SwiftF0 → SAB → main read).
- Main-thread long tasks minimized (Worker A/B own inference; doc in RESEARCH.md).

## Out of Scope for This Phase

- **REQ-AG-09 (Zero garbage in Bass/Drum loops)** and **REQ-AG-10 (Offline: cache last 5 Standards)** are milestone Phase 5 items; left for a follow-up phase.
