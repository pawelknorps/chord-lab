# ITM Project State

## Current Status

- **Phase**: Phase 6: Polish, Analytics & Launch
- **Status**: ✅ Phase 5 complete
- **Next Milestone**: Phase 6: Polish, Analytics & Launch
- **Overall Progress**: ~80%

## Active Requirements

- [✅] REQ-FB-01: Guided Practice Sessions
- [✅] REQ-FB-02: Active Scoring Logic
- [✅] REQ-FB-03: Nano-Powered Critique
- [✅] REQ-FB-04: Real-time Visual Heatmap
- [✅] REQ-FB-05: High-Performance Pitch Engine (WASM-Equivalent MPM + Worklets)

## Recent Achievements

- Defined the 4-phase roadmap for ITM 2026.
- Established the core tech stack for scoring (Zustand + Tonal.js + Pitch Detection).
- Built the "Teaching Machine" 15-minute routine engine.
- Integrated real-time Performance Heatmaps into the Lead Sheet.
- Automated AI-driven performance critique using Gemini Nano.
- **Implemented Professional Microphone Pipe**: Audio Worklet + SharedArrayBuffer + McLeod Pitch Method.
- **Enabled Zero-Latency Feedback**: 120Hz React bridge to the background audio thread.
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
  - `public/worklets/pitch-processor.js`: Audio Worklet with MPM, writes to SAB via processorOptions.sab; CREPE-WASM-ready.
  - useITMPitchStore loads `/worklets/pitch-processor.js` and passes sab + sampleRate in processorOptions for zero-latency pitch.
  - usePitchTracker hook for standalone pitch ref (polls SAB in rAF).
  - COOP/COEP in vite server and preview for SharedArrayBuffer.
- **JazzKiller playback**: initGlobalAudio() called on first play (togglePlayback) when !isAudioReady() so Director guide instrument works.
- **AI detection**: checkAiAvailability() and isAiApiPresent(); navigator.languageModel checked first (Chrome canary); jazzTeacherLogic and nanoHelpers aligned.
- **Chord analysis**: Functional decomposition (detectJazzChordByProfile) + CHORD_PC_TEMPLATES; Emaj7#5 and jazz alterations covered.
- **Automated tests**: PitchMemory.test.ts, aiDetection (incl. isAiApiPresent), chordDetection (48 tests passing).
