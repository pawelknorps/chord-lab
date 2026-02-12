# ITM Project State

## Current Status

- **Phase**: Phase 16: Voice & Percussion Interactive Training
- **Status**: 🟢 Initializing Phase 16
- **Next Milestone**: Sing-to-Answer in FET + Clap-to-Perform in Rhythm Architect
- **Overall Progress**: ~93%

## Active Requirements

- [✅] REQ-MA-01: Pitch Stabilization (Confidence + Median + Hysteresis)
- [✅] REQ-MA-02: Worklet Writes Stabilized Pitch
- [✅] REQ-MA-03: Frequency-to-Note and Perfect Intonation
- [✅] REQ-MA-04: Jazz Instrument Presets
- [✅] REQ-MA-05: Optional Center-of-Gravity / Viterbi (doc)
- [✅] REQ-SMR-01: Repetition Penalty System
- [✅] REQ-SMR-02: Pattern-Specific Resilience
- [✅] REQ-SMR-03: Stateful Weighted Selection
- [✅] REQ-PRO-01: Grip Dictionary Harmony
- [✅] REQ-PRO-02: Phrase Template Rhythm
- [✅] REQ-PRO-03: Rhythmic Anticipation (The "Push")
- [✅] REQ-PRO-04: Bass-Assist Integration
- [✅] REQ-PRO-05: Pivot Rule Normalization
- [✅] REQ-ARE-01: BPM-Aware Pattern Selection
- [ ] REQ-APE-01: Voice-Leading Engine
- [ ] REQ-APE-02: Chord DNA Model
- [ ] REQ-APE-03: Register Management (Soprano Anchor)
- [ ] REQ-APE-04: Tritone Substitution
- [✅] REQ-FB-01: Guided Practice Sessions
- [✅] REQ-FB-02: Active Scoring Logic
- [✅] REQ-FB-03: Nano-Powered Critique
- [✅] REQ-FB-04: Real-time Visual Heatmap
- [✅] REQ-FB-05: High-Performance Pitch Engine (WASM-Equivalent MPM + Worklets)

## Recent Achievements

- **Completed Phase 12.1: Bass Rhythm Variation (2026-02-12)**:
  - Implemented `BassRhythmVariator` with rhythmic variations: "The Skip" and "The Rake".
  - Integrated variations into `WalkingBassEngine` and refactored `useJazzBand.ts`.
  - Implemented ghost note "Sample Switching" logic using a twin-sampler approach (muted release).
  - Verified with unit tests covering skip/rake patterns and standard fallback.
- **Completed Phase 14: Pitch Detection Latency (Break the Latency Wall)**:
  - 16 kHz downsampling in worklet (native circular buffer, linear-interp to 1024); MPM at effective 16 kHz.
  - Zero-copy circular buffer; hop size 128; inference every block once buffer full; pre-allocated tempNative, downsampled, nsdf.
  - Optional hopBlocks throttle; CREPE-Tiny/Small swap path documented in RESEARCH.md; no console in worklet.
- **Completed Phase 11: Pro Drum Engine (DeJohnette-Style)**:
  - Implemented `DrumEngine` with "Elastic" Ride, "Chatter" Snare/Kick, and "Hi-Hat" Anchor.
  - Added collaborative dynamics: drummer listens and simplifies when piano density is high.
  - Implemented micro-timing (Ride Push / Snare Drag) for an organic "pocket."
  - Verified with 120Hz React bridge integration in `useJazzBand.ts`.
- **Completed Phase 10: State-Machine Rhythmic Phrasing**:
    - Upgraded `RhythmEngine` with a deep pattern history and Markov transition biases.
    - Implemented exponential repetition penalties to force varied phrasing.
    - Integrated adaptive energy/activity levels from the UI to drive rhythmic density.
    - Verified rhythmic variety and "Push" (anticipation) logic with automated Vitest suite.
