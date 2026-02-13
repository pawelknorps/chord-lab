# Audio Glitches & Architecture – Requirements

## v1 Requirements (Must-Have)

### Isolation

#### REQ-AG-01: Audio Worklet Stays Light

- **Requirement**: The pitch Audio Worklet (`pitch-processor.js`) must only copy input into a circular buffer, downsample to 16 kHz, write PCM to `pcmSab`, and write RMS/onset to the main SAB. It must **not** run MPM, SwiftF0, CREPE, or any autocorrelation/FFT/inference in `process()`.
- **Acceptance**: No `detectPitch()`, NSDF, or neural inference in the worklet; code review and/or test assert worklet does not import or call heavy pitch logic.

#### REQ-AG-02: Pitch Inference in Workers Only

- **Requirement**: All pitch inference (MPM in MpmWorker, SwiftF0 in SwiftF0Worker) must run in Web Workers. No pitch inference on the main thread or in the Audio Worklet.
- **Acceptance**: MpmWorker and SwiftF0Worker own inference; main thread and worklet only read/write SAB or postMessage; documented in architecture spec.

#### REQ-AG-03: Gemini Nano Never Blocks Real-Time Path

- **Requirement**: Gemini Nano (or any LLM) must be invoked asynchronously (e.g. post-phrase or post-segment). It must never block the main thread for more than a short, bounded time (e.g. queue submission only). Real-time scoring and pitch updates must not wait on LLM completion.
- **Acceptance**: AI critique (e.g. `generateStandardsExerciseAnalysis`, `generateJazzLesson`) is triggered after a phrase/segment; UI shows “Analyzing…” and updates when result arrives; no `await` of LLM on the same path as Transport or pitch polling.

#### REQ-AG-04: Main Thread Does Not Block Playback Scheduling

- **Requirement**: The main thread must not perform long-running synchronous work (inference, heavy computation) that would delay Tone.Transport scheduling or buffer submission. Heavy work belongs in Workers.
- **Acceptance**: Document which operations run on main vs workers; no inference or multi-second work on main in the critical path of playback or pitch.

### Latency & Data Flow

#### REQ-AG-05: Real-Time Feedback Latency Budget

- **Requirement**: The path from mic input to pitch/score update (for real-time feedback) must target **&lt;10 ms** end-to-end. This path includes worklet copy, worker inference (SwiftF0/MPM), and SAB read by main/React.
- **Acceptance**: Documented latency budget; optional timing (e.g. REQ-SF0-S01) used to validate; no design that allows LLM or multi-second work in this path.

#### REQ-AG-06: Data Flow and SAB Ownership Documented

- **Requirement**: Document which thread/worker writes and reads each SharedArrayBuffer (pitch result SAB, PCM SAB). Document message boundaries (postMessage) between Main ↔ Worker A ↔ Worker B so new features can be checked against isolation.
- **Acceptance**: Architecture doc (RESEARCH.md or SPECS.md in this milestone) describes SAB layout, writers/readers, and async AI flow.

### Verification

#### REQ-AG-07: No Glitches Under Combined Load

- **Requirement**: With mic on, playback on (JazzKiller trio), and (when enabled) SwiftF0 and optional AI critique, the app must not exhibit audible dropouts or clicks attributable to thread contention.
- **Acceptance**: Manual test (or automated if feasible): play along with mic + full band + “Analyze performance”; no sustained glitches; regression test or checklist in STATE.md/VERIFICATION.md.

## v2 / Deferred

- **Worker B dedicated thread**: Formalize a single “AI Worker” that owns all Gemini Nano calls and queues prompts/results.
- **Memory budget doc**: Document approximate memory for stems, SwiftF0 WASM, Nano, and suggest lazy-load or “lite” mode for low-memory devices.
- **Automated glitch detection**: Script or test that records output and detects dropouts (e.g. silence or level drop).

## Out of Scope

- Moving Tone.Transport into a Worker.
- Changing SwiftF0 or Gemini model design.
- Native app or non-PWA architecture.

## Summary

| ID | Requirement | Category |
|----|-------------|----------|
| REQ-AG-01 | Audio Worklet stays light (no inference) | Isolation |
| REQ-AG-02 | Pitch inference in workers only | Isolation |
| REQ-AG-03 | Gemini Nano never blocks real-time path | Isolation |
| REQ-AG-04 | Main thread does not block playback scheduling | Isolation |
| REQ-AG-05 | Real-time feedback latency &lt;10 ms | Latency |
| REQ-AG-06 | Data flow and SAB ownership documented | Data flow |
| REQ-AG-07 | No glitches under combined load | Verification |
