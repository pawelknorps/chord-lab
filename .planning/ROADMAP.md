# ITM Roadmap 2026

## Phase 1: The "Feedback" Engine ✅

*Focus: Turning the app into an active listener and teacher.*

- **Success Criteria**: Student can play along to a song and receive a numerical accuracy score based on microphone input with <10ms latency.
- **Tasks**:
  - [x] Implement **High-Performance Pitch Detection**: Use **SwiftF0 (2026 SOTA)** for neural jazz-proof accuracy.
  - [x] Implement **Audio Worklet + SharedArrayBuffer Pattern**: Move pitch math to a separate thread or background worker to ensure 120Hz UI smoothness.
  - [x] Enable **MediaTrackConstraints.voiceIsolation**: Built-in browser AI for cleaning instrument input in noisy environments.
  - [x] Implement **Zustand Scoring Logic**: Real-time comparison of Mic Pitch to Tonal.js Chord Tones.
  - [x] Build **Guided Practice UI**: Component to manage the 15-minute routine timer and narrations.
  - [x] Integrate **Gemini Nano Analysis**: Hook that summarizes session performance into a pedagogical critique.
  - [x] Create **Performance Heatmap**: Visualization of where in the song the student succeeded/failed.

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
  - [✅] **Micro-Timing**: Ride pushes (-4ms), Snare drags (+5ms), ±1ms jitter.
  - [✅] **Anchor Logic**: Strict Hi-Hat pedal on 2 & 4.

## Phase 12: Walking Bass Engine (Target & Approach) ✅

*Focus: Teleological walking bass—Beat 4 leads into the next chord.*

- **Success Criteria**: 4-note line per bar with Beat 4 as chromatic or dominant approach; smooth voice leading across bar lines.
- **Tasks**:
  - [x] **WalkingBassEngine**: Class with `generateWalkingLine(currentChord, nextChord)` (Anchor → Bridge → Bridge → Approach); E1–G3 range.
  - [x] Phase 12: Walking Bass Engine (Target & Enclosure Edition) (2026-02-12)
  - [x] **Approach strategies**: Chromatic from below/above, 5th-of-destination; bridge notes as chord tones between Beat 1 and Beat 4.
  - [x] **Band integration**: useJazzBand generates line at beat 0, plays `line[beat]` for 0–3; state carried to next bar.

## Phase 12.1: Bass Rhythm Variation (2026-02-12) ✅

## Phase 12.2: Bebop Bass Engine (2026-02-12) ✅

*Focus: Organic bass variations (Skips, Rakes, Drops) to avoid robotic 4-note loops.*

- **Success Criteria**: Every bar has a small chance (15-25%) to mutate from standard walking to a rhythmic variation; including "The Skip" (and-of-2), "The Rake" (triplet into 1), and "The Drop" (space).
- **Completed Phase 12.2: Bebop Bass Engine (2026-02-12)**:
  - Upgraded bass logic with Paul Chambers/Ray Brown style syncopation.
  - Implemented "The Push" (Anticipation) with stateful Bar-to-Bar memory for downbeat skipping.
  - Added "The Skip" (Double Time) fills using Rakes, Octave jumps, and Chromatic runs.
  - Linked `activityLevel` (energy) to variation probability for dynamic band interaction.
- **Completed Phase 12.1: Bass Rhythm Variation (2026-02-12)**:
  - [ ] **BassRhythmVariator**: Implement class with `applyVariations(line, barIndex)` that transforms MIDI arrays into `BassEvent[]`.
  - [ ] **Sample Switch Logic**: Update audio engine to use staccato envelope/sample for ghost/muted notes.
  - [ ] **JazzBand Integration**: Refactor `useJazzBand` to consume `BassEvent[]` and handle sub-beat timing for variations.

## Phase 13: Standards-Based Exercises (Scales, Guide Tones, Arpeggios) ✅

*Focus: **New module inside JazzKiller**—timed exercises over the standards (scales, guide tones, arpeggios) in sync with playback and the chart; support both mic and MIDI.*