- Defined the 4-phase roadmap for ITM 2026.
- Established the core tech stack for scoring (Zustand + Tonal.js + Pitch Detection).
- Built the "Teaching Machine" 15-minute routine engine.
- Integrated real-time Performance Heatmaps into the Lead Sheet.
- Automated AI-driven performance critique using Gemini Nano.
- **Implemented Professional Microphone Pipe**: Audio Worklet + SharedArrayBuffer + McLeod Pitch Method.
- **Enabled Zero-Latency Feedback**: 120Hz React bridge to the background audio thread.
- **Completed Phase 9: Mic Algorithm Upgrade**:
    - Implemented `CrepeStabilizer` (confidence gate, median filter, hysteresis) in TypeScript and Audio Worklet.
    - Added `frequencyToNote` metadata (note name, cents deviation, perfect intonation indicator).
    - Integrated Jazz Instrument Presets (Double Bass, Sax, Trumpet, etc.) with frequency clamping.
    - Upgraded `useITMPitchStore` and `useHighPerformancePitch` for stabilized data.
    - Verified stabilization logic with unit tests.
- **Completed Phase 2: The "Mastery Tree"**:
  - Implemented Song Tagging System for harmonic complexity.
  - Built Visual Progress Tree UI component for song progression.
  - Implemented Key Cycle Routine logic for tracking mastery across keys.
- **Completed Phase 3: The "Sonic" Layer**:
  - Premium Mixer (Bass, Drums, Piano volume + Mute/Solo), Master Limiter/EQ in globalAudio.
  - Note Waterfall wired to band engine with Transport sync and harmonic coloring.
  - ToneSpectrumAnalyzer and Acoustic Feedback (Warmth/Brightness) for mic tone analysis.
- **Completed Phase 4: Cloud & Community**:
  - Supabase client, schema (profiles, song_progress, classrooms, classroom_students, licks), RLS.
  - Auth (sign-in/sign-up, AuthProvider, ensureProfile), progress sync (useSupabaseProgressSync, SyncBridge).
  - Teacher Dashboard (classrooms, invite code, StudentProgressView), teacher nav when role=teacher.
  - Lick Feed (publish from LickLibrary, LickFeed + Copy to library, /lick-feed route).
  - PWA: manifest (Chord Lab, icons), vite-plugin-pwa service worker.
- **Completed Phase 5: The Director Engine**:
  - FSRS (ts-fsrs): directorTypes, useDirectorStore (persist), fsrsBridge (getState, recordReview, recordReviewFromOutcome, getDueItems, getNextNewItems).
  - DirectorService.getNextDecision; useDirector hook; JazzKiller "Suggested next" button (song + key from Director).
  - directorInstrumentSignal; globalAudio celloSynth, getGuideInstrument, playGuideChord; JazzKiller band uses guide instrument (Piano → Cello → Synth rotation).

## Stabilization (Phase 6 prep)

- **High-Performance Ear (2026)**:
  - `PitchMemory.ts`: createPitchMemory() for 8-byte SAB (frequency + confidence); used by ITM pitch store.
  - `public/worklets/pitch-processor.js`: Audio Worklet with MPM; **Phase 14**: zero-copy circular buffer, 16 kHz downsampling, hop 128; writes to SAB; CREPE-WASM-ready.
  - useITMPitchStore loads `/worklets/pitch-processor.js` and passes sab + sampleRate in processorOptions for low-latency pitch.
  - usePitchTracker hook for standalone pitch ref (polls SAB in rAF).
  - COOP/COEP in vite server and preview for SharedArrayBuffer.
- **JazzKiller playback**: initGlobalAudio() called on first play (togglePlayback) when !isAudioReady() so Director guide instrument works.
- **AI detection**: checkAiAvailability() and isAiApiPresent(); navigator.languageModel checked first (Chrome canary); jazzTeacherLogic and nanoHelpers aligned.
- **Chord analysis**: Functional decomposition (detectJazzChordByProfile) + CHORD_PC_TEMPLATES; Emaj7#5 and jazz alterations covered.
- **Automated tests**: PitchMemory.test.ts, aiDetection (incl. isAiApiPresent), chordDetection (48 tests passing).

## Phase 9: Mic Algorithm Upgrade (planned)

