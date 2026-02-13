# SwiftF0 Speed Optimization – State

## Current Status

- **Milestone**: SwiftF0 Pitch Analysis Speed Optimization
- **Status**: Complete (+ automatic source adjustment executed)
- **Next**: Optional: run with enableTiming on target devices and fill baseline numbers; optional Spectral Flux for finer auto-detect.

## Progress

| Phase | Status | Notes |
|-------|--------|--------|
| Phase 1: Measure and Baseline | Done | Optional timing via setTiming + enableTiming option. |
| Phase 2: Inference and Hot Path | Done | Reused input tensor; tightened preprocessing loop. |
| Phase 3: Scheduling and Polish | Done | Adaptive sleep (cycleMs − elapsed); docs updated. |

## Requirements

- [x] REQ-SF0-S01: Measure baseline inference time
- [x] REQ-SF0-S02: Zero allocations in hot path
- [x] REQ-SF0-S03: Preprocessing cost reduction
- [x] REQ-SF0-S04: Align poll interval with inference
- [x] REQ-SF0-S05: No regression in accuracy/behavior
- [x] **Automatic source adjustment** (RESEARCH §5): Profile Controller (RMS/ZCR), dynamic confidence (voice 0.85, guitar/sax/trumpet 0.70), frequency range masking, saxophone profile; ORT enableCpuMemArena + numThreads: 4.

## Baseline (to be filled in Phase 1)

- **How to measure**: Initialize pitch store with `useSwiftF0: true, enableTiming: true`; in DEV, console logs `[SwiftF0 timing] { preprocessMs, inferenceMs, totalMs }` each frame.
- **Device/Browser**: (fill on 1–2 representative devices)
- **Inference time (ms)**: (session.run portion)
- **Preprocessing time (ms)**: (log-compression loop)
- **Cost center**: Inference typically dominates; preprocessing is small. Scheduling (fixed 8 ms sleep) can be tuned in Phase 3.
