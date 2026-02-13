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

- **Requirement**: Implement a WASM-based neural pitch detector (**SwiftF0**) in an Audio Worklet or background worker.
- **Performance**: Use `SharedArrayBuffer` for zero-latency communication with the React UI (PitchMemory + processorOptions.sab; public/worklets/pitch-processor.js).
- **Input Quality**: Enable `voiceIsolation` constraints on microphone streams to filter out practice room noise.
- **Status**: MPM in Worklet + SAB; **SwiftF0 integration verified as viable (SOTA 2026)**; architecture ready for neural swap. COOP/COEP in Vite server/preview.

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

- **Requirement**: Director varies timbre and instrument (e.g. Piano -> Cello -> Synth) via the app's audio system (internal patches) so learning is not context-dependent on a single sound.

## Phase 6: Polish, Analytics & Launch

### REQ-PL-01: Performance & Bundle

- **Requirement**: Meet Core Web Vitals (LCP, FID/INP, CLS) and keep critical path lean; audit and fix regressions.

### REQ-PL-02: Analytics & Events

- **Requirement**: Instrument key user actions (practice start/end, song unlock, lick publish, teacher dashboard views) for product and growth decisions.

### REQ-PL-03: Onboarding & First-Run

- **Requirement**: First-time users get a short guided flow (e.g. instrument choice, try one song or lick) to reach “first value” quickly.

### REQ-PL-04: Launch Readiness

- **Requirement**: Error boundaries, clear offline/error messaging, and minimal deploy/support runbook.

## Phase 7: Advanced Piano Engine

### REQ-APE-01: Voice-Leading Engine

- **Requirement**: Implement a stateful engine that selects the best voicing (Type A or B) based on the previous chord to minimize movement.
- **Metric**: Use "Taxi Cab" distance (Manhattan distance) to score candidates.

### REQ-APE-02: Chord DNA Model

