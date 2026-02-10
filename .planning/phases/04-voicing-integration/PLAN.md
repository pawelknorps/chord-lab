# Phase 4: Voicing & Piano Integration Plan

## Objective
Connect the theoretical "Scale Explorer" with practical "Voicings" (piano/guitar). This phase focuses on visualizing how to *play* the chords and scales discussed in previous phases.

## Core Features
1.  **Voicing Engine (`VoicingEngine.ts`)**:
    - Algorithm to generate classic jazz voicings:
        - **Shell Voicings**: 1-3-7 or 1-7-3.
        - **Rootless A/B Voicings**: 3-5-7-9 or 7-9-3-5.
        - **Upper Structures**: Triads over basic chords (e.g., D major over C7 for C13#11).
2.  **Piano Visualization**:
    - Integrate `UnifiedPiano` into the `ChordScalePanel`.
    - Highlight voicing notes in different colors (e.g., Root in Blue, Third/Seventh in Emerald).
3.  **Keyboard Interactivity**:
    - Users can play the voicing directly from the panel.
4.  **Integration with JazzKiller**:
    - As the song plays, the piano updates with "Current Step" voicings if in walkthrough mode.

## Implementation Steps
1.  **Create `src/core/theory/VoicingEngine.ts`**:
    - Port or implement jazz voicing algorithms.
2.  **Update `ChordScalePanel`**:
    - Add a "Voicings" section.
    - Embed `UnifiedPiano`.
3.  **Sync State**:
    - Ensure selected voicing notes are passed to the piano component.
4.  **Verification**:
    - Click "Dm7".
    - See "Rootless A" voicing (F-A-C-E).
    - Verify visualization on the keyboard.

## Success Criteria
- [ ] Dm7 shows F-A-C-E as a rootless option.
- [ ] Voicing notes are playable on the UI keyboard.
- [ ] Integration between JazzKiller and the new voicing display.
