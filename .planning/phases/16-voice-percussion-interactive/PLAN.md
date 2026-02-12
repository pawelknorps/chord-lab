# Phase 16: Voice & Percussion Interactive Training (SwiftF0)

*Focus: Moving Ear Training and Rhythm modules from "passive clickers" to "active performers" using the SwiftF0-powered mic detection pipe.*

## 1. Research & Analysis
- [x] Identify "Melody Steps" and "Intervals" as primary singing targets.
- [x] Identify "Rhythm Arena" and "Subdivision Pyramid" as primary clapping targets.
- [x] Verify `useITMPitchStore` availability in existing modules.

## 2. Infrastructure Updates
- **Task 1: Mic Sensitivity Calibration**: Add an auto-gain / threshold detector to `pitch-processor.js` (or a helper) to distinguish between "chiff" (breath) and "attack" for clapping.
- **Task 2: Global Mic Toggle**: Update `useSettingsStore` or create a `useMicInputStore` to manage "Interaction Mode" (Mouse vs Mic).

## 3. Module Integration (Functional Ear Training)
- **Task 3: Sing-to-Answer HUD**: Create a `MicInteractionOverlay` that shows "Listening for scale degree..." or "Listening for interval..."
- **Task 4: Validation Logic**: Hook `SwiftF0` data into `MelodySteps` game loop. When a pitch is detected, convert to scale degree and check against target. Auto-trigger "Next" on success.

## 4. Module Integration (Rhythm Architect)
- **Task 5: Rhythmic Onset Detection**: Implement a lightweight onset detector using `SharedArrayBuffer` data (likely spectral flux or amplitude change) to handle clapping.
- **Task 6: Clap Validation**: In `RhythmExercises`, compare detected onset timestamps against internal `Tone.Transport` beats. Return "Late/Early/Perfect" feedback.

## 5. UI/UX Refinement
- **Task 7: Hands-Free Mode**: Ensure the student can complete an entire session without touching their device (singing/clapping answers + silence/voice commands for next).

## 6. Verification
- **Verification 1**: Can I pass a "Melody Steps" level by singing?
- **Verification 2**: Can I complete a "Subdivision Pyramid" run by clapping?
- **Verification 3**: Does the logic correctly handle octave differences (e.g. singing a scale degree an octave lower than the guide tone)?
