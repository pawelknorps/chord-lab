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

- **JazzKiller audio playback**: Await Tone.start() in premium engine; ensure globalAudio init when starting playback (Director guide instrument); legacy engine fallback when playbackPlan missing (use measures indices).
- **AI detection**: Shared `checkAiAvailability()` in `core/services/aiDetection.ts`; Banner and Sidebar use it; supports Chrome Prompt API (availability "available"|"downloadable"|"downloading") and legacy window.ai.
- **Automated tests**: Vitest config in vite.config.ts; `npm run test` / `npm run test:run`; tests for aiDetection (8) and JazzKiller playback plan fallback (3). Pre-existing failures remain in ConceptAnalyzer.test.ts and theoryEngine.test.ts (sharp-key spelling).
