---
phase: 14.2
name: SwiftF0 Pitch Analysis Speed Optimization
waves: 3
dependencies: ["Phase 14.1: SwiftF0 SOTA 2026 Integration (SwiftF0Worker, useHighPerformancePitch, useITMPitchStore)"]
milestone: .planning/milestones/swiftf0-speed/
files_modified: [
  "src/core/audio/SwiftF0Worker.ts"
]
files_created: []
---

# Phase 14.2: SwiftF0 Pitch Analysis Speed Optimization

**Focus**: Inference and pipeline optimizations so real-time pitch feels snappier; target &lt;5 ms per frame where possible. Same accuracy and instrument profiles; no breaking changes to pitch API.

**Milestone**: `.planning/milestones/swiftf0-speed/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).

**Success Criteria**:
- Per-frame inference time reduced (baseline vs post-optimization).
- Zero allocations in inference hot path (REQ-SF0-S02).
- Preprocessing cost reduced or unchanged (REQ-SF0-S03).
- Poll interval aligned with inference duration (REQ-SF0-S04).
- No regression in pitch accuracy or instrument hysteresis (REQ-SF0-S05).

---

## Wave 1: Measure and Baseline

**Goal**: Establish measurable baseline and identify main cost centers.

| Task ID | Requirement | Description |
|--------|-------------|-------------|
| SF0-S01 | REQ-SF0-S01 | Add optional, dev-only timing around `runInference()` (e.g. before/after `session.run()`). |
| SF0-S02 | — | Document baseline inference time (and preprocessing if separated) on 1–2 representative devices/browsers. |
| SF0-S03 | — | Identify whether inference, preprocessing, or scheduling dominates. |

**Deliverables**: Baseline numbers in `STATE.md`; next steps clear.

---

## Wave 2: Inference and Hot Path

**Goal**: Remove allocations and reduce work in the inference hot path.

| Task ID | Requirement | Description |
|--------|-------------|-------------|
| SF0-S04 | REQ-SF0-S02 | Reuse output tensors; avoid per-frame tensor creation where API allows. |
| SF0-S05 | REQ-SF0-S03 | Reduce preprocessing cost (log compression loop or equivalent) without changing semantics. |
| SF0-S06 | REQ-SF0-S05 | Re-run timing; smoke check: pitch output and accuracy unchanged. |

**Deliverables**: Per-frame time reduced; no accuracy/profile regression.

---

## Wave 3: Scheduling and Polish

**Goal**: Align polling with actual inference and lock in gains.

| Task ID | Requirement | Description |
|--------|-------------|-------------|
| SF0-S07 | REQ-SF0-S04 | Tune poll/sleep interval (or adaptive strategy) to match inference duration. |
| SF0-S08 | REQ-SF0-S05 | Final smoke test: pitch accuracy and instrument behavior unchanged. |
| SF0-S09 | — | Update `STATE.md` and optional `SUMMARY.md` with results; note in main ITM STATE/ROADMAP when complete. |

**Deliverables**: Pitch analysis runs “a little bit faster”; latency and CPU usage acceptable; docs updated.

---

## Context (Existing Assets)

- **SwiftF0Worker.ts**: Inference loop, PCM RingBuffer consumption, ONNX session, regression head, atonal gating.
- **useHighPerformancePitch** / **useITMPitchStore**: Consume SwiftF0 output; no API change expected.
- **Phase 14.1**: Web Worker offload, instrument hysteresis, MPM fallback.

## Verification

- [ ] Baseline and post-optimization inference time compared.
- [ ] No regression in pitch accuracy or stabilizer behavior.
- [ ] Optional: note in main ITM STATE.md or ROADMAP when milestone is complete.
