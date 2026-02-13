# SwiftF0 SOTA Precision – State

## Current Status

- **Milestone**: SwiftF0 SOTA Precision (Local Expected Value + Temporal Smoothing + Cents Display)
- **Status**: Completed (2026-02-13)
- **Next**: Final verification and archive.

## Progress

| Phase | Status | Notes |
| :--- | :--- | :--- |
| Phase 1: Verify LEV and Temporal Stack | Completed | Done in swiftF0Inference/CrepeStabilizer/Worker. |
| Phase 2: Chromatic Mapping and Cents API | Completed | frequencyToNote verified; consumers audit done. |
| Phase 3: Tuner Bar (Cents) UI | Completed | TunerBar.tsx created and wired to pitch monitors. |

## Requirements

- [x] REQ-SF0-P01: Local Expected Value (no argmax-only)
- [x] REQ-SF0-P02: Median filter 5–7 frames
- [x] REQ-SF0-P03: Hysteresis 60¢, 3-frame stability
- [x] REQ-SF0-P04: Chromatic note + cents
- [x] REQ-SF0-P05: Tuner bar (cents display)
- [x] REQ-SF0-P06: Post-inference in Worker

## Notes

- **LEV**: swiftF0Inference already implements 9-bin weighted average in log space; verify formula matches \(f = 2^{\sum p'_i \log_2(f_i)}\).
- **Median**: CrepeStabilizer has running median (window 7 default); instrumentProfiles use windowSize 5 or 7.
- **Hysteresis**: CrepeStabilizer uses profile.hysteresisCents and profile.stabilityThreshold; voice has 60¢ and 5 frames—consider 3-frame option for snappier note change.
- **Cents**: frequencyToNote returns centsDeviation; ensure UI can show it (tuner bar).
