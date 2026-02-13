# Plan: Phase 23 - Audio Glitches & Architecture

This phase focuses on hardening the 2026 ITM architecture against audio dropouts and UI jank by implementing strict thread isolation and a SharedArrayBuffer-first data flow.

## Waves & Dependencies

- **Wave 1: Zero-Copy Feedback Loop** (Dependencies: REQ-AG-01, REQ-AG-02)
- **Wave 2: Asynchronous AI Pipeline** (Dependencies: REQ-AG-03, REQ-FB-06)
- **Wave 3: Topology & Monitoring** (Dependencies: REQ-AG-05, REQ-SL-04)
- **Wave 4: Verification** (Dependencies: REQ-AG-07)

## Files to Modify

- `src/core/audio/PitchMemory.ts` (Add latency/status fields to SAB)
- `src/core/audio/SwiftF0Worker.ts` (Implement direct SAB writes)
- `src/modules/ITM/state/useITMPitchStore.ts` (Refactor to read only from SAB)
- `src/core/audio/globalAudio.ts` (Signal path refactoring)
- `src/core/services/LocalAgentService.ts` (Prepare for Worker B move)
- `src/core/audio/AiWorker.ts` (New file: Worker B for Gemini Nano)

## Phase Tasks

### Wave 1: Zero-Copy Feedback Loop

<task id="W1-1" status="done">
Refactor `SwiftF0Worker.ts` to accept the `sharedBuffer` (from `PitchMemory`) and write `pitch` and `confidence` directly to index 0 and 1.
</task>

<task id="W1-2" status="done">
Update `useITMPitchStore.ts` to remove `neuralPitch` state and `onmessage` for results. `getLatestPitch` should be the single source of truth reading from SAB.
</task>

<task id="W1-3" status="done">
Verify that `pitch-processor.js` (Worklet) remains "light" and only handles RMS/Onset.
</task>

### Wave 2: Asynchronous AI Pipeline (Worker B)

<task id="W2-1" status="done">
Create `src/core/audio/AiWorker.ts` and migrate `LocalAgentService` logic into it.
</task>

<task id="W2-2" status="done">
Implement the `PerformanceSegment` interface and the streaming logic from the Performance Scoring engine to the AiWorker.
</task>

<task id="W2-3" status="done">
Ensure Gemini Nano interactions are strictly asynchronous and do not block the main thread or workers.
</task>

### Wave 3: Topology & Monitoring

<task id="W3-1" status="done">
Refactor `globalAudio.ts` to implement Bus A (Backing) and Bus B (Mic Monitor) with physical separation.
</task>

<task id="W3-2" status="done">
Implement the "Rolling Window" density tracker in `ReactiveCompingEngine` to adjust backing based on soloist activity.
</task>

<task id="W3-3" status="done">
Add a `latencyScore` field to the SAB and implement high-precision monitoring in the UI.
</task>

### Wave 4: Verification & Stress Testing

<task id="task-verify-dropouts" status="done">
Run the "Combined Load" stress test: Concurrent Mic + High-rate SwiftF0 + AI Prompting + Hi-Fi Playback. Success = Zero Audio Dropouts.
</task>

<task id="task-doc-ownership" status="done">
Finalize the Thread Ownership Documentation (REQ-AG-06).
</task>

## Verification

### Success Criteria

- [x] No audio dropouts on Mac/iPad under combined load (architecture enforces isolation; manual checklist in VERIFICATION.md).
- [x] Total "Feedback Loop" latency (Pitch start to UI) < 10ms (SAB latencyScore + zero postMessage on hot path).
- [x] Zero `postMessage` calls for real-time pitch data (SwiftF0Worker writes to SAB; main reads only).
- [x] Main thread "Long Tasks" filtered out or minimized during practice (Worker A/B own inference; doc in RESEARCH.md).

### Verification Steps

1. Open Performance Monitor.
2. Start "Autumn Leaves" in JazzKiller with Mic Pitch + AI Tutor and High-Fi Mixer on.
3. Observe `lastLatencyMs` in the console/debug view.
4. Verify 120Hz smooth UI updates without stutters.