- **Success Criteria**: Inside JazzKiller, student can pick a standard (same library), choose an exercise type (Scales / Guide Tones / Arpeggios), play along with playback, and receive real-time evaluation; input can be mic or MIDI.
- **Tasks**:
  - [x] **Scale exercise**: Per-chord target scale from ChordScaleEngine; evaluate student input (mic/MIDI) against scale notes in time with chart and playback.
  - [x] **Guide-tone exercise**: Per-chord target 3rd/7th from GuideToneCalculator; score hitting guide tones on downbeats (reuse/extend REQ-FB-02).
  - [x] **Arpeggio exercise**: Per-chord chord tones as target; real-time evaluation in sync with playback.
  - [x] **Unified input**: Single exercise engine consuming either mic pitch (useITMPitchStore / existing pipeline) or MIDI; same scoring logic for both.
  - [x] **JazzKiller Exercises module**: New view/panel **inside JazzKiller** (same standard picker, same chart, same playback); select exercise type + standard, start playback, show real-time feedback; optional Director/FSRS integration.

## Phase 14: Pitch Detection Latency (Break the Latency Wall) ✅

*Focus: Reduce delay between playing a note and UI updating; target <10ms with **SwiftF0**; architecture neural-ready.*

- **Success Criteria**: Hop size 128; 16 kHz effective input (downsample in worklet); zero-copy circular buffer; no GC in hot path; optional hop throttle via processorOptions.
- **Tasks**:
  - [x] **16 kHz downsampling**: Native circular buffer of size ceil(1024 * sampleRate / 16000); linear-interp downsample to 1024; MPM runs at effective 16 kHz.
  - [x] **Zero-copy circular buffer**: TypedArray + ptr; buffer.set(input, ptr) with wrap; no push/shift.
  - [x] **Hop size 128**: Run inference every block (or every hopBlocks) once buffer is full; overlapping frames.
  - [x] **Pre-allocated buffers**: tempNative, downsampled, nsdf; no allocations in process().
  - [x] **SwiftF0 swap path**: Document in RESEARCH; when integrated, use SwiftF0 for ~40x speed vs CREPE with SOTA accuracy.

## Phase 15: Standards Exercises — Error Heatmaps, Transcription & AI Analysis ✅

*Focus: Extend Phase 13 with error heatmaps (Scales • Guide Tones • Arpeggios), optional written transcription of the solo, and AI analysis with advice and development suggestions.*

- **Success Criteria**: When playing over a standard (mic or MIDI), user can view error heatmaps by exercise type; optionally record a solo and get a written transcription; after a session (or on demand), receive AI analysis with advice and development suggestions.
- **Tasks**:
  - [x] **Error heatmaps**: Expose per-measure hit/miss from useStandardsExercise; show heatmap on lead sheet (overlay per measure: green/amber/red) via StandardsExerciseHeatmapOverlay and useStandardsExerciseHeatmapStore; filter by exercise type (Scales, Guide Tones, Arpeggios).
  - [x] **Record solo & transcription**: In Standards Exercises, add "Record solo" (SoloTranscriptionPanel); capture timestamped notes (pitch + measure/beat) from mic or MIDI via useSoloTranscription; at end of recording produce written note list (Tonal.js). Tie to current standard and transport.
  - [x] **AI analysis**: generateStandardsExerciseAnalysis(sessionData) in jazzTeacherLogic: input heatmap (hits/misses), optional transcription, accuracy, exercise type, standard, key; output AI text (Gemini Nano) with strengths/weaknesses, advice, development suggestions. "Analyze performance" button in StandardsExercisesPanel.

## Phase 14.1: SwiftF0 SOTA 2026 Integration ✅

*Focus: Pro-grade neural pitch detection with instrument-aware post-processing.*

- **Success Criteria**: Web Worker offloading of SwiftF0 (WASM/WebGPU); <5ms inference; instrument-specific hysteresis (Vocals/Trumpet/Guitar); sub-cent resolution via Regression Head.
- **Tasks**:
  - [x] **Neural Inference Worker**: `SwiftF0Worker.ts` with non-blocking polling of PCM RingBuffer.
  - [x] **Instrument Hysteresis Library**: Distinct stability profiles for various jazz instruments.
  - [x] **Atonal Gating (RMS)**: Transient bridging for "chiff" and pluck noise.
  - [x] **Regression Head Logic**: Sub-cent refinement from bins 3-134.
  - [x] **Unified Store Integration**: `useITMPitchStore` favors SwiftF0 with MPM fallback.

## Phase 14.2: SwiftF0 Pitch Analysis Speed Optimization (Milestone) ✅

*Focus: Inference and pipeline optimizations so real-time pitch feels snappier; target &lt;5 ms per frame where possible.*