- **Requirement**: Expand chord parsing to identify "Guide Tones" (3rd, 7th) and extensions/alterations (9, 13, b9, #9, b13) suitable for rootless jazz voicings.

### REQ-APE-03: Register Management (Soprano Anchor)

- **Requirement**: Implement a penalty system for voicings exceeding a defined top range (e.g., G5) to prevent octaves from drifting upwards during transitions.

### REQ-APE-04: Tritone Substitution

- **Requirement**: Allow the engine to optionally substitute a dominant chord with its tritone substitute if it results in significantly smoother voice leading or desired tension.

## Phase 8: Advanced Rhythm Engine

### REQ-ARE-01: BPM-Aware Pattern Selection

- **Requirement**: Implement a selection logic that favors specific rhythmic patterns based on BPM zones (Slow < 110, Medium 110-190, Fast > 190).
- **Patterns**: Include Charleston, RedGarland, Pedal (Sustain), Anticipation (Push), and SparseStab.

### REQ-ARE-02: Dynamic Articulation Control

- **Requirement**: Automatically adjust note duration based on BPM (e.g., 16n staccato at > 180 BPM, 4n legato at < 120 BPM).
- **Goal**: Maintain clarity and prevent muddiness at high tempos.

### REQ-ARE-03: Energy-Driven Rhythmic Bias

- **Requirement**: Use the "Energy" or "Tension" parameter to bias rhythmic density (e.g., high energy boosts Anticipation and RedGarland).

### REQ-ARE-04: Implementation Architecture

- **Requirement**: Create a standalone `RhythmEngine` class to encapsulate pattern definitions, probability weights, and articulation logic.

## Phase 9: Mic Algorithm Upgrade (Stabilization & CREPE-Ready)

### REQ-MA-01: Pitch Stabilization (Confidence + Median + Hysteresis)

- **Requirement**: Apply state-space post-processing to raw pitch: (1) confidence gate—if confidence < 0.85, hold last stable pitch; (2) running median over 5 frames to reject outliers and octave spikes; (3) hysteresis—update reported pitch only if change exceeds 20 cents to prevent vibrato/flicker.
- **Location**: CrepeStabilizer (TS for tests) and inline equivalent in Audio Worklet (pitch-processor.js) so SAB receives stabilized values.

### REQ-MA-02: Worklet Writes Stabilized Pitch

- **Requirement**: The Audio Worklet writes stabilized frequency and confidence to SharedArrayBuffer; all consumers (usePitchTracker, useITMPitchStore) read smooth values with zero main-thread pitch math.

### REQ-MA-03: Frequency-to-Note and Perfect Intonation

- **Requirement**: Map stabilized frequency to note name (Tonal.js) and cents deviation from equal temperament. If |centsDeviation| <= 10, expose "perfect intonation" for UI (e.g. green indicator).

### REQ-MA-04: Jazz Instrument Presets

- **Requirement**: Optional frequency clamping per instrument (Double Bass 30-400 Hz, Trumpet 160-1100, Sax 100-900, Guitar 80-1000, Voice 80-1200) to reject impossible values and room noise.

### REQ-MA-05: Optional Center-of-Gravity and Viterbi

- **Requirement**: (Enhancement) In detector, use weighted argmax (sum(prob_i * freq_i) / sum(prob_i)) to reduce octave jumps. Document Viterbi decoding over CREPE activation matrix as future enhancement when CREPE-WASM is integrated.

## Phase 9.1: SwiftF0 SOTA Precision (Flicker-Free, Semitone-Stable)

*Milestone: `.planning/milestones/swiftf0-precision/`. Full requirements in milestone REQUIREMENTS.md.*

### REQ-SF0-P01: Local Expected Value (No Argmax-Only Pitch)

- **Requirement**: Final pitch must not be raw argmax bin. Use 9-bin window centered on peak: weighted average in log-frequency space: \(f_{final} = 2^{\sum p'_i \cdot \log_2(f_i)}\). Sub-bin (cent-level) accuracy.
- **Location**: swiftF0Inference.classificationToPitch; verify formula and no argmax-only path.

### REQ-SF0-P02: Median Filter (5–7 Frames)

- **Requirement**: Running median over last 5–7 frequency estimates (after LEV). Remove single-frame spikes and octave jumps.
- **Location**: CrepeStabilizer; windowSize per profile (5 or 7).

### REQ-SF0-P03: Hysteresis (Note Lock)

- **Requirement**: Change note label only if new frequency >60 cents away and stable for ≥3 consecutive frames (~48 ms).
- **Location**: CrepeStabilizer; instrumentProfiles hysteresisCents and stabilityThreshold.

### REQ-SF0-P04: Chromatic Note and Cents

- **Requirement**: Map frequency to chromatic note: n = 12·log2(f/440)+69; note = round(n); cents = (n−round(n))×100.
- **Location**: frequencyToNote; all pitch-to-note display paths.

### REQ-SF0-P05: Tuner Bar (Cents Display)

- **Requirement**: Where pitch is shown, expose tuner bar (or equivalent) showing cents offset so variation reads as vibrato.
- **Location**: At least one pitch-consuming UI (ITM, JazzKiller, Innovative Exercises, or shared tuner component).

### REQ-SF0-P06: Post-Inference in Worker

- **Requirement**: LEV, median, and hysteresis run post-inference in SwiftF0Worker; SAB receives stabilized pitch.
- **Location**: SwiftF0Worker + CrepeStabilizer.

## Phase 10: State-Machine Rhythmic Phrasing

### REQ-SMR-01: Repetition Penalty System

- **Requirement**: Implement a stateful tracking of the previous pattern to penalize immediate repetition (0.2x weight multiplier).
- **Goal**: Force the engine to "phrase" by exploring different rhythmic options consecutively.

### REQ-SMR-02: Pattern-Specific Resilience

- **Requirement**: Allow "Pedal" (sustained) patterns to repeat with a lighter penalty (0.8x) to simulate common jazz "pads" or breathing moments.

### REQ-SMR-03: Stateful Weighted Selection

- **Requirement**: The selection logic must combine BPM zones, energy bias, and the repetition penalty into a single probability matrix per measure.

## Phase 11: Pro Comping Engine (Templates & Grips)

### REQ-PRO-01: Grip Dictionary Harmony

- **Requirement**: Replace mathematical voicing generation with a pre-curated "Grip Dictionary" (offsets relative to Root).
- **Categories**: Major7, Minor7, Dominant7, Altered Dominant, Half-Diminished.
- **Forms**: Support "A Form" and "B Form" for each chord type.

### REQ-PRO-02: Phrase Template Rhythm

- **Requirement**: Replace 1-bar random hits with 2-bar "Phrase Templates" (Standard, Sustain, Driving).
- **Goal**: Create consistent grooves that repeat and resolve like a real musician.

### REQ-PRO-03: Rhythmic Anticipation (The "Push")

- **Requirement**: Implement "And of 4" anticipation. The engine must peek at the next chord and play its voicing early if the template calls for an anticipation hit.

### REQ-PRO-04: Bass-Assist Integration

- **Requirement**: If the "Bass" track is muted, the piano engine must automatically prepend the Root note (transposed down) to its voicings to maintain harmonic clarity.

### REQ-PRO-05: Pivot Rule Normalization

- **Requirement**: Switch between A/B voicing forms based on proximity to a "Range Center" (Middle C) or the previous voicing to prevent erratic jumping.

## Phase 12: Walking Bass Engine (Target & Approach)

### REQ-WB-01: 4-Beat Strategy (Anchor, Direction, Pivot, Approach)

- **Requirement**: Generate a 4-note walking line per bar: Beat 1 = anchor (root/nearest chord tone); Beat 4 = approach note to next chord’s root (chromatic or dominant); Beats 2-3 = bridge notes (chord tones or scale steps between Beat 1 and Beat 4).
- **Goal**: "Pro" feel via Beat 4 leading into the next bar (chromatic upper/lower or 5th-of-destination).

### REQ-WB-02: WalkingBassEngine Class

- **Requirement**: Standalone engine using tonal.js (Chord, Note) with `generateWalkingLine(currentChordSymbol, nextChordSymbol)` returning `number[]` (4 MIDI notes), stateful `lastNoteMidi` for continuity.
- **Constraints**: E1 (28)-G3 (55) range; constrain notes that fall outside.

### REQ-WB-03: Band Integration

- **Requirement**: JazzKiller band (useJazzBand) uses the engine per bar: at beat 0 generate full line, cache, and play `line[beat]` for beats 0-3; last note of line updates state for next bar.

## Phase 13: Standards-Based Exercises (Scales, Guide Tones, Arpeggios)

*New **module inside JazzKiller** that delivers timed exercises over the standards: play scales, guide tones, or arpeggios in sync with playback and the chart. Uses existing mic detection and works for both mic and MIDI input.*

### REQ-SBE-01: Scale Exercise Mode

- **Requirement**: Exercise mode where the student plays the **appropriate scale** for the current chord in time with JazzKiller playback and the lead-sheet chart.
- **Behavior**: Per measure (or per chord), the app knows the current chord from the standard; `ChordScaleEngine` (or equivalent) provides the correct scale; student input (mic or MIDI) is evaluated against that scale in real time.
- **Sync**: Use existing `currentMeasureIndexSignal` / `currentBeatSignal` and chart so the “target scale” updates with the progression.

### REQ-SBE-02: Guide-Tone Exercise Mode

- **Requirement**: Exercise mode where the student plays the **correct guide tones** (3rd and 7th) for each chord in time with the standard.
- **Behavior**: Per chord, use existing `GuideToneCalculator` (or AiContextService guide tones) as the target set; real-time scoring for hitting 3rd/7th on downbeats (or designated beats).
- **Integration**: Reuse REQ-FB-02 “Target Note mastery” logic where applicable; extend to full chart so guide tones are chart-driven.

### REQ-SBE-03: Arpeggio Exercise Mode

- **Requirement**: Exercise mode where the student plays the **correct arpeggio** (chord tones) for each chord in time with the standard.
- **Behavior**: Chord tones per chord from existing theory (e.g. Tonal.js `Chord.notes` or AiContextService `chordTones`); evaluate student input against these notes in real time, in sync with playback and chart.

### REQ-SBE-04: Unified Input (Mic + MIDI)

- **Requirement**: All three exercise modes (scales, guide tones, arpeggios) must work with **both microphone input** and **MIDI input**.
- **Behavior**: Single “exercise engine” that consumes either (1) pitch/MIDI from the existing mic pipeline (useITMPitchStore / pitch detection) or (2) MIDI from a connected device; same scoring and target logic for both.

### REQ-SBE-05: Exercise UI and Feedback (JazzKiller module)

- **Requirement**: **Inside JazzKiller**, a dedicated Exercises view/panel/tab where the user selects exercise type (Scales / Guide Tones / Arpeggios), picks a standard from the same JazzKiller library, starts playback (same band/chart), and sees real-time feedback (correct/incorrect, accuracy, target notes).
- **Scope**: This is part of JazzKiller, not a separate app or top-level route—same standard picker, same lead sheet, same playback; exercises run over the selected standard.
- **Optional**: Persist scores or integrate with Director/FSRS for “what to practice next.”

## Phase 15: Standards Exercises — Error Heatmaps, Transcription & AI Analysis

*Extends Phase 13. When the user plays over a standard (mic or MIDI) in Scales / Guide Tones / Arpeggios mode, provide error heatmaps, optional written transcription of the solo, and AI analysis with advice and development suggestions.*

### REQ-SBE-06: Error Heatmaps for Standards Exercises (Scales • Guide Tones • Arpeggios)

- **Requirement**: Per-measure (and optionally per-chord) visualization of hit/miss for Standards Exercises.
- **Behavior**: For each exercise type (Scales, Guide Tones, Arpeggios), record hits and misses by measure (and optionally by chord) during a session; expose this data for visualization.
- **UI**: Option to show an **error heatmap** on the lead sheet (e.g. overlay per measure: green/amber/red by accuracy) or in a dedicated panel (e.g. bar chart or grid over measures). User can view heatmap by exercise type (Scales vs Guide Tones vs Arpeggios).
- **Data**: Reuse or extend `statsByMeasure` (hits/misses per measure) from `useStandardsExercise`; optionally persist per standard + exercise type for historical comparison.

### REQ-SBE-07: Record Written Transcription of Solo

- **Requirement**: When the user is playing over a standard (mic or MIDI), offer an option to **record** the performance and produce a **written transcription** of the solo.
- **Behavior**: In Standards Exercises (or a dedicated "Solo over standard" mode), user can start "Record solo"; the app captures timestamped notes (pitch + onset/offset or rhythm) from the same input pipeline (mic via pitch detection or MIDI). At end of recording (or on demand), produce a written transcription: note list (e.g. "C4, E4, G4...") and/or notation (e.g. ABC, MusicXML, or internal note+rhythm format for display).
- **Scope**: Works for both mic and MIDI input; transcription is tied to the current standard and transport (measure/beat) so it can be aligned with the chart for display or export.

### REQ-SBE-08: AI Analysis of Performance with Advice and Development Suggestions

- **Requirement**: After a Standards Exercise session (or on demand), provide **AI analysis** of the performance with **advice** and **further development suggestions**.
- **Input**: Performance data: error heatmap (per measure, per exercise type), optional written transcription, accuracy (overall and per section), exercise type (Scales / Guide Tones / Arpeggios), standard name, key.
- **Output**: AI-generated text (Gemini Nano or API): summary of strengths/weaknesses, specific advice (e.g. "Work on guide tones in the bridge"), and development suggestions (e.g. "Next: practice this tune in 3 keys" or "Focus on arpeggios in bars 17–24").
- **Integration**: Reuse `generatePerformanceCritique`-style flow (jazzTeacherLogic); extend or add a dedicated `generateStandardsExerciseAnalysis(sessionData)` that accepts exercise heatmap, transcription snippet, and exercise type and returns pedagogical feedback.

## Phase 16: Voice & Percussion Interactive Training

### REQ-VP-01: Voice-to-Answer in Functional Ear Training

- **Requirement**: Implement "Sing-to-Answer" mode for Melody Steps and Intervals levels.
- **Behavior**: Use real-time pitch detection to validate the user's vocal input against the expected pitch (activeTarget). Support arpeggio sequences in Smart Lesson.

### REQ-VP-02: Clap-to-Perform in Rhythm Architect

- **Requirement**: Use onset detection from the microphone to allow users to "perform" rhythms by clapping.
- **Behavior**: Grade accuracy of claps against the target subdivision in the "RhythmArena" (4-hit streak for success).

### REQ-VP-03: Shared Interaction Model (Mic vs Mouse)

- **Requirement**: Unified state for switching between microphone interaction and traditional mouse/MIDI interaction.
- **Behavior**: Seamless transition and status persistence across different modules (Ear Training, Rhythm, Chord Lab).

### REQ-VP-04: Deep Visual Feedback (Temporal Accuracy)

- **Requirement**: Provide millisecond-accurate visual feedback for claps to help users refine their timing.
- **Behavior**: "Temporal Accuracy" tape in Rhythm Architect showing early/late hits relative to the metronome.

## Phase 17: Innovative Interactive Exercises (Ear + Rhythm)

*New **module** of innovative exercises: pitch-centric ear (Ghost Note, Intonation Heatmap, Voice-Leading Maze) and micro-timing rhythm (Swing Pocket, Call and Response, Ghost Rhythm). Full requirements in `.planning/milestones/innovative-exercises/REQUIREMENTS.md`.*

### REQ-IE-01: Ghost Note Match

- **Requirement**: App plays a jazz lick with one note as “ghost” (noise/thump). Student plays the missing note. If within **10 cents**, ghost is replaced by high-fidelity pro sample -> “perfect” collaborative lick. Teaches harmonic anticipation.
- **Tech**: Pitch detection (SwiftF0/MPM) + Tonal.js; `frequencyToNote` +/-10c; target from lick metadata.

### REQ-IE-02: Intonation Heatmap (Tonal Gravity)

- **Requirement**: Drone (e.g. C) + scale (e.g. C Major). Student plays each degree. Map tonal gravity (e.g. Major 3rd “bright,” minor 7th “dark”). UI heatmap: **Green** = ET, **Blue** = Just, **Red** = out of tune.
- **Tech**: Sub-cent pitch (`frequencyToNote`, cents); heatmap per scale degree.

### REQ-IE-03: Voice-Leading Maze

- **Requirement**: ii-V-I progression. Student plays only **guide tones** (3rds and 7ths). If student plays a non-guide-tone, **backing track mutes** until they play a correct connective note.
- **Tech**: `GuideToneCalculator` (or equivalent); compare mic/MIDI to allowed 3rds/7ths; playback mute.

### REQ-IR-01: Swing Pocket Validator

- **Requirement**: Metronome 2 and 4; student plays 8th-note pattern. Analyze **swing ratio** (2:1 vs 3:1). UI “Pocket Gauge.” Challenge: “Push” or “Lay Back”; report micro-offset in ms.
- **Tech**: Millisecond time-stamping of onsets; swing ratio and offset; Pocket Gauge UI.

### REQ-IR-02: Call and Response Rhythmic Mimicry

- **Requirement**: Pro drummer 2-bar break; student scats/plays rhythm back. **RMS envelopes** match attack; overlay student waveform on pro; show where “and of 4” (etc.) is late/early.
- **Tech**: Onset + RMS from mic; align to reference; waveform overlay UI.

### REQ-IR-03: Ghost Rhythm Poly-Meter

- **Requirement**: 4/4 backing; student plays 3/4 cross-rhythm on one note (e.g. G). Track **pitch stability**. **Win**: pitch within **5 cents** + successful 3-against-4.
- **Tech**: Pitch pipeline for stability; 3 vs 4 grid; scoring = rhythm accuracy + 5c stability.

## Phase 18: Creative Jazz Trio Playback Modelling

*New **milestone** to push the limits of modelling jazz trio playing: band adapts to **place in the cycle**, **song type**, **inter-instrument interaction**, and **space for the soloist** (especially in ballads). Full requirements in `.planning/milestones/jazz-trio-playback/REQUIREMENTS.md`.*

### REQ-TRIO-01: Place-in-Cycle Resolver

- **Requirement**: Resolver that maps (loopCount, playback plan index, section labels) -> role: `intro` | `head` | `solo` | `out head` | `ending`. Band density and style are influenced by this role.
- **Integration**: useJazzBand (or shared playback state); expose via signal or ref at beat 0.

### REQ-TRIO-02: Song-Style Tag

- **Requirement**: Derive style tag from song metadata (Rhythm, CompStyle, Tempo): `Ballad` | `Medium Swing` | `Up-tempo` | `Latin` | `Bossa` | `Waltz`. Default `Medium Swing` when unknown.
- **Integration**: Style tag available in useJazzBand loop so RhythmEngine, DrumEngine, and bass logic can read it.

### REQ-TRIO-03: Style-Driven Comping (RhythmEngine)

- **Requirement**: RhythmEngine (or ReactiveCompingEngine) selects pattern density and character based on style tag and place-in-cycle (e.g. Ballad -> sustain/sparse; Latin/Bossa -> appropriate pattern set; Waltz -> 3-beat).

### REQ-TRIO-04: Style-Driven Bass

- **Requirement**: Bass feel and variation probability depend on style tag and place-in-cycle (Ballad -> half-time/pedal, low variation; Latin/Bossa -> two-feel or bossa; Waltz -> 3-note bar).

### REQ-TRIO-05: Style-Driven Drums

- **Requirement**: DrumEngine selects density and character (ride vs brushes, groove) based on style tag and place-in-cycle (Ballad -> brushes/light; Latin/Bossa -> groove; Waltz -> 3/4 feel).

### REQ-TRIO-06: Soloist-Space Policy

- **Requirement**: When place-in-cycle is `solo` and/or style is `Ballad`, apply “soloist space”: cap comping density, bias sustain, reduce bass variation, optional half-time/pedal bass.
- **Goal**: In ballads and solo sections, band leaves clear space for the soloist.

### REQ-TRIO-07: Cross-Instrument Interaction

- **Requirement**: Coherent reaction: piano density -> drums simplify; place “solo” -> all reduce density; place “out head”/“last chorus” + high activity -> band can build.
- **Goal**: Trio feels like a single unit responding to form and energy.

### REQ-TRIO-08: Band Loop Integration

- **Requirement**: useJazzBand computes place-in-cycle and style tag once per bar and passes them into RhythmEngine, DrumEngine, WalkingBassEngine, BassRhythmVariator, and ReactiveCompingEngine; all engines use them in addition to activity/tension/BPM.

## Phase 19: Soloist-Responsive Playback (Call-and-Response)

*Experimental **milestone**: playback listens to the soloist via SwiftF0 and adjusts—more space when user plays more/faster, more backing when user plays less. Full requirements in `.planning/milestones/soloist-responsive-playback/REQUIREMENTS.md`.*

### REQ-SRP-01..08: Soloist-Responsive Toggle, Activity from SwiftF0, Band Integration, UI

- **Summary**: Toggle (default off); soloist activity (0-1) from useITMPitchStore / useHighPerformancePitch; useJazzBand reads soloist activity when on and drives effective activity/density; comping, drums, bass leave more space when soloist plays more; toggle UI; no regression when off.

## Phase 23: Audio Glitches & Architecture (Critical Feasibility)

### REQ-AG-01: Worklet Lightness Verification

- **Requirement**: AudioWorklet must be limited to DSP and clock scheduling. No heavy pitch math or non-linear state management.
- **Metric**: CPU usage for Worklet should remain <5% of total.

### REQ-AG-02: Strict Thread Isolation

- **Requirement**: Move all SwiftF0 inference and MPM math to **Dedicated Workers** (Worker A). Use `SharedArrayBuffer` for zero-copy result sharing with the Worklet and Main thread.
- **Goal**: Prevent Audio Thread contention and UI jank.

### REQ-AG-03: Asynchronous AI Feedback (The JSON Pipe)

- **Requirement**: Use a asynchronous "Post-Phrase" analysis pattern for Gemini Nano.
- **Data Flow**: Audio Engine -> Feature Extraction -> `PerformanceSegment` JSON -> Worker B (AI) -> UI Critique.
- **Constraint**: The AI must NOT block the audio or UI thread.

### REQ-AG-04: Main Thread Guarantees

- **Requirement**: React/Zustand logic must be optimized to avoid long tasks (>50ms) that could indirectly impact worker scheduling or message passing.

### REQ-AG-05: Latency Budget Monitoring

- **Requirement**: Implement real-time monitoring of the total "Feedback Loop" latency.
- **Target**: <10ms from onset to UI update.

### REQ-AG-06: Thread Ownership Documentation

- **Requirement**: Maintain a clear map of which thread owns which SharedArrayBuffer and state slice to avoid race conditions.

### REQ-AG-07: Stress Testing

- **Requirement**: High-load test pass: Mic + Playback + SwiftF0 + AI + Mixer + Worklets simultaneously. Zero dropouts expected on target devices (Mac/iPad).

## Pillar 2 & 6: Feedback Loop & Mastery Tree Expansion

### REQ-MT-04: Mastery Tree Node Structure

- **Requirement**: Implement a concrete data schema for tree nodes.
- **Schema**:
  - **Root**: Instrument (e.g., Saxophone).
  - **Trunk**: Core Theory (Intervals -> Triads -> 7th Chords).
  - **Branches**: Standards (e.g., "Autumn Leaves").
  - **Leaves**: Skills (Level 1: Roots, Level 2: Guide Tones, Level 3: Arpeggios, Level 4: Solo).
- **Unlock Logic**: Branch Y requires Trunk Skill X and previous Branch Z Mastery.

### REQ-FB-06: Performance Capture Object

- **Requirement**: Define `PerformanceSegment` TypeScript interface for efficient AI consumption.
- **Fields**: `standardId`, `segmentType`, `bpm`, `key`, `measures` (array of `playedNotes` with `cents` and `timingOffsetMs`).

### REQ-FB-07: Gemini Nano Prompt Protocol

- **Requirement**: AI receives JSON summary (PerformanceSegment) instead of raw audio.
- **Output**: JSON containing `diagnosis`, `actionable_feedback`, and `recommended_exercise`.

### REQ-SL-04: Audio Engine Topology

- **Requirement**: Strict signal path separation.
- **Bus A (Backing)**: Stems + Generative Engines -> WASM Compressor -> Master.
- **Bus B (User)**: Mic Input -> SwiftF0 Worklet (Muted monitored).
- **Reactive Comping**: Adjusted by previous bar's soloist density (Rolling Window).

---

## Technical Priorities

1. **Critical**: Phase 23 - Audio Glitches & Architecture (Foundational Stability).
2. **High**: Pitch-to-Theory Sync (Turns app from book into teacher).
3. **Medium**: Gemini Nano Hint Loop (Ear training "AHA!" moments).
4. **Medium**: Cloudflare R2 Audio Hosting (Fast stem loading).
5. **Low**: Visual Geometry (p5.js aesthetics).
