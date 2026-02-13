# Phase 24 Research: Generative Rhythm Section (Wave II)

## Current State Analysis

### 1. DrumEngine (`src/core/theory/DrumEngine.ts`)
- **Strengths**: Linear Phrasing (DeJohnette style), Conversational Snare/Kick, Micro-timing (Ride Push/Snare Drag).
- **Weaknesses**: Main-thread logic; limited articulation (only standard Ride/Snare/Kick/Hat); no "Ride Bell" or "Rimshot" support; no persistent "Listening" state between bars beyond simple history.
- **Audio Routing**: Combined into `trioSum` in `globalAudio.ts`.

### 2. WalkingBassEngine (`src/core/theory/WalkingBassEngine.ts`)
- **Strengths**: Rule-based strategies (Circle, Stepwise, Static); Friedland approach; rhythmic variations (Skip, Rake).
- **Weaknesses**: Main-thread logic; limited "Bebop-Native" scales (e.g. no Barry Harris 6th-diminished scale logic); simple sample switching for ghost notes.

## Technical Goals for Wave II

### 1. Zero-Latency Background Offloading
- **Plan**: Move `DrumEngine` and `WalkingBassEngine` bar calculation into a dedicated `BandWorker`.
- **Reasoning**: Even if bar calculation is fast, doing it on the main thread every 4–8 bars (especially for multiple instruments) adds to UI jank. Moving it to a worker ensures the 120Hz React bridge stays smooth.

### 2. High-Fidelity Articulations (Multi-Sampling+)
- **Drums**:
  - **Ride Bell**: Trigger on high `intensity` or syncopated accents.
  - **Rimshot**: Accented snare hits at `intensity > 0.8`.
  - **Ghost Ride**: Subtle "ping" reflections.
- **Bass**:
  - **Fret Noise**: Add occasional sub-10ms "thumps" or slides between non-adjacent notes.
  - **Pizzicato Snap**: High-velocity articulation for accented roots.

### 3. Barry Harris "Bebop-Native" Logic
- **Theory**: Implement the `Barry Harris 6th Diminished Scale` for chord connections.
- **Integration**: When walking between tonic chords, use the diminished substitutions to create "chromatic but functional" movement.

### 4. Interactive "Listening" (Virtual Room V2)
- **Concept**: The Drummer shouldn't just listen to the Piano; the Drummer and Bassist should have a shared "Energy Budget".
- **Implementation**: A shared state in the `BandWorker` that tracks "Tension" levels, allowing for synchronized build-ups (crescendos/intensity peaks).

## Open Questions
- **Worklet vs Worker**: Should the scheduling happen in a Worker or the Worklet? 
- **Answer**: Scheduling should stay in Tone.js (Main Thread) for now to leverage its mature Transport, but the *bar generation* (note selection) should be async in a Worker.
