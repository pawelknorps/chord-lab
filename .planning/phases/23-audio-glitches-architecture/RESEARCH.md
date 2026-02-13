# Research: Phase 23 - Audio Glitches & Architecture

## Problem Statement

The 2026 ITM vision requires simultaneous high-performance audio, neural pitch detection (SwiftF0), and AI-driven feedback (Gemini Nano) in a mobile browser. Currently:

- **UI Jank Risk**: Pitch results are passed via `postMessage`, which can be delayed by main thread tasks.
- **Audio Dropout Risk**: Any long task on the main thread or contention between workers can lead to dropped frames in the AudioWorklet if not isolated strictly.
- **AI Latency**: Gemini Nano currently runs in the main thread (managed via `LocalAgentService`), which is technically async but can still cause micro-stutters during heavy prompt processing.

## Current Infrastructure Analysis

### 1. Pitch Detection Path

- **Worklet (`pitch-processor.js`)**:
  - Captures PCM.
  - Writes to `pcmSab`.
  - Computes RMS/Onset and writes to `sharedBuffer` (index 2, 3).
  - **Verdict**: Generally light, but needs to be strictly limited to these tasks.

- **Worker A (`SwiftF0Worker.ts`)**:
  - Reads from `pcmSab`.
  - Runs ONNX inference.
  - Posts results to main thread via `postMessage`.
  - **Verdict**: Needs to write results directly to `sharedBuffer` (index 0, 1) for zero-copy access by both the main thread and potentially the Worklet.

### 2. AI Feedback Path

- **LocalAgentService**:
  - Direct `window.ai` interaction in the main thread.
  - **Verdict**: Needs to move to "Worker B" to ensure main thread remains 100% focused on 120Hz UI rendering and state management.

### 3. Audio Engine Topology

- `globalAudio.ts` uses `Tone.js`.
- Signal path is currently unified.
- **Verdict**: Needs clear "Bus A" (Backing) and "Bus B" (Muted Monitor) separation.

## Technical Goals for Planning

### Latency Monitoring

- Implement a `latencyOffset` in the `SharedArrayBuffer` or use a "Last Updated" timestamp field.
- Target: <10ms from PCM capture to `sharedBuffer` result.

### Strict Isolation Map

1. **Main Thread**: React, Zustand, UI rendering.
2. **AudioWorklet**: DSP, Clock, PCM copy.
3. **Worker A (SwiftF0)**: Neural Inference, Stabilizer, SAB Result Writing.
4. **Worker B (Gemini Nano)**: AI Prompt processing, JSON-to-Critique logic.

### Data Flow Specification

- **PerformanceSegment**: A JSON object containing time-stamped note data.
- **Pipe**: Audio Engine -> Feature Extraction (Main/Worker A) -> Worker B.

## Questions for Implementation

- Does Chrome support `window.ai` in Dedicated Workers? (Research suggests yes, but needs verification).
- Can we use `Atomics.notify/wait` for even lower latency signaling between Worker A and Main thread?