- **Milestone**: `.planning/milestones/swiftf0-speed/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Success Criteria**: Per-frame inference time reduced; zero allocations in hot path; poll interval aligned with inference; no regression in accuracy or instrument profiles.
- **Tasks**:
  - [x] **Phase 1 – Measure and Baseline**: Optional timing via `setTiming` + `enableTiming` option; STATE baseline instructions (REQ-SF0-S01).
  - [x] **Phase 2 – Inference and Hot Path**: Reused input tensor; tightened preprocessing loop (REQ-SF0-S02, S03, S05).
  - [x] **Phase 3 – Scheduling and Polish**: Adaptive sleep `max(0, cycleMs − elapsed)`; STATE.md and SUMMARY/VERIFICATION updated (REQ-SF0-S04, S05).

## Phase 14.3: SwiftF0 SOTA Precision (Flicker-Free, Semitone-Stable) ✅

*Focus: Achieve SOTA precision for SwiftF0—Local Expected Value (no argmax-only), median filter, hysteresis (60¢, 3-frame note lock), chromatic + cents, tuner bar.*

- **Milestone**: `.planning/milestones/swiftf0-precision/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Success Criteria**: LEV used for pitch; median (5–7 frames) + hysteresis (60¢, 3-frame stability) active; chromatic note + cents exposed; at least one tuner bar (cents) in the app.
- **Tasks**:
  - [x] **Phase 1 – Verify LEV and Temporal Stack**: Confirm swiftF0Inference 9-bin LEV; CrepeStabilizer median + hysteresis; instrumentProfiles 60¢/3-frame reference; smoothing in Worker (REQ-SF0-P01, P02, P03, P06).
  - [x] **Phase 2 – Chromatic + Cents API**: Verify frequencyToNote chromatic + cents; consumers can read cents (REQ-SF0-P04).
  - [x] **Phase 3 – Tuner Bar UI**: Add or wire tuner bar (cents) to at least one pitch screen (REQ-SF0-P05).

## Phase 17: Innovative Interactive Exercises (Ear + Rhythm) ✅

*Focus: New module of pitch-centric ear exercises (Ghost Note, Intonation Heatmap, Voice-Leading Maze) and micro-timing rhythm exercises (Swing Pocket, Call and Response, Ghost Rhythm).*

- **Success Criteria**: Six exercises deliverable; Ghost Note (10¢ → pro sample), Intonation Heatmap (green/blue/red per degree), Voice-Leading Maze (mute until guide tone); Swing Pocket (ratio + Pocket Gauge + ms offset), Call and Response (waveform overlay), Ghost Rhythm (5¢ stability + 3-vs-4).
- **Milestone**: `.planning/milestones/innovative-exercises/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Tasks**:
  - [x] **Wave 1 – Ear**: Ghost Note Match (lick + ghost → 10¢ match → pro sample); Intonation Heatmap (drone + scale + heatmap UI); Voice-Leading Maze (ii–V–I + GuideToneCalculator + mute on wrong note).
  - [x] **Wave 2 – Rhythm**: Swing Pocket Validator (onset timing, swing ratio, Pocket Gauge, Push/Lay Back ms); Call and Response (reference break + student onsets, align by first attack, early/late per attack); Ghost Rhythm Poly-Meter (3 vs 4 grid, 5¢ pitch stability on G, win state).
  - [x] **Wave 3**: Module entry in app nav (`/innovative-exercises`); list of six exercises; docs and verification (SUMMARY.md, VERIFICATION.md).

## Phase 18: Creative Jazz Trio Playback Modelling ✅

*Focus: Push the limits of modelling jazz trio playing—band adapts to **place in the cycle**, **song type**, **inter-instrument interaction**, and **space for the soloist** (especially in ballads).*

- **Success Criteria**: Place-in-cycle (intro/head/solo/out head/ending) and song-style tag (Ballad, Medium, Latin, Bossa, Waltz) drive comping, bass, and drums; in ballads and solo sections the band leaves space; trio feels like a coherent unit.
- **Milestone**: `.planning/milestones/jazz-trio-playback/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Tasks**:
  - [x] **Phase 1**: Place-in-cycle resolver (REQ-TRIO-01) and song-style tag (REQ-TRIO-02); wire into useJazzBand at beat 0.
  - [x] **Phase 2**: Style-driven comping (REQ-TRIO-03), bass (REQ-TRIO-04), drums (REQ-TRIO-05); audibly distinct Ballad vs Medium vs Latin/Waltz.
  - [x] **Phase 3**: Soloist-space policy (REQ-TRIO-06), cross-instrument interaction (REQ-TRIO-07), band loop integration (REQ-TRIO-08).
