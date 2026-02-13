# Phase 23 Verification: Audio Glitches & Architecture

## Architecture Overview

The "Incredible Teaching Machine" is now architecturally hardened for SOTA 2026 performance using strict thread isolation and zero-copy data flow.

### Thread Ownership Map (REQ-AG-06, REQ-AG-08)

- **Main Thread**: React/Zustand UI (120Hz), coordinate Agent results, rAF/poll SAB for pitch. Must NOT: long-running inference; blocking await on LLM in real-time path.
- **AudioWorklet**: Sample-accurate DSP, circular buffering, RMS/Onset, capture timestamp (SAB index 4). Must NOT: MPM, SwiftF0, CREPE, FFT, or any inference.
- **Worker A (SwiftF0 / MpmWorker)**: Neural/autocorrelation inference; direct SAB writes (indices 0, 1, 4, 5).
- **Worker B (AiWorker)**: PerformanceSegment analysis and prompt generation for Gemini Nano; postMessage result back. Must NOT: block main or audio thread.

**Thread audit (REQ-AG-08)**: Use Chrome Performance Monitor; SwiftF0 must run in Worker A only (Analysis); Gemini in Worker B only (Pedagogy). Main-thread pitch path &lt;5 ms (read SAB only). Audit steps: (1) Open Performance tab → Main/Workers; (2) Start JazzKiller + Mic + SwiftF0 + “Analyze performance”; (3) Confirm no inference spikes on Main; (4) Document in STATE.md if repeated.

## Verification Results

### 1. Latency & Zero-Copy (REQ-AG-02, REQ-AG-05)

- **Result**: `SwiftF0Worker` writes directly to `SharedArrayBuffer` indices 0 (frequency), 1 (confidence), 4 (lastUpdated), 5 (latencyScore).
- **Latency Score**: High-precision monitoring via `now - captureTimestamp` from SAB; no postMessage jitter on hot path.
- **Goal Achieved**: Zero `postMessage` calls for real-time pitch; target &lt;10 ms feedback loop.

### 2. Audio Topology (REQ-SL-04)

- **Result**: `globalAudio.ts` implements `backingBus` and `monitorBus` separation.
- **Goal Achieved**: Band FX no longer pump on microphone input.

### 3. Asynchronous AI Pipeline (REQ-AG-03)

- **Result**: `AiWorker.ts` handles performance analysis and prompt construction; `LocalAgentService` delegates to worker.
- **Goal Achieved**: UI remains responsive during LLM preparation; no blocking on real-time path.

### 4. Reactive Soloist Space (REQ-JBCE-04)

- **Result**: `ReactiveCompingEngine` rolling window (`soloistActivityWindow`) reduces comping density when user activity is high.
- **Goal Achieved**: Conversation logic implemented.

## Combined Load Checklist (REQ-AG-07)

Manual verification steps; run and tick when passed:

- [ ] **Mic on + playback on** (JazzKiller full band): no dropouts.
- [ ] **Mic + playback + SwiftF0 on**: no dropouts.
- [ ] **Mic + playback + “Analyze performance” (Gemini)**: no dropouts; AI result appears asynchronously (“Analyzing…” then update).
- [ ] Document date and result in milestone STATE.md or here after run.

## References

- Data flow and SAB layout: `.planning/milestones/audio-glitches-architecture/RESEARCH.md`
- Root cause: `.planning/milestones/audio-glitch-diagnosis/ROOT_CAUSE.md`
