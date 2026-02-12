# SwiftF0 Speed Optimization – Roadmap

## Phase 1: Measure and Baseline

**Goal**: Establish measurable baseline and identify main cost centers.

- **Tasks**:
  - [ ] Add optional timing around `runInference()` (REQ-SF0-S01).
  - [ ] Document baseline inference time (and preprocessing if separated) on 1–2 representative devices/browsers.
  - [ ] Identify whether inference, preprocessing, or scheduling dominates.
- **Success**: Baseline numbers recorded; next steps clear.

## Phase 2: Inference and Hot Path

**Goal**: Remove allocations and reduce work in the inference hot path.

- **Tasks**:
  - [ ] Reuse output tensors / avoid per-frame tensor creation where possible (REQ-SF0-S02).
  - [ ] Reduce preprocessing cost (log compression loop or equivalent) without changing semantics (REQ-SF0-S03).
  - [ ] Re-run timing; confirm improvement (REQ-SF0-S05 smoke check).
- **Success**: Per-frame time reduced; no accuracy/profile regression.

## Phase 3: Scheduling and Polish

**Goal**: Align polling with actual inference and lock in gains.

- **Tasks**:
  - [ ] Tune poll/sleep interval (or adaptive strategy) to match inference duration (REQ-SF0-S04).
  - [ ] Final smoke test: pitch accuracy and instrument behavior unchanged (REQ-SF0-S05).
  - [ ] Update STATE.md and optional SUMMARY.md with results.
- **Success**: Pitch analysis runs “a little bit faster”; latency and CPU usage acceptable; docs updated.

## Dependencies

- Existing SwiftF0Worker, useHighPerformancePitch, useITMPitchStore (Phase 14.1).
- No new runtime or model dependencies.

## Verification

- [ ] Baseline and post-optimization inference time compared.
- [ ] No regression in pitch accuracy or stabilizer behavior.
- [ ] Optional: note in main ITM STATE.md or ROADMAP when milestone is complete.