- **Implementation**: Hybrid—additive only; old balladMode/activity preserved. `trioContext.ts` (getPlaceInCycle, getSongStyleTag, isSoloistSpace); optional trio params on ReactiveCompingEngine, RhythmEngine, DrumEngine, BassRhythmVariator; useJazzBand computes place/style at beat 0 and passes to all engines. See `.planning/phases/18-creative-jazz-trio-playback/SUMMARY.md`, VERIFICATION.md.

## Phase 19: Soloist-Responsive Playback (Call-and-Response) ✅

*Focus: [Experimental feature] (toggle): playback listens to the soloist via SwiftF0 and steers the band—more space when user plays more/faster, more backing when user plays less.*

- **Success Criteria**: Toggle (default off); soloist activity derived from SwiftF0 drives band density/space when on; no regression when off; toggle UI in Mixer or band panel.
- **Milestone**: `.planning/milestones/soloist-responsive-playback/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Tasks**:
  - [x] **Phase 1**: Toggle signal; soloist activity from useITMPitchStore (pitch duty cycle → 0–1); graceful fallback when no mic.
  - [x] **Phase 2**: useJazzBand reads toggle + soloist activity; effective activity steered (activity *= 1 - 0.65 * soloist); no regression when toggle off.
  - [x] **Phase 3**: Toggle UI in Mixer (Call-and-Response); STATE.md and VERIFICATION.md updated.

## Phase 20: Jazz Band Comping Evolution (Smart Pattern Engine) ✅

*Focus: Evolve pattern library into Smart Pattern Engine—Markov transitions, humanization, procedural lead-ins, optional density-driven band vibe.*

- **Success Criteria**: Patterns tagged (LOW / MEDIUM / HIGH / FILL); Markov engine selects next pattern every 4–8 bars; humanization (bass micro-timing, velocity blur, ghost probability); last eighth of bar procedural (approach to next chord); optional RhythmicDensityTracker + MarkovBridge when soloist-responsive on.
- **Milestone**: `.planning/milestones/jazz-band-comping-evolution/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Tasks**:
  - [x] **Phase 1**: Markov Pattern Engine + pattern tagging (REQ-JBCE-01, REQ-JBCE-02, REQ-JBCE-03).
  - [x] **Phase 2**: Stochastic humanization (REQ-JBCE-04, REQ-JBCE-05, REQ-JBCE-06).
  - [x] **Phase 3**: Procedural lead-ins at bar end (REQ-JBCE-07, REQ-JBCE-08).
  - [x] **Phase 4** (optional): MarkovBridge / updateIntensity (REQ-JBCE-09, REQ-JBCE-10).
  - [ ] **Phase 5** (future): Meter independence via rhythmic atoms (REQ-JBCE-11 deferred).

## Phase 21: Professional-Grade Harmonic Analysis (Tonality Segmentation) ✅

*Focus: Refactor JazzKiller harmonic overlays from chord-by-chord labeling to tonality segmentation and Functional DNA mapping; optional SwiftF0 live grounding.*

- **Success Criteria**: Key center segments and Roman numerals reflect context (e.g. Blue Bossa Cm7 = i); tritone subs and constant-structure tunes labeled correctly; JazzKiller AnalysisOverlay consumes new pipeline; optional Conflict Resolver and Pedal Point Detection from SwiftF0.
- **Milestone**: `.planning/milestones/harmonic-analysis-tonality/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Tasks**:
  - [x] **Wave 1–2**: Tonality segmentation (Fit cost, Transition cost, Viterbi, segment list API) (REQ-HAT-01–05).
  - [x] **Wave 3**: Functional labeling (jazz cliché dictionary, Chord DNA + context → Roman numeral, constant-structure) (REQ-HAT-06–08).
  - [x] **Wave 4**: Pipeline API and JazzKiller overlay refactor (REQ-HAT-09–11).
  - [x] **Wave 5** (optional): Live Harmonic Grounding (Conflict Resolver, Pedal Point Detection, getLiveOverrides API) (REQ-HAT-12–14).

## Phase 22: Trio Hi-Fi Mixer (WASM Compressor & Parallel Processing)

*Focus: Make trio playback **consistent and hi-fi** via parallel (NY) mix, soft-knee WASM-style compressor, RMS-matching makeup gain, and "Air" band for drums.*

- **Success Criteria**: Parallel dry+wet bus; soft-knee compressor (Worklet) on wet path; "Mastering" / "Pro Mix" toggle does not change perceived volume; drums have +3 dB @ 12 kHz (ride "ping"); no regression in mute/solo/volume.
- **Milestone**: `.planning/milestones/trio-hifi-mixer/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Tasks**:
  - [ ] **Wave 1**: Bus architecture and parallel dry/wet sum (REQ-HIFI-01, REQ-HIFI-02).
  - [ ] **Wave 2**: WASM/Worklet soft-knee compressor; jazz trio params; trio connected to parallel mixer (REQ-HIFI-03–05).
  - [ ] **Wave 3**: RMS pre/post measurement; automatic makeup gain; "Mastering" / "Pro Mix" toggle (REQ-HIFI-06–08).
  - [ ] **Wave 4**: Drums Air band (+3 dB @ 12 kHz) (REQ-HIFI-09).

