# ITM Roadmap 2026

## Phase 1: The "Feedback" Engine

*Focus: Turning the app into an active listener and teacher.*

- **Success Criteria**: Student can play along to a song and receive a numerical accuracy score based on microphone input with <10ms latency.
- **Tasks**:
  - [ ] Implement **High-Performance Pitch Detection**: Use Pitchy v3 (McLeod) or CREPE-WASM for jazz-proof accuracy.
  - [ ] Implement **Audio Worklet + SharedArrayBuffer Pattern**: Move pitch math to a separate thread to ensure 120Hz UI smoothness.
  - [ ] Enable **MediaTrackConstraints.voiceIsolation**: Built-in browser AI for cleaning instrument input in noisy environments.
  - [ ] Implement **Zustand Scoring Logic**: Real-time comparison of Mic Pitch to Tonal.js Chord Tones.
  - [ ] Build **Guided Practice UI**: Component to manage the 15-minute routine timer and narrations.
  - [ ] Integrate **Gemini Nano Analysis**: Hook that summarizes session performance into a pedagogical critique.
  - [ ] Create **Performance Heatmap**: Visualization of where in the song the student succeeded/failed.

## Phase 2: The "Mastery Tree" ✅

*Focus: Standardizing the 1,300 standards into a learning path.*

- **Success Criteria**: A user can navigate a visual tree and unlock songs based on their performance data.
- **Tasks**:
  - [x] Implement **Song Tagging System**: Metadata for harmonic complexity.
  - [x] Build **Visual Progress Tree**: UI component (SVG/Canvas) for song progression.
  - [x] Implement **Key Cycle Routine**: Logic for tracking mastery across keys (Sonny Rollins approach).

## Phase 3: The "Sonic" Layer ✅

*Focus: Moving from prototype audio to high-fidelity practice.*

- **Success Criteria**: High-quality samples with a 3-track mixer for user control and studio-grade effects.
- **Tasks**:
  - [x] Build **Dynamic Mixer Component**: Separate volume controls for Bass, Drums, and Piano (PremiumMixer + Mute/Solo + Master Limiter/EQ).
  - [x] Implement **Note Waterfall**: Real-time MIDI-to-Visual transcription layer (band engine, Transport sync, harmonic coloring).
  - [x] Add **Tone Selection Spectrum**: Basic mic analysis feedback for instrument quality (ToneSpectrumAnalyzer + Acoustic Feedback warmth/brightness).

## Phase 4: Cloud & Community ✅

*Focus: Scaling from local-first to a connected ecosystem.*

- **Success Criteria**: Students can share licks and teachers can see their dashboards remotely.
- **Tasks**:
  - [x] Integrate **Supabase** for user profiles and progress synchronization.
  - [x] Build **Teacher Dashboard UI**: Classroom management and student analytics.
  - [x] Implement **Lick Social Feed**: Publishing system for converted licks.
  - [x] Final **PWA Optimization**: Service workers and offline manifest.

## Phase 5: The "Director" Engine ✅

*Focus: Adaptive curriculum driven by spaced repetition and context variation.*

- **Success Criteria**: The AI "Director" schedules what to practice using FSRS (R, S, D) and varies timbre/instrument (e.g. Piano → Cello → Synth) to reduce context-dependency; teaching flow is data-driven and adaptive.
- **Tasks**:
  - [x] **FSRS integration**: Integrate FSRS (e.g. ts-fsrs) so each practice item has Retrievability (R), Stability (S), and Difficulty (D); schedule reviews and new material based on algorithm.
  - [x] **Director service**: Central "Director" that consumes FSRS state and session context to decide next item (song, lick, key, exercise) and optional difficulty/pace.
  - [x] **Context injection**: Director varies timbre/instrument for playback (Piano → Cello → Synth or internal patches) via the audio system so learning is not tied to a single sound; wire to globalAudio or JazzKiller playback layer.

## Phase 6: Polish, Analytics & Launch

*Focus: Production readiness, observability, and launch after Cloud & Community.*

