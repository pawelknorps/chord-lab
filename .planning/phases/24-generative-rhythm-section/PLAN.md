# Phase 24 Plan: Generative Rhythm Section (Wave II)

## Overview
This phase upgrades the "Virtual Room" to a state-of-the-art generative system. We will offload note calculation to a background worker, implement high-fidelity articulations (Ride Bell, Rimshots), and integrate Barry Harris bebop logic for the bass engine.

## Wave 1: Background Offloading & BandWorker
**Goal**: Move heavy bar calculation out of the main thread.

- **Task 1: Implement BandWorker.ts**
  - Create a new worker that hosts `DrumEngine` and `WalkingBassEngine`.
  - Implement a request/response protocol for generating 1-measure or 4-measure "chunks."
- **Task 2: Refactor useJazzBand to use BandWorker**
  - Update the hook to poll the worker for future bars instead of synchronous local calls.
  - Implement a "Queue" system to handle worker latency.

## Wave 2: High-Fidelity Articulations (Multi-Sampling)
**Goal**: Enrich the sonic texture of the generative engines.

- **Task 3: Expand Drum Drum Samples & Logic**
  - Add Ride Bell and Rimshot sample support in `globalAudio.ts`.
  - Update `DrumEngine` to use these samples for accents and high-intensity peaks.
- **Task 4: Bass Fret Noise & Snap**
  - Implement a "Ghost/Noise" channel in the bass sampler logic.
  - Add procedural fret noise between large leaps in the `WalkingBassEngine`.

## Wave 3: Barry Harris & Advanced Bebop Harmony
**Goal**: Implement "Elite" note choice logic.

- **Task 5: Barry Harris 6th-Diminished Engine**
  - Add a new strategy to `WalkingBassEngine` based on the 6th-diminished scale.
  - Use it specifically for static or "tonic" regions to provide authentic bebop movement.
- **Task 6: Interactive "Energy Budget"**
  - Synchronize Drum/Bass intensity peaks via a shared "Tension" variable in the worker.

## Verification
- **Criteria**: No main-thread jank during bar generation (profiler check).
- **Criteria**: Audible Ride Bell on accents and Rimshots on intensity peaks.
- **Criteria**: Bass lines exhibit Barry Harris-style chromatic substitutions.
- **Criteria**: Total latency from worker request to Tone.js schedule < 50ms (non-critical path).
