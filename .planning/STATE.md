# ITM Project State

## Current Status

- **Phase**: Phase 5: The "Director" Engine
- **Status**: ✅ Phase 4 complete
- **Next Milestone**: Phase 5: The Director Engine
- **Overall Progress**: ~75%

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