- **Success Criteria**: App is performance-audited, key flows are measurable, and onboarding supports new users; ready for public or classroom rollout.
- **Tasks**:
  - [ ] **Performance & bundle audit**: Core Web Vitals, bundle size, and critical path; fix regressions.
  - [ ] **Analytics & events**: Instrument key actions (practice start/end, song unlock, lick publish) for product decisions.
  - [ ] **Onboarding & first-run**: Guided first-time experience (e.g. pick instrument, try one song or lick).
  - [ ] **Launch checklist**: Error boundaries, offline messaging, and doc/runbook for deploy and support.

## Phase 7, 8, 10: Early Piano Engine Experiments (Superseded) 🔄

*Status: Reaches 'robotic' limitation. Logic moved to Phase 11.*

## Phase 11: Pro Comping Engine (Templates & Grips) 🚀

*Focus: Professional jazz piano feel via template-based rhythm and hand-shape (grip) dictionaries.*

- **Success Criteria**: Engine plays 2-bar phrases (Standard, Sustain, Driving) using pre-curated rootless "grips." Supports "And of 4" anticipation (next-chord peeking).
- **Tasks**:
  - [ ] **Grip Dictionary**: Implement `VOICING_LIBRARY` for Major, Minor, Dominant, Altered, and Half-Diminished.
  - [ ] **Phrase-Template Logic**: Transition from random hit probabilities to 2-bar rhythmic templates.
  - [ ] **Anticipation "Push"**: Implement look-ahead logic to steal chords from the next bar on 'and of 4' hits.
  - [ ] **Bass-Aware Voicing**: Add automatic root-note support when the bass track is muted.
  - [ ] **The "Pivot Rule"**: Normalize A/B form selection to keep voicings in "The Pocket" (C3-C5).

## Phase 9: Mic Algorithm Upgrade (Stabilization & CREPE-Ready) ✅

*Focus: Eliminate neural jitter, octave jumps, and UI flicker in real-time pitch detection.*

- **Success Criteria**: Stabilized pitch (confidence gate, running median, hysteresis) in Audio Worklet; usePitchTracker and ITM store consume smooth values; optional note + cents and instrument presets.
- **Tasks**:
  - [✅] **CrepeStabilizer**: Confidence gate (confidence < 0.85 → hold last); running median (window 5); hysteresis (update only if |centDiff| > 20).
  - [✅] **Worklet integration**: Run stabilizer inside pitch-processor.js; write stabilized frequency + confidence to SAB.
  - [✅] **usePitchTracker / useITMPitchStore**: Read stabilized SAB; optional mic constraints (echoCancellation/noiseSuppression/autoGainControl false for jazz).
  - [✅] **frequencyToNote**: Tonal.js-based note name + cents deviation; "perfect intonation" (±10 cents) for UI.
  - [✅] **Instrument presets**: Clamp frequency by instrument (e.g. Double Bass 30–400 Hz, Trumpet 160–1100, Sax 100–900); optional Gemini hint for consistent sharp/flat.
  - [✅] **Tests**: CrepeStabilizer, frequencyToNote, instrument presets; verification that UI no longer flickers and octave jumps are suppressed.

## Phase 10: State-Machine Rhythmic Phrasing ✅

*Focus: Avoiding robotic loops via repetition penalties and Markov transitions.*

- **Success Criteria**: The engine tracks its previous performance and actively penalizes repeating the same pattern, resulting in organic "phrasing."
- **Tasks**:
  - [✅] **Pattern Memory**: Track deep history (last 4 patterns) in the engine.
  - [✅] **Repetition Penalty Logic**: Apply exponential weight multipliers to recently played patterns.
  - [✅] **The "Push" Awareness**: Correctly anticipate chord changes on the "and of 4".
  - [✅] **Markov Transition Matrix**: Favor desirable rhythmic sequences (e.g. Sustain -> Standard).

## Phase 11: Pro Drum Engine (Jack DeJohnette Style) ✅

*Focus: Limb independence and collaborative dynamics.*

- **Success Criteria**: Generative drums that reactive to piano density; micro-timing (Push/Drag) for organic feel.
- **Tasks**:
  - [✅] **Broken-Time Ride**: Randomized skip notes for elastic pulse.
  - [✅] **Collaborative Listening**: Simplify drum patterns when piano is "busy" (>0.8 density).
  - [✅] **Micro-Timing**: Ride pushes (-15ms), Snare drags (+20ms).
  - [✅] **Anchor Logic**: Strict Hi-Hat pedal on 2 & 4.
