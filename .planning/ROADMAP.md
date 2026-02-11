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

## Phase 5: The "Director" Engine

*Focus: Adaptive curriculum driven by spaced repetition and context variation.*

- **Success Criteria**: The AI "Director" schedules what to practice using FSRS (R, S, D) and varies timbre/instrument (e.g. Piano → Cello → Synth) to reduce context-dependency; teaching flow is data-driven and adaptive.
- **Tasks**:
  - [ ] **FSRS integration**: Integrate FSRS (e.g. ts-fsrs) so each practice item has Retrievability ($R$), Stability ($S$), and Difficulty ($D$); schedule reviews and new material based on algorithm.
  - [ ] **Director service**: Central "Director" that consumes FSRS state and session context to decide next item (song, lick, key, exercise) and optional difficulty/pace.
  - [ ] **Context injection**: Director varies timbre/instrument for playback (Piano → Cello → Synth or internal patches) via the audio system so learning is not tied to a single sound; wire to globalAudio or JazzKiller playback layer.

## Phase 6: Polish, Analytics & Launch

*Focus: Production readiness, observability, and launch after Cloud & Community.*

- **Success Criteria**: App is performance-audited, key flows are measurable, and onboarding supports new users; ready for public or classroom rollout.
- **Tasks**:
  - [ ] **Performance & bundle audit**: Core Web Vitals, bundle size, and critical path; fix regressions.
  - [ ] **Analytics & events**: Instrument key actions (practice start/end, song unlock, lick publish) for product decisions.
  - [ ] **Onboarding & first-run**: Guided first-time experience (e.g. pick instrument, try one song or lick).
  - [ ] **Launch checklist**: Error boundaries, offline messaging, and doc/runbook for deploy and support.
