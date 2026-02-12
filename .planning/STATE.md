# ITM Project State

## Current Status

- **Phase**: Phase 17–21 ✅; Phase 22 (Trio Hi-Fi Mixer) or Phase 6 Polish next
- **Status**: Phase 21 completed (Tonality Segmentation, Functional Labeling, analyzeHarmony pipeline, loadSong integration)
- **Next Milestone**: Phase 6 Polish, Phase 22 (Trio Hi-Fi Mixer), or `/gsd-complete-milestone` for harmonic-analysis-tonality
- **Overall Progress**: ~98%

## Active Requirements

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

- **Phase 21: Professional-Grade Harmonic Analysis (Tonality Segmentation)**:
  - TonalitySegmentationEngine: 24 key centers, getFitCost, getTransitionCost, Viterbi, getSegments (REQ-HAT-01–05).
  - FunctionalLabelingEngine: Chord DNA + context → Roman numeral; jazz cliché rules (ii–V–I, subV7, iiø7); chromatic/constant-structure → "Key shift" (REQ-HAT-06–08).
  - harmonicAnalysisPipeline: preprocessToSlots, analyzeHarmony(); usePracticeStore.loadSong uses pipeline for detectedPatterns with ConceptAnalyzer fallback (REQ-HAT-09–11).
  - AnalysisTypes extended: KeySegmentRef, Concept.keySegment, romanNumeral, segmentLabel. Wave 5 (Live Grounding) deferred.
- **Phase 20: Jazz Band Comping Evolution (Smart Pattern Engine)**:
  - PatternType + RHYTHM_TEMPLATE_TO_PATTERN_TYPE in RhythmEngine; patternTypeBias filters candidates; FILL → minimal comp.
  - JazzMarkovEngine (transition matrix, getNextPatternType, updateIntensity); useJazzBand calls every 4 bars; FILL → DrumEngine.generateFill.
  - Humanization at schedule time: bass micro-timing (−5 to +2 ms), piano velocity ±10%, drum ghost probability 60%.
  - getProceduralLeadInNote in JazzTheoryService; last eighth of bar bass note overridden with approach to next chord root.
  - MarkovBridge: when soloist-responsive on, updateIntensity(soloistActivity) biases matrix before getNextPatternType(). REQ-JBCE-01..10.
- **Phase 19: Soloist-Responsive Playback (Call-and-Response)**:
  - Toggle (default off); soloist activity (0–1) from SwiftF0 pitch duty cycle; useSoloistActivity polls pitch store; useJazzBand steers effective activity when toggle on (activity *= 1 - 0.65 * soloist); Mixer UI “Call-and-Response”; no regression when off. REQ-SRP-01..08.
- **Phase 14.2: SwiftF0 Pitch Analysis Speed Optimization**:
  - Optional dev-only timing: `setTiming` + `enableTiming` in PitchStoreOptions; worker posts `timing` with preprocessMs/inferenceMs/totalMs; DEV console logs (REQ-SF0-S01).
  - Zero allocations in hot path: single pre-allocated `inputTensorOrt` reused per frame (REQ-SF0-S02).
  - Preprocessing: tightened loop (len, single read, inline abs) (REQ-SF0-S03).
  - Adaptive poll: sleep `max(0, cycleMs - elapsed)` so cycle stays ~8 ms (REQ-SF0-S04).
  - No regression: same regression head, stabilizer, instrument profiles (REQ-SF0-S05). Milestone: `.planning/milestones/swiftf0-speed/`; phase: `.planning/phases/14.2-swiftf0-speed/` (SUMMARY.md, VERIFICATION.md).
