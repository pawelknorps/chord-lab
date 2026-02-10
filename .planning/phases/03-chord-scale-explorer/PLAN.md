# Phase 3: Chord-Scale Explorer Plan

## Objective
Implement a "Chord-Scale Explorer" that provides detailed scale options for each chord in a standard. This feature will allow users to:
1.  See the primary scale choice for a given chord function.
2.  Explore alternative scales (e.g., Lydian Dominant vs. Mixolydian).
3.  Audition these scales in real-time.
4.  Understand *why* a scale fits (theory context).

## Core Components to Build

### 1. Theory Engine Enhancements (`ChordScaleEngine.ts`)
- **Scale Mapping Logic**: Create a robust mapping system that assigns scales based on:
    - Chord Type (Major, Minor, Dominant, etc.)
    - Function (e.g., V7 alt vs V7 natural available tension)
    - Key Context (e.g., avoiding avoid notes)
- **Scale Data Structure**: Define `ScaleOption` type with:
    - Name (e.g., "Mixolydian b9 b13")
    - Notes (e.g., ["G", "Ab", "B", "C", "D", "Eb", "F"])
    - Description (e.g., "Use over dominant chords resolving to minor")
    - Color/Mood (e.g., "Dark", "Tension", "Bright")

### 2. UI Components
- **`ChordScalePanel` component**:
    - A specific panel or modal that opens when a user clicks a chord in the Lead Sheet or Walkthrough.
    - Displays the current chord and a list of compatible scales.
- **`ScaleVisualizer`**:
    - A visual representation (keyboard or fretboard view) of the selected scale.
- **Audition Controls**:
    - Play button to hear the scale over the chord voicing.

### 3. Integration
- **LeadSheet Interaction**: Make chords clickable to trigger the Explorer.
- **Walkthrough Integration**: Add a "Deep Dive" button on relevant Walkthrough steps to open the Scale Explorer.

## Step-by-Step Implementation Plan

1.  **Define Types & Data**: 
    - Create `src/core/theory/ChordScaleTypes.ts`.
    - Create `src/core/theory/ChordScaleEngine.ts`.
2.  **Visual Component**:
    - Build `ChordScalePanel.tsx` with a clean, "premium" UI.
3.  **Interaction Layer**:
    - Update `LeadSheet.tsx` to handle chord clicks.
    - Connect `JazzKillerModule` state to show/hide the panel.
4.  **Audio Audition**:
    - Implement a simple playback function to run up/down the selected scale.

## Verification
- Load a standard.
- Click a specific chord (e.g., G7alt).
- Confirm "Altered Scale" is suggested.
- Click "Play" and verify audio output.
