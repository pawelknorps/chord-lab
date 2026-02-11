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

## Technical Priorities
1. **High**: Pitch-to-Theory Sync (Turns app from book into teacher).
2. **Medium**: Gemini Nano Hint Loop (Ear training "AHA!" moments).
3. **Medium**: Cloudflare R2 Audio Hosting (Fast stem loading).
4. **Low**: Visual Geometry (p5.js aesthetics).