- **Scope**: CrepeStabilizer (confidence gate, running median, hysteresis); in-worklet stabilization; usePitchTracker/ITM consume stabilized SAB; frequencyToNote + perfect intonation (±10 cents); jazz instrument presets (frequency clamping); tests.
- **Planning**: `.planning/phases/09-mic-algorithm-upgrade/PLAN.md`, RESEARCH.md. ROADMAP and REQUIREMENTS updated (REQ-MA-01–REQ-MA-05).

## Phase 14: Pitch Detection Latency (Break the Latency Wall) ✅

- **Status**: Completed.
- **Scope**: 16 kHz downsampling in worklet; zero-copy circular buffer; hop size 128; pre-allocated buffers; optional hopBlocks throttle; CREPE-Tiny/Small swap path documented.
- **Planning**: `.planning/phases/14-pitch-latency/PLAN.md`, RESEARCH.md, SUMMARY.md, VERIFICATION.md.
- **Delivered**: pitch-processor.js updated with native circular buffer, linear-interp downsampler, MPM at 16 kHz effective, inference every block (or every hopBlocks); no GC in hot path; no console in worklet. CREPE swap path in RESEARCH.md.

## Phase 12: Walking Bass Engine (Target & Approach)

- **Status**: Implemented.
- **WalkingBassEngine**: 4-beat strategy (Anchor → Bridge → Bridge → Approach); Beat 4 chromatic or 5th-of-destination; E1–G3 range; tonal.js Chord/Note.
- **Band integration**: useJazzBand generates full line at beat 0, plays `line[beat]` for 0–3; fallback to JazzTheoryService.getNextWalkingBassNote if line invalid.
- **Tests**: WalkingBassEngine.test.ts (4 notes, range, Beat 1 root, Beat 4 approach, state carry).

## Phase 13: Standards-Based Exercises (Scales, Guide Tones, Arpeggios) ✅

- **Status**: Completed.
- **Goal**: **New module inside JazzKiller**: timed exercises over the standards (scales, guide tones, arpeggios) in sync with playback and chart; support both mic and MIDI input. Same standard picker, same lead sheet, same band.
- **Delivered**: ExerciseInputAdapter (mic/MIDI → getCurrentNote), StandardsExerciseEngine (getTargetSet + scoreNote), useStandardsExercise hook, StandardsExercisesPanel, JazzKiller integration (Exercises button, sidebar, panel). Unit tests: StandardsExerciseEngine.test.ts (8 passing).
- **Planning**: `.planning/phases/13-standards-exercises/PLAN.md`, SUMMARY.md, VERIFICATION.md.

## Phase 15: Standards Exercises — Error Heatmaps, Transcription & AI Analysis ✅

- **Status**: Completed.
- **Goal**: Extend Phase 13 with error heatmaps (per measure, per exercise type: Scales • Guide Tones • Arpeggios), option to record written transcription of solo (mic or MIDI), and AI analysis of performance with advice and development suggestions.
- **Requirements**: REQ-SBE-06 (error heatmaps), REQ-SBE-07 (record + written transcription), REQ-SBE-08 (AI analysis with advice and development suggestions).
- **Delivered**: useStandardsExercise exposes statsByMeasure and exerciseType; StandardsExerciseHeatmapOverlay + useStandardsExerciseHeatmapStore; Lead Sheet shows exercise heatmap when Exercises panel open; useSoloTranscription + SoloTranscriptionPanel (Record solo → note list + Copy); generateStandardsExerciseAnalysis in jazzTeacherLogic; "Analyze performance" button in StandardsExercisesPanel; unit tests for generateStandardsExerciseAnalysis.
- **Completed Phase 14.1: SwiftF0 SOTA 2026 Integration**:
  - Web Worker infrastructure for neural offloading (non-blocking inference).
  - Instrument-aware hysteresis profiles (Vocals, Trumpet, Guitar).
  - Atonal Gating (RMS + Confidence) to bridge noise gaps ("chiff" and "pluck").
  - Regression Head support for sub-cent pitch resolution.
  - Zero-Copy PCM pipeline sharing raw 16kHz audio with the worker.
  - SwiftF0 enabled by default in `useHighPerformancePitch` with MPM fallback.
