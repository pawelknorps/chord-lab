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

## Phase 2: The "Mastery Tree"

*Focus: Standardizing the 1,300 standards into a learning path.*

- **Success Criteria**: A user can navigate a visual tree and unlock songs based on their performance data.
- **Tasks**:
  - [ ] Implement **Song Tagging System**: Metadata for harmonic complexity.
  - [ ] Build **Visual Progress Tree**: UI component (SVG/Canvas) for song progression.
  - [ ] Implement **Key Cycle Routine**: Logic for tracking mastery across keys (Sonny Rollins approach).

## Phase 3: The "Sonic" Layer

*Focus: Moving from prototype audio to high-fidelity practice.*

- **Success Criteria**: High-quality stems loaded via Cloudflare R2 with a 3-track mixer for user control.
- **Tasks**:
  - [ ] Configure **Cloudflare R2** for stem storage and fast delivery.
  - [ ] Build **Dynamic Mixer Component**: Separate volume controls for Bass, Drums, and Piano.
  - [ ] Implement **Note Waterfall**: Real-time MIDI-to-Visual transcription layer.
  - [ ] Add **Tone Selection Spectrum**: Basic mic analysis feedback for instrument quality.

## Phase 4: Cloud & Community

*Focus: Scaling from local-first to a connected ecosystem.*

- **Success Criteria**: Students can share licks and teachers can see their dashboards remotely.
- **Tasks**:
  - [ ] Integrate **Supabase** for user profiles and progress synchronization.
  - [ ] Build **Teacher Dashboard UI**: Classroom management and student analytics.
  - [ ] Implement **Lick Social Feed**: Publishing system for converted licks.
  - [ ] Final **PWA Optimization**: Service workers and offline manifest.
