# ITM Requirements (2026 Roadmap)

## Phase 1: The "Feedback" Engine

### REQ-FB-01: Guided Practice Sessions

- **Requirement**: Implement "Guided Mode" where Gemini Nano narrates a 15-minute routine for a specific song.
- **Components**: Scales (5 mins), Guide Tones (5 mins), Soloing (5 mins).

### REQ-FB-02: Active Scoring Logic

- **Requirement**: Use pitch detection to calculate an "Accuracy Score" (0-100%) in real-time.
- **Bonus**: Implement "Target Note mastery" bonuses (hitting 3rds and 7ths on downbeats).

### REQ-FB-03: Nano-Powered Critique

- **Requirement**: Post-session analysis by Gemini Nano identifying specific strengths and weaknesses (e.g., "Consistently flat on the Bridge's II-V").

### REQ-FB-04: High-Performance Pitch Engine

- **Requirement**: Implement a WASM-based pitch detector (Pitchy v3 or CREPE) in an Audio Worklet.
- **Performance**: Use `SharedArrayBuffer` for zero-latency communication with the React UI (PitchMemory + processorOptions.sab; public/worklets/pitch-processor.js).
- **Input Quality**: Enable `voiceIsolation` constraints on microphone streams to filter out practice room noise.
- **Status**: MPM in Worklet + SAB; architecture ready for CREPE-WASM swap. COOP/COEP in Vite server/preview.

## Phase 2: The "Mastery Tree"

### REQ-MT-01: Skill-Based Tagging
- **Requirement**: Categorize 1,300+ standards by harmonic complexity (Diatonic, Secondary Dominants, Modal Interchange, etc.).

### REQ-MT-02: The Progress Map
- **Requirement**: Create a visual tree (Duolingo style) where students must "Pass" a song at specific BPM/Accuracy thresholds to unlock the next.

### REQ-MT-03: Key Cycles (Rollins Routine)
- **Requirement**: Automate "Mastery" tracking across multiple keys (e.g., must master in C, F, Bb, Eb to "Pass").

## Phase 3: The "Sonic" Layer

### REQ-SL-01: Dynamic Mixer
- **Requirement**: 3-track faders for Aebersold Stems (Drums, Bass, Piano).
- **Functionality**: Allow soloing/muting specific instruments for targeted practice.

### REQ-SL-02: Visual Transcription
- **Requirement**: Real-time "Note Waterfall" showing the shapes of jazz licks as they are played.

### REQ-SL-03: Tone Matching
- **Requirement**: Analyze mic input spectrum to detect tone quality (e.g., "honking" saxophone or "muddy" guitar).

## Phase 4: Cloud & Community

### REQ-CC-01: Teacher Dashboard
- **Requirement**: Implementation of "Classrooms" via Supabase where teachers can monitor student progress (BPM, Heatmaps).

### REQ-CC-02: Lick Sharing
- **Requirement**: Allow students to publish/subscribe to Lick formulas from the Lick Converter.

### REQ-CC-03: Mobile PWA
- **Requirement**: Ensure full PWA compatibility for offline practice room use.

## Phase 5: The "Director" Engine

### REQ-DR-01: FSRS-Based Scheduling
- **Requirement**: Use FSRS (Free Spaced Repetition Scheduler) so each practice item is modeled with Retrievability (R), Stability (S), and Difficulty (D). Input (reviews, new material) is processed by the algorithm; Director uses R/S/D to decide what to show next.

### REQ-DR-02: Director Service
- **Requirement**: A central "Director" component/service that consumes FSRS state and session context to select the next item (song, lick, key, exercise) and optional difficulty/pace for the student.

### REQ-DR-03: Context Injection (Timbre/Instrument)
- **Requirement**: Director varies timbre and instrument (e.g. Piano → Cello → Synth) via the app's audio system (internal patches) so learning is not context-dependent on a single sound.

## Phase 6: Polish, Analytics & Launch

### REQ-PL-01: Performance & Bundle
- **Requirement**: Meet Core Web Vitals (LCP, FID/INP, CLS) and keep critical path lean; audit and fix regressions.

### REQ-PL-02: Analytics & Events
- **Requirement**: Instrument key user actions (practice start/end, song unlock, lick publish, teacher dashboard views) for product and growth decisions.

### REQ-PL-03: Onboarding & First-Run
- **Requirement**: First-time users get a short guided flow (e.g. instrument choice, try one song or lick) to reach “first value” quickly.

### REQ-PL-04: Launch Readiness
- **Requirement**: Error boundaries, clear offline/error messaging, and minimal deploy/support runbook.

## Technical Priorities
1. **High**: Pitch-to-Theory Sync (Turns app from book into teacher).
2. **Medium**: Gemini Nano Hint Loop (Ear training "AHA!" moments).
3. **Medium**: Cloudflare R2 Audio Hosting (Fast stem loading).
4. **Low**: Visual Geometry (p5.js aesthetics).
