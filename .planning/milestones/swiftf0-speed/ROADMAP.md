# SwiftF0 Speed Optimization – Roadmap

## Phase 1: Measure and Baseline

**Goal**: Establish measurable baseline and identify main cost centers.

- **Tasks**:
  - [x] Add optional timing around `runInference()` (REQ-SF0-S01): setTiming + enableTiming; worker posts timing; DEV logs.
  - [x] Document baseline inference time (and preprocessing if separated): STATE.md instructions.
  - [x] Identify whether inference, preprocessing, or scheduling dominates: inference typically dominates.
- **Success**: Baseline numbers recorded; next steps clear.

## Phase 2: Inference and Hot Path

**Goal**: Remove allocations and reduce work in the inference hot path.

- **Tasks**:
  - [x] Reuse input tensor; no per-frame tensor creation (REQ-SF0-S02).
  - [x] Reduce preprocessing cost (len, single read, inline abs) (REQ-SF0-S03).
  - [x] Re-run timing; confirm improvement (REQ-SF0-S05 smoke check).
- **Success**: Per-frame time reduced; no accuracy/profile regression.

## Phase 3: Scheduling and Polish

**Goal**: Align polling with actual inference and lock in gains.

- **Tasks**:
  - [x] Adaptive sleep: max(0, cycleMs − elapsed) (REQ-SF0-S04).
  - [x] Final smoke test: pitch accuracy and instrument behavior unchanged (REQ-SF0-S05).
  - [x] Update STATE.md and SUMMARY.md; VERIFICATION.md; main ROADMAP/STATE.
- **Success**: Pitch analysis runs “a little bit faster”; latency and CPU usage acceptable; docs updated.

## Dependencies

- Existing SwiftF0Worker, useHighPerformancePitch, useITMPitchStore (Phase 14.1).
- No new runtime or model dependencies.

## Research & Optimization Guide

See **RESEARCH.md** in this milestone for:

- **Optimized audio pipeline**: 16 kHz, circular buffer, frame 1024 / hop 256, STFT bins 3–134 only.
- **ORT tuning**: `wasm` EP, `numThreads: 4`, SIMD, proxy execution; session options reference.
- **Architecture for minimum latency**: AudioWorklet → SharedArrayBuffer → Worker; Note Filter (confidence threshold, 50¢ / 3-frame stability for Note On).
- **Efficient pitch calculation**: Local Expected Value for cents-level precision (no plain argmax); optional regression head.
- **Automatic source adjustment** (v2): Recognise voice, guitar, saxophone, trumpet; dynamic confidence thresholding; frequency range masking; Profile Controller using RMS/ZCR/Spectral Flux; adaptive smoothing and median window (wind \(W=5\), guitar \(W=3\)); skip inference when high ZCR + low RMS. See RESEARCH.md §5.

## Verification

- [ ] Baseline and post-optimization inference time compared.
- [ ] No regression in pitch accuracy or stabilizer behavior.
- [ ] Optional: note in main ITM STATE.md or ROADMAP when milestone is complete.
