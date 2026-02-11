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

- **Requirement**: Map stabilized frequency to note name (Tonal.js) and cents deviation from equal temperament. If |centsDeviation| ≤ 10, expose "perfect intonation" for UI (e.g. green indicator).

### REQ-MA-04: Jazz Instrument Presets

- **Requirement**: Optional frequency clamping per instrument (Double Bass 30–400 Hz, Trumpet 160–1100, Sax 100–900, Guitar 80–1000, Voice 80–1200) to reject impossible values and room noise.

### REQ-MA-05: Optional Center-of-Gravity and Viterbi

- **Requirement**: (Enhancement) In detector, use weighted argmax (sum(prob_i * freq_i) / sum(prob_i)) to reduce octave jumps. Document Viterbi decoding over CREPE activation matrix as future enhancement when CREPE-WASM is integrated.

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

- **Requirement**: Generate a 4-note walking line per bar: Beat 1 = anchor (root/nearest chord tone); Beat 4 = approach note to next chord’s root (chromatic or dominant); Beats 2–3 = bridge notes (chord tones or scale steps between Beat 1 and Beat 4).
- **Goal**: "Pro" feel via Beat 4 leading into the next bar (chromatic upper/lower or 5th-of-destination).

### REQ-WB-02: WalkingBassEngine Class

- **Requirement**: Standalone engine using tonal.js (Chord, Note) with `generateWalkingLine(currentChordSymbol, nextChordSymbol)` returning `number[]` (4 MIDI notes), stateful `lastNoteMidi` for continuity.
- **Constraints**: E1 (28)–G3 (55) range; constrain notes that fall outside.

### REQ-WB-03: Band Integration

- **Requirement**: JazzKiller band (useJazzBand) uses the engine per bar: at beat 0 generate full line, cache, and play `line[beat]` for beats 0–3; last note of line updates state for next bar.

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

## Technical Priorities
1. **High**: Pitch-to-Theory Sync (Turns app from book into teacher).
2. **Medium**: Gemini Nano Hint Loop (Ear training "AHA!" moments).
3. **Medium**: Cloudflare R2 Audio Hosting (Fast stem loading).
4. **Low**: Visual Geometry (p5.js aesthetics).