- **Phase 18: Creative Jazz Trio Playback (hybrid)**:
  - Trio context: getPlaceInCycle, getSongStyleTag, isSoloistSpace in `trioContext.ts`; computed at beat 0 in useJazzBand.
  - Style-driven engines: ReactiveCompingEngine (density cap), RhythmEngine (balladMode from place/style), DrumEngine (density cap), BassRhythmVariator (soloistSpace → no push/skip/rake); all optional params—backward compatible.
  - Soloist space: when place === 'solo' or style === 'Ballad', density cap 0.5, sustain bias, bass variation 0, half-time bass; out head uncapped so band can build.
  - Unit tests: trioContext.test.ts (15 passing). Planning: `.planning/phases/18-creative-jazz-trio-playback/` (SUMMARY.md, VERIFICATION.md).
- **Phase 17: Innovative Interactive Exercises (Wave 1 + Wave 2 + Wave 3)**:
  - New module at `/innovative-exercises` with nav under Practice.
  - Ghost Note Match: lick + ghost slot, 10¢ match → pro sample replacement (REQ-IE-01); optional MIDI.
  - Intonation Heatmap: drone + scale, heatmap green/red per degree (REQ-IE-02).
  - Voice-Leading Maze: ii–V–I, guide tones only, mute on wrong note (REQ-IE-03); optional MIDI.
  - Swing Pocket Validator: metronome 2 and 4, onset capture (mic or MIDI), SwingAnalysis (ratio + offset ms), Pocket Gauge (REQ-IR-01).
  - Call and Response: reference 2-bar break, student onsets, align by first attack, early/late per attack (REQ-IR-02).
  - Ghost Rhythm Poly-Meter: 4/4 backing, 3-over-4 grid, pitch G ±5¢, win state (REQ-IR-03).
  - Wave 3: Unified input (Mic | MIDI) for Ghost Note, Voice-Leading, Swing Pocket; unit tests (SwingAnalysis, getAllowedPitchClasses).
- **Completed Phase 12: Walking Bass Engine (Target & Enclosure Edition) (2026-02-12)**:
  - Replaced mathematical walking with "Teleological" Bebop strategies (Paul Chambers/Ray Brown style).
  - Implemented **Circle of Fifths** logic with "Dominant Drops" (Setup 5th of Target on Beat 4).
  - Implemented **Stepwise/Enclosure** logic (Upper Neighbor -> Lower Neighbor -> Target) for melodic pull.
  - Implemented **Static/Pedal** logic with Ron Carter-style oscillations and Octave Skips.
  - Applied "Pro" velocity profile ([1.0, 0.6, 0.9, 0.85]) for authentic swing articulation.
- **Completed Phase 12.2: Bebop Bass Engine (2026-02-12)**:
  - Upgraded bass logic with Paul Chambers/Ray Brown style syncopation.
  - Implemented "The Push" (Anticipation) with stateful Bar-to-Bar memory for downbeat skipping.
  - Added "The Skip" (Double Time) fills using Rakes, Octave jumps, and Chromatic runs.
  - Linked `activityLevel` (energy) to variation probability for dynamic band interaction.
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

## Phase 12: Walking Bass Engine (Target & Approach) ✅

- **Status**: Completed (execute-phase 12 run: SUMMARY.md, VERIFICATION.md, ROADMAP updated).
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
- **Phase 18: Creative Jazz Trio Playback ✅**:
  - Milestone `.planning/milestones/jazz-trio-playback/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
  - Implemented hybrid: trioContext.ts (getPlaceInCycle, getSongStyleTag, isSoloistSpace); optional trio params on comping, rhythm, drum, bass engines; useJazzBand wires at beat 0. REQ-TRIO-01..08 satisfied; old system preserved (additive only).
- **Completed Phase 14.1: SwiftF0 SOTA 2026 Integration**:
  - Web Worker infrastructure for neural offloading (non-blocking inference).
  - Instrument-aware hysteresis profiles (Vocals, Trumpet, Guitar).
  - Atonal Gating (RMS + Confidence) to bridge noise gaps ("chiff" and "pluck").
  - Regression Head support for sub-cent pitch resolution.
  - Zero-Copy PCM pipeline sharing raw 16kHz audio with the worker.
  - SwiftF0 enabled by default in `useHighPerformancePitch` with MPM fallback.
