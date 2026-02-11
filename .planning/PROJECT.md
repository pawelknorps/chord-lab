# Project: Resonance AI (The 2026 Methodology)

## Current Focus
**Experimental Phase: The Radial Tonal Grid**: Develop a new experimental module that visualizes the "gravity" of the tonal center. This is the first pillar of the Resonance AI phase, moving away from static piano/fretboard layouts towards a functional, feel-based interface.

## Vision Statement
To build the world's most effective music learning system by merging the **tonal center methodology** (FET) with **generative AI intelligence** and **vocal production**. Resonance AI treats music like language acquisition—focusing on internalization, recall, and context rather than abstract calculations.

## Resonance Pillars (2026)

### 1. Radial Tonal Grid (Current Pillar)
- **Concept**: A non-linear visualizer where the Tonic is the center of gravity. Intervals radiate outwards based on their stability vs. tension.
- **Goal**: Internalize the "feel" of a note's function within a key without relying on physical keyboard layouts.
- **Tech**: Framer Motion for gravity animations, Tone.js for state-aware playback.

### 2. Generative Contextual Learning (Next)
- **Concept**: AI generates 4-bar mini-songs in various genres (Jazz, Pop, Techno) to establish a tonal center.
- **Methodology**: Instead of a dry cadence, the user hears "real music," and identify the function of highlighted melody/bass notes.
- **Tech**: Gemini Nano generates the structural MIDI seed; the app's sampler renders it.

### 3. Harmonic Production (Vocal/Aural Mirror)
- **Concept**: Proving internalization through production. The student sings the target function.
- **Methodology**: App provides a functional prompt (e.g., "Sing the Major 7th"); the Universal Mic Handler verifies the pitch.
- **Tech**: Universal Microphone Handler (Pitch-to-Theory Pipe).

## Core Value Proposition
- **High Semantic Density**: Using Gemini Nano to turn raw theory data into pedagogical stories.
- **Zero Friction**: AI-driven "Daily Tune-Up" that launches immediately upon opening.
- **Aural Internalization**: Building "Muscles of the Ear" through active production (singing/playing) rather than just tapping buttons.

## Key Decisions

| Decision                 | Rationale                                                                                            | Status    |
| :----------------------- | :--------------------------------------------------------------------------------------------------- | :-------- |
| **Local AI Only**        | Use the established Gemini Nano architecture for zero latency and privacy.                           | [Decided] |
| **New Resonance Module** | The Radial Tonal Grid will live in its own experimental module to avoid breaking existing workflows. | [Decided] |
| **Data over Audio**      | AI generates MIDI/Structure; existing samplers render audio for high quality.                        | [Decided] |
| **No Wearables**         | Focus on mobile/web experience first.                                                                | [Decided] |

## High-Level Requirements

### Resonance Grid (v1)
- **REQ-RES-01**: Implement the Radial Tonal Grid UI.
- **REQ-RES-02**: Tonic as center, with distance representing dissonance/tension.
- **REQ-RES-03**: Interactive play/feedback loop within the grid.

### Generative Context (v2)
- **REQ-RES-04**: Prompt Gemini Nano for "short musical seeds" (chord progressions + melody).
- **REQ-RES-05**: Render AI seeds using the Chord Lab sampler engines.

### Vocal Mirror (v3)
- **REQ-RES-06**: Integrate Universal Mic Handler into the Resonance workflow.
- **REQ-RES-07**: Real-time feedback on sung pitch accuracy vs functional target.
