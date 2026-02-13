# Phase 17: Innovative Interactive Exercises – Research

## What Do I Need to Know to Plan This Phase Well?

### 1. Pitch Pipeline (Existing)

- **useITMPitchStore** / **useHighPerformancePitch**: Consume pitch from Audio Worklet (MPM) or SwiftF0Worker; stabilized frequency + confidence written to SharedArrayBuffer.
- **frequencyToNote** (`src/core/audio/frequencyToNote.ts`): `frequencyToNote(frequency) → { noteName, pitchClass, octave, centsDeviation, isPerfectIntonation }`. **Perfect intonation** = |centsDeviation| ≤ 10.
- **CrepeStabilizer**: Confidence gate (e.g. < 0.85 hold last), running median, hysteresis (update only if |centDiff| > 20). Used in worklet and for tests.
- **GuideToneCalculator** (`src/core/theory/GuideToneCalculator.ts`): `GuideToneCalculator.calculate(chordSymbol) → { third, seventh, ... }` (note names, MIDI). Used by Standards Exercises and can be reused for Voice-Leading Maze.

**Implication**: Ghost Note (10¢), Intonation Heatmap (cents per degree), Voice-Leading Maze (guide tones), and Ghost Rhythm (5¢ stability) all use this pipeline. No new pitch detector needed; ensure exercises subscribe to same store/hook.

---

### 2. Intonation Heatmap: ET vs Just vs “Out of Tune”

- **Equal Temperament (ET)**: 12-TET; each semitone = 100 cents. `frequencyToNote` already reports cents deviation from ET; **green** = |cents| ≤ ~10 (or configurable, e.g. 15).
- **Just Intonation (JI)**: Pure ratios (e.g. major 3rd ~14 cents flat of ET, minor 7th ~31 cents flat in some contexts). Jazz “expressive intonation” often has major 3rd slightly **bright** (sharp of ET) and minor 7th **dark** (flat). For heatmap:
  - **Blue (“Just/sweet”)**: Define bands per scale degree (e.g. major 3rd: −20 to +5 cents; minor 7th: −40 to −10 cents). Thresholds are pedagogical choices; can start with simple bands and tune later.
  - **Red (“Out of tune”)**: |cents| > threshold (e.g. > 25 or > 30) or wrong pitch class.
- **Scale degree mapping**: Tonal.js `Scale.get('C major').notes` → scale degrees 1–7; map played note (pitchClass) to degree; store cents for that degree for heatmap.

**Implication**: Heatmap logic: (1) map played note to scale degree; (2) store cents deviation; (3) classify ET / JI band / out-of-tune per degree; (4) render green/blue/red. Start with ET vs out-of-tune (red if |cents| > 25); add “blue” JI bands in a follow-up if needed.

---

### 3. Swing Ratio and Pocket (Micro-Timing)

- **Swing ratio**: In 8th-note swing, the first 8th is longer than the second. Common models:
  - **2:1 (triplet swing)**: First 8th = 2/3 of beat, second = 1/3 → ratio 2:1.
  - **3:1 (hard swing)**: First 8th = 3/4 of beat, second = 1/4.
  - **Metric**: Ratio = (duration of first 8th) / (duration of second 8th). Compute from onset times: for each beat, take student’s two onsets (first 8th, second 8th); ratio = (onset2 − onset1) / (beat_end − onset2) or equivalent.
- **Pocket (push/lay back)**: Average offset of student onsets vs grid (e.g. metronome on 2 and 4). **Positive offset** = late (lay back); **negative** = early (push). Report in milliseconds (e.g. “15 ms ahead”).
- **High-resolution time**: Use `performance.now()` or Tone.Transport seconds for onset timestamps; align to BPM grid (beat boundaries). Existing Transport (Tone.js) and jazzSignals (currentBeatSignal, BPM) can provide grid.

**Implication**: Swing Pocket Validator needs: (1) onset detection from mic (or MIDI note-on); (2) timestamp each onset; (3) assign onsets to beats and 8th positions; (4) compute ratio and average offset; (5) Pocket Gauge UI. Onset: reuse or extend Rhythm Architect’s clap/onset logic (useClapValidation, or AnalyserNode + RMS/spectral flux in a small analyzer).

---

### 4. Onset and RMS (Rhythm Exercises)

- **Existing**: `useClapValidation.ts` (Rhythm Architect) compares onset timestamps to grid; likely uses amplitude or spectral flux for “clap” detection. `useMicSpectrum.ts` for spectrum. SwiftF0Worker / pitch-processor already have access to raw or downsampled PCM; RMS can be computed in worklet or in a separate AnalyserNode.
- **RMS envelope**: For “Call and Response,” need attack times of student’s performance. Options: (1) **AnalyserNode** (getByteTimeDomainData or getFloatTimeDomainData) + RMS in requestAnimationFrame; (2) **Worklet** that computes RMS per block and writes to a buffer; (3) **Onset detection** (threshold on RMS derivative or spectral flux) and output timestamps. Overlay: store reference break’s onset times and student’s onset times; align by bar start; render two timelines (pro vs student) or overlay waveforms.
- **Waveform overlay**: Draw two waveforms (or two sets of onset markers) in a canvas or SVG; time-aligned. Reference can be precomputed (fixed 2-bar break); student is real-time or recorded during “play it back.”

