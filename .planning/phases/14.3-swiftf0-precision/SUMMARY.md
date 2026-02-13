# Phase 14.3 Summary: SwiftF0 SOTA Precision

Achieved SOTA precision for SwiftF0 by implementing Local Expected Value (LEV), temporal smoothing (median + hysteresis), and a premium Tuner Bar UI for cents-level accuracy.

## Key Accomplishments

- **Verified LEV**: Confirmed `swiftF0Inference.classificationToPitch` uses 9-bin weighted average in log-space for sub-bin frequency accuracy.
- **Improved Stabilization**: CrepeStabilizer now dynamically honors profile `windowSize` and reset buffers on profile change.
- **Snappier Note Changes**: Reduced `voice` profile `stabilityThreshold` to 3 frames (from 5) for faster response while maintaining 60¢ hysteresis.
- **Consistent Pipeline in Worker**: Fixed `SwiftF0Worker.ts` to call the stabilizer and update the SharedArrayBuffer every cycle, ensuring silent frames correctly transition the UI and allow for "hold" logic.
- **Tuner Bar component**: Created `TunerBar.tsx` using Framer Motion for premium "liquid" animation of cents deviation.
- **Widespread Integration**: Integrated the new `TunerBar` into `MicPianoVisualizer` and `JazzPitchMonitor`, satisfying REQ-SF0-P05.

## Technical Details

- **LEV Formula**: $f = 2^{\sum p_i \log_2(f_i) / \sum p_i}$ ensures we aren't limited by classifier bin centers.
- **Hysteresis**: Prevents flickering between adjacent chromatic notes unless the pitch moves significantly (>60¢ for voice).
- **Stabilizer Reset**: Switching from Guitar (window 5) to Voice (window 7) now correctly re-allocates the circular buffer in the worker thread.

## Verification

- Verified chromatic note mapping in `frequencyToNote`.
- Tuner bar visualizes vibrato and intonation accurately.
- No flickering observed during held notes.
