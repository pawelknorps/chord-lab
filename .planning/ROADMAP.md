# Resonance AI Roadmap

## Phase 1: The Radial Tonal Grid (Current)
*Focus: The "Visualizing Sound" pillar.*

- **Success Criteria**: A working experimental module where a user can identify scale degrees on a radial grid after a cadence.
- **Tasks**:
  - [ ] Initialize `ResonanceModule` folder structure.
  - [ ] Implement `RadialGrid` UI component using SVG/Framer Motion.
  - [ ] Integrate with `Tonal.js` for functional interval logic.
  - [ ] Add basic "Tonal Center" setup (cadence player).
  - [ ] First "Search & Find" drill implemented.

## Phase 2: AI Generative Seeds
*Focus: Crossing the bridge from exercises to "Real Music."*

- **Success Criteria**: Ear training questions are based on AI-generated "songs" rather than static MIDI.
- **Tasks**:
  - [ ] Create `GeminiMusicService` to wrap Nano calls for musical data.
  - [ ] Build "Song-to-Sampler" pipeline (rendering AI JSON to Tone.js).
  - [ ] Implement "Contextual Identification" levels.

## Phase 3: Vocal Internalization
*Focus: The "Harmonic Mirror."*

- **Success Criteria**: User can sing the answer to an ear training question.
- **Tasks**:
  - [ ] Enable Universal Microphone Handler within the Resonance module.
  - [ ] Build `VocalDetectionOverlay` for real-time pitch feedback.
  - [ ] Implement "Sight-Singing" and "Call & Response" modes.

## Phase 4: Integration & Polish
*Focus: Unifying the experience.*

- **Tasks**:
  - [ ] Integrate Resonance Grid into the main Workbench.
  - [ ] Add "Daily Tune-Up" adaptive logic.
  - [ ] Performance and UI polish (2026 aesthetics).