**Implication**: Call and Response: (1) define reference 2-bar break (audio + onset list or envelope); (2) record student input (mic); (3) run onset (or RMS peak) detection on student; (4) align student to reference (e.g. by first attack or bar start); (5) overlay UI. Ghost Rhythm: 3-over-4 grid = 3 equally spaced attacks per 4/4 bar (e.g. 0, 1.33, 2.67 in beat units); score student onsets against these; plus pitch stability from useITMPitchStore.

---

### 5. Playback Mute (Voice-Leading Maze)

- **JazzKiller / globalAudio**: Playback is driven by useJazzBand, Transport, and chart. To “mute backing track until correct note”: need a mute control that applies to the backing (e.g. master gain for drums/bass/piano, or per-stem mute). globalAudio or the mixer component likely has gain nodes or mute state; expose a “mute backing” flag that the Voice-Leading Maze exercise sets when student plays wrong note and clears when they play a guide tone.

**Implication**: Add or reuse a “backing muted” signal or store (e.g. useJazzBand or a small useVoiceLeadingMaze store); when true, set backing gain to 0 (or mute stems). Exercise logic: on each chord, GuideToneCalculator gives allowed 3rds/7ths; compare mic/MIDI note (pitch class); if match → unmute (or keep unmuted); if no match and student played a note → mute.

---

### 6. Ghost Note: Lick Format and Pro Sample Swap

- **Lick representation**: Curated lick = sequence of events: { pitch, duration, timeOffset, isGhost }. One event marked `isGhost: true`; others are normal notes. Playback: play normal notes (or use pre-rendered audio); at ghost slot, play “ghost” sound (noise or thump); when student plays and pitch is within 10¢ of ghost target, trigger “replacement” (high-fidelity pro sample for that note).
- **Pro samples**: Need one-shot samples per note (or per pitch class + octave). Could be same soundfont/sampler as rest of app, or dedicated “pro” sample set. Swap = at ghost time, instead of ghost sound, play the pro sample for the matched note (and optionally trim/crossfade to fit slot duration).

**Implication**: Lick format can be JSON (or in-code); one ghost slot; target pitch in metadata. Playback: simple scheduler (Tone.js or custom) or pre-baked audio with a “gap” for ghost; on match, play pro sample. UI: “Play the missing note”; show feedback (match → “Perfect! Here’s the full lick” with replacement).

---

### 7. Module Placement and Navigation

- **Option A**: New top-level route (e.g. `/innovative-exercises`) with sub-routes or tabs for each of the six exercises.
- **Option B**: Under Functional Ear Training or Rhythm Architect as a new “Innovative” section.
- **Option C**: New section in Dashboard (like JazzKiller, Chord Lab, ITM) called “Innovative Exercises” with its own landing and exercise list.

Milestone PROJECT.md says “new module (not only FET/RhythmArchitect)”; recommend **Option A or C** so the module is a distinct surface. Can add nav entry in main app (Dashboard or sidebar) and a list of six exercises (Ghost Note, Intonation Heatmap, Voice-Leading Maze, Swing Pocket, Call and Response, Ghost Rhythm).

---

### 8. Files Likely Touched

- **New**: Exercise-specific components (GhostNoteMatchPanel, IntonationHeatmapPanel, VoiceLeadingMazePanel, SwingPocketPanel, CallAndResponsePanel, GhostRhythmPanel); optional shared hooks (useSwingAnalysis, useOnsetDetection, useIntonationHeatmap); lick data and pro sample loading.
- **Modified**: App router or Dashboard (nav); possibly globalAudio or JazzKiller for mute; reuse useITMPitchStore, useHighPerformancePitch, frequencyToNote, GuideToneCalculator (no change or small extensions).
- **Reuse**: ExerciseInputAdapter pattern (mic/MIDI) from Phase 13 if exercises support MIDI; useClapValidation or similar for onset timing if shared.

---

## Summary

- **Pitch**: Use existing pipeline (useITMPitchStore, frequencyToNote); 10¢ for Ghost Note and “perfect intonation”; 5¢ band for Ghost Rhythm stability; cents per degree for Intonation Heatmap (ET = green, out = red; JI = blue with tunable bands).
- **Guide tones**: GuideToneCalculator per chord; Voice-Leading Maze mutes backing when note ∉ {3rd, 7th}.
- **Rhythm**: Onset timestamps (reuse or add from mic/MIDI); swing ratio from 8th-note timing; pocket = average ms offset; 3-vs-4 grid for Ghost Rhythm; RMS/onset for Call and Response overlay.
- **Playback mute**: Backing gain or stem mute controlled by Voice-Leading Maze state.
- **Ghost Note**: Lick with one ghost slot; target pitch in metadata; replacement = pro sample on 10¢ match.
- **Module**: New route or Dashboard section “Innovative Exercises” with six exercise entry points.