## Phase 22.1: The "Studio" Polish (Priority: High)

*Focus: When a user puts on headphones, the app must **sound like a mastered record, not a MIDI file**—what justifies $29/mo. Current status: 0% complete.*

- **Success Criteria**: Parallel compression bus (NY: DryBus + WetBus, 70/30, Worklet 8:1 fast attack); "Air" band +2 dB @ 12 kHz on Drum Bus; Master limiter -14 LUFS; Note Waterfall 60fps decoupled from audio ticks.
- **Milestone**: `.planning/milestones/studio-polish/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Tasks**:
  - [ ] **Parallel Compression Bus**: DryBus and WetBus; WetBus = heavy Worklet Compressor (8:1, fast attack); blend 70/30 (REQ-STUDIO-01, 02, 03).
  - [ ] **The "Air" Band**: High-shelf EQ +2 dB @ 12 kHz on Drum Bus (REQ-STUDIO-04).
  - [ ] **Auto-Leveling (LUFS)**: Limiter on Master Output for -14 LUFS (REQ-STUDIO-05).
  - [ ] **Visualizer Interpolation**: Note Waterfall 60fps independent of audio logic; decouple UI ticks from audio ticks (REQ-STUDIO-06).

## Phase 23: The "Glitch" Defense – Audio Glitches & Architecture (Priority: Critical)

*Focus: Guarantee **&lt;10 ms latency** even when Gemini Nano is thinking. Critical risk of audio dropouts on mobile. **Strict thread isolation**: Main / AudioWorklet / Worker A (analysis) / Worker B (AI).*

- **Success Criteria**: No dropouts when mic + playback + SwiftF0 + optional Gemini; worklet stays light; pitch inference in workers only; data flow and SAB ownership documented; thread audit pass (Main &lt;5 ms); zero garbage in Bass/Drum loops; offline resilience (last 5 Standards cached in IndexedDB).
- **Milestone**: `.planning/milestones/audio-glitches-architecture/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, RESEARCH.md).
- **Tasks**:
  - [ ] **Phase 1: Strict Isolation**: Verify worklet light (REQ-AG-01), pitch inference in Workers only (REQ-AG-02), document thread ownership (REQ-AG-06).
  - [ ] **Phase 2: Async AI**: Gemini Nano never blocks real-time path (REQ-AG-03, REQ-AG-04).
  - [ ] **Phase 3: Latency & Verification**: &lt;10 ms budget (REQ-AG-05); no glitches under combined load (REQ-AG-07).
  - [ ] **Phase 4: Strict Thread Audit**: Chrome Performance Monitor; fail if SwiftF0 on Main &gt;5 ms; SwiftF0 = Worker A, Gemini = Worker B (REQ-AG-08).
  - [ ] **Phase 5: GC Hunt & Offline**: Zero garbage in Bass/Drum audio loops (REQ-AG-09); cache last 5 Standards (JSON + Audio) in IndexedDB; test in Airplane Mode (REQ-AG-10).

## Phase 24: Wave II - The Band (Generative Rhythm Section) 🚀

*Focus: Replace static backing with high-fidelity, generative Bass and Drum engines using WASM/Worklet processing and "Bebop-Native" algorithms.*

