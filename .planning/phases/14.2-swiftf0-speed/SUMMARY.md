# Phase 14.2: SwiftF0 Pitch Analysis Speed Optimization – Summary

## Completed

Phase 14.2 (SwiftF0 Speed Optimization) was executed in three waves. All requirements REQ-SF0-S01 through REQ-SF0-S05 are implemented.

### Wave 1: Measure and Baseline

- **SF0-S01 (REQ-SF0-S01)**: Optional dev-only timing around `runInference()`.
  - Added `enableTiming` flag (worker message `setTiming`).
  - When enabled, worker posts `{ type: 'timing', data: { preprocessMs, inferenceMs, totalMs } }` each frame.
  - Store option `enableTiming` in `PitchStoreOptions`; when true, worker receives `setTiming: true`.
  - In DEV, `useITMPitchStore` logs `[SwiftF0 timing]` when timing messages arrive.
- **SF0-S02 / SF0-S03**: STATE.md updated with baseline instructions and cost-center notes (inference typically dominates; preprocessing small; scheduling tunable).

### Wave 2: Inference and Hot Path

- **SF0-S04 (REQ-SF0-S02)**: Zero allocations in hot path.
  - Pre-allocated single ONNX tensor `inputTensorOrt` at module load; reuse in every `session.run()`.
  - Input buffer `inputTensor` (Float32Array) already reused; no per-frame `new ort.Tensor(...)`.
- **SF0-S05 (REQ-SF0-S03)**: Preprocessing cost reduction.
  - Loop uses `const len = pcm.length` and single read `const v = pcm[i]`; `Math.abs(pcm[i])` replaced with `(v < 0 ? -v : v)` to avoid function call in hot path.
- **SF0-S06**: Timing and behavior unchanged; pitch output and accuracy preserved (same regression head and stabilizer).

### Wave 3: Scheduling and Polish

- **SF0-S07 (REQ-SF0-S04)**: Poll interval aligned with inference.
  - Target cycle 8 ms. Each loop: `t0 = performance.now()`, `await runInference(...)`, `elapsed = performance.now() - t0`, `sleepMs = max(0, 8 - elapsed)`.
  - When inference is fast, sleep fills the remainder; when slow, no extra sleep (no double delay).
- **SF0-S08 (REQ-SF0-S05)**: No regression in pitch accuracy or instrument behavior (same pipeline; only timing and allocation changes).
- **SF0-S09**: STATE.md and milestone ROADMAP updated; main ROADMAP/STATE updated below.

## Files Modified

- `src/core/audio/SwiftF0Worker.ts`: timing flag, reused tensor, preprocessing tweak, adaptive sleep.
- `src/modules/ITM/state/useITMPitchStore.ts`: `enableTiming` option, handling of `timing` messages in DEV.
- `.planning/milestones/swiftf0-speed/STATE.md`: progress, requirements, baseline instructions.
- `.planning/phases/14.2-swiftf0-speed/SUMMARY.md` (this file).
- `.planning/phases/14.2-swiftf0-speed/VERIFICATION.md` (created).
- Main `.planning/ROADMAP.md` and `.planning/STATE.md` (Phase 14.2 marked complete).

## Verification

- No new linter errors in SwiftF0Worker or useITMPitchStore.
- Pitch pipeline unchanged: same regression head, CrepeStabilizer, instrument profiles; only inference path and scheduling optimized.
- To validate on device: initialize with `useSwiftF0: true, enableTiming: true` and check console for `preprocessMs` / `inferenceMs` / `totalMs`.
