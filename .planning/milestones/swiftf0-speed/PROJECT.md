# SwiftF0 Pitch Analysis Speed Optimization – Project Vision

## Vision Statement

Make SwiftF0 pitch analysis **a little bit faster** so real-time feedback feels snappier and the system stays within a sub-10 ms latency budget end-to-end. This milestone focuses on **inference and pipeline optimizations** without changing model accuracy or instrument-specific behavior.

## Problem Statement

- Phase 14.1 delivered SwiftF0 integration with Web Worker offload, instrument hysteresis, and sub-cent regression; **inference time** and **throughput** were not the primary focus.
- A fixed 8 ms polling interval and per-frame tensor creation add overhead; preprocessing (log compression) runs on the worker main thread every frame.
- Faster analysis improves perceived responsiveness for ITM scoring, Innovative Exercises, and any feature that depends on real-time pitch.

## Core Value Proposition

**“Same accuracy, less time.”**

1. **Lower per-frame inference time**: Reduce milliseconds per SwiftF0 run (target &lt;5 ms where possible) so more headroom remains for UI and other work.
2. **Higher sustainable throughput**: Support 120 Hz update rates when needed without dropping frames or increasing latency.
3. **Predictable latency**: Keep end-to-end mic-to-UI latency within the existing &lt;10 ms design goal.

## Target Audience

- **Developers** optimizing the pitch pipeline.
- **End users** (students, teachers) who benefit from snappier pitch feedback in ITM, JazzKiller exercises, and Innovative Exercises.

## Core Functionality (The ONE Thing)

**Measure and reduce SwiftF0 inference and related pipeline cost (preprocessing, tensor lifecycle, worker scheduling) so pitch analysis runs a little bit faster while preserving accuracy and instrument profiles.**

## High-Level Requirements

| Area | Goal | Out of Scope |
|------|-----|--------------|
| Inference | Reduce per-run time (target &lt;5 ms on typical hardware) | Changing model architecture or swapping to a different model |
| Preprocessing | Minimize work in hot path (log compression, copies) | Changing input format or sample rate |
| Allocations | Zero allocations in inference loop where possible | Rewriting ONNX runtime |
| Scheduling | Align poll interval with actual inference duration | Moving inference into Audio Worklet |
| Observability | Optional timing metrics to validate gains | Full APM integration |

## Technical Constraints

- Reuse existing **SwiftF0Worker**, **useHighPerformancePitch**, **useITMPitchStore**, and **CrepeStabilizer**; no breaking changes to public pitch API.
- Remain compatible with **WebGPU** and **WASM** execution providers.
- Keep **instrument hysteresis** and **regression head** behavior unchanged.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Optimize in place (milestone, not new phase number) | Focused scope; Phase 14.1 already delivered integration. |
| Preserve accuracy and profiles | Speed gains must not regress pitch quality or instrument behavior. |
| Measure first | Add optional timing before/after optimizations to validate. |
| No inference in worklet | Keep worklet lean; continue worker-based inference. |

## Success Metrics

- Per-frame inference time reduced (baseline vs post-optimization on same device).
- No regression in pitch accuracy or stabilizer behavior (smoke tests / manual check).
- Optional dev-only timing log or metric to confirm improvements.

## Integration Points

- **SwiftF0Worker.ts**: Inference loop, tensor reuse, preprocessing.
- **useHighPerformancePitch** / **useITMPitchStore**: No API change; may consume results faster.
- **Phase 14.1** planning and RESEARCH: Reference for existing architecture and goals.

## Next Steps

1. Detail requirements with REQ-IDs (REQUIREMENTS.md).
2. Plan implementation waves (ROADMAP.md).
3. Execute and measure; update STATE.md and main ROADMAP as needed.
