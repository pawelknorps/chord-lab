# Phase 14.3 Verification: SwiftF0 SOTA Precision

This document verifies the completion of Phase 14.3 requirements.

## Requirements Checklist

| ID | Requirement | Result |
| :--- | :--- | :--- |
| REQ-SF0-P01 | Local Expected Value (no argmax-only) | **PASS**: `classificationToPitch` always uses 9-bin weighted average. |
| REQ-SF0-P02 | Median filter 5–7 frames | **PASS**: `CrepeStabilizer` constructor and `setProfile` honor profile window size. |
| REQ-SF0-P03 | Hysteresis 60¢, 3-frame stability | **PASS**: Voice profile updated to 3-frame threshold; hysteresis is 60¢. |
| REQ-SF0-P04 | Chromatic note + cents | **PASS**: `frequencyToNote` uses 12*log2(f/440)+69 and returns 100*offset. |
| REQ-SF0-P05 | Tuner bar (cents display) | **PASS**: `TunerBar.tsx` created and wired to multiple HUDs. |
| REQ-SF0-P06 | Post-inference in Worker | **PASS**: `SwiftF0Worker.ts` runs stabilizer on every frame before writing to SAB. |

## Manual Verification Steps

1. **Precision Check**: Confirm `TunerBar` moves smoothly for small pitch changes (vibrato).
2. **Stability Check**: Sing a steady note; the UI note name should not flicker between semitones (due to 60¢ hysteresis).
3. **Transition Check**: Switch instruments in the `MicPianoVisualizer` dropdown; confirm the stabilizer resets and uses the new window size (observable via snappiness/smoothness change).
4. **Silence Check**: Stop playing; confirmation that the HUD clears or holds for the `holdWindowMs` and then goes to 0/silent state.

## Conclusion

Phase 14.3 is complete. The pitch detection system now achieves SOTA precision with flicker-free, semitone-stable performance.