- **Success Criteria**: Generative Drum engine (Jack DeJohnette style) and Bebop Bass engine (Barry Harris style) fully integrated; Zero-latency execution in dedicated workers; Dynamic interaction between instruments.
- **Milestone**: `.planning/milestones/the-band/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Tasks**:
  - [ ] **Wave 1: Jack DeJohnette Drum Engine**: Limb independence, micro-timing, and dynamic density.
  - [ ] **Wave 2: Barry Harris Bass Engine**: Targeted approaches, enclosures, and bebop logic.
  - [ ] **Wave 3: Instrument Interaction**: Band members "listen" to each other and adapt density.

## Phase 25: Wave III - The Brain (Advanced AI Interaction) 🧠

*Focus: Connect the high-speed audio pipeline to the AI pedagogical layer. Implement the JSON-to-Critique pipeline using Gemini Nano/local LLMs for deep performance synthesis.*

- **Success Criteria**: AI provides context-aware critiques based on `PerformanceSegment` data; Asynchronous AI feedback loop (no main thread blocking); Actionable practice recommendations generated after sessions.
- **Milestone**: `.planning/milestones/ai-brain/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).
- **Tasks**:
  - [x] **Wave 1: Performance Synthesis Engine**: Implement the aggregator that turns raw pitch/time data into `PerformanceSegment` JSON.
  - [x] **Wave 2: Local AI Pedagogical Layer**: Implement prompt templates for Gemini Nano that consume performance data and output structured critique.
  - [x] **Wave 3: Interactive Teacher UI**: Create the "Post-Session Review" dashboard where AI feedback is visualized alongside the performance heatmap.

## Phase 26: Wave III - Long-term Progression (Mastery Tree) ✅

*Focus: Implement the persistent storage for performance segments and the visual Mastery Tree. Connect individual practice sessions to a long-term progress map.*

- **Success Criteria**: Performance sessions are persisted locally (IndexedDB/LocalStorage); Mastery Tree visualized with XP progress; Skills (Roots, Guide Tones, Arpeggios) unlock based on performance data.
- **Milestone**: `.planning/milestones/mastery-tree/`
- **Tasks**:
  - [x] **Wave 1: Session Persistence**: Implement a repository or service to store `PerformanceSegment` objects for historical analysis.
  - [x] **Wave 2: Mastery Progress Logic**: Implement the XP calculation and node unlock logic based on REQ-MT-04.
  - [x] **Wave 3: Progress Map UI**: Create the visual Mastery Tree (Force-directed or Tree layout) to show the user's journey.

## Phase 27: Wave III - Performance Trends & AI Transcriptions 📈

*Focus: Leverage persistent session history to visualize growth and refine solo captures into licks.*

- **Success Criteria**: Line charts showing accuracy trends over 50 sessions; AI Trend Analysis (Gemini Nano) identifying growth patterns; Solo transcriptions persisted and "musicalized" into lick format.
- **Tasks**:
  - [x] **Wave 1: Progress Analytics**: SVG-based trend charts for Accuracy and Consistency.
  - [x] **Wave 2: AI Trend Insights**: Gemini Nano analysis comparing the last 5 sessions of a standard.
  - [x] **Wave 3: Transcription Musicalization**: Persist raw solo recordings and use AI to clean/quantize them into high-quality licks.

## Phase 28: Performance Hub - Classroom & Communities ✅

*Focus: Collaborative pedagogy—connecting students to the Lick Hub and teachers to student analytics.*

- **Success Criteria**: Cloud sync for performance history and solos active via Supabase; Lick Hub allows sharing/auditioning musicalizations; Teacher Dashboard provides visual roster of student mastery trees and trends.
- **Tasks**:
  - [x] **Wave 1: Data Sync Logic**: Implement `itmSyncService` to bridge local stores with Supabase.
  - [x] **Wave 2: The Lick Hub**: Community feed for browsing, auditioning, and "stealing" community-refined licks.
  - [x] **Wave 3: Teacher Dashboard**: Roster-based interface for educators to monitor student XP and analysis.

## Strategic Re-Phasing (2026 Expansion)

Based on the 2026 Architecture Critique, the remaining work is regrouped into the following strategic waves:

### Wave I: The Loop (Latency & Accuracy)

#### Pillars: 1, 6, 11

- **Focus**: A user plays; System detects pitch/time; System renders score. High-speed SwiftF0.

### Wave II: The Band (Generative Rhythm Section)

#### Pillars: 5, 10, 15

- **Focus**: Generative Bass/Drums with high-fidelity WASM processing. Replace static backing.

### Wave III: The Brain (AI Pedagogy)

#### Pillars: 1, 14, 12

- **Focus**: Connect Gemini Nano via JSON-to-Critique pipeline. Context-aware harmonic analysis.

### Wave IV: The Game (Progression)

#### Pillars: 2, 4

- **Focus**: Mastery Tree UI, Supabase backend, and progress tracking.

### Wave V: Polish (Finesse)

#### Pillars: 3, 7, 8

- **Focus**: High-fidelity stems, Sing & Clap interaction, Micro-timing exercises.
