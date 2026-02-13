---
phase: 17
name: Innovative Interactive Exercises (Ear + Rhythm)
waves: 3
dependencies: ["Phase 9: Mic Algorithm (frequencyToNote, perfect intonation)", "Phase 14.1: SwiftF0 / MPM pitch pipeline", "Phase 13: Standards Exercises (ExerciseInputAdapter, GuideToneCalculator)", "JazzKiller / globalAudio (playback, mute)"]
files_modified: [
  "src/App.tsx or Dashboard/layout (nav)",
  "src/modules/JazzKiller/state/jazzSignals.ts or globalAudio (mute backing)"
]
files_created: [
  "src/modules/InnovativeExercises/ or src/modules/InnovativeExercises/ (module root)",
  "src/modules/InnovativeExercises/components/GhostNoteMatchPanel.tsx",
  "src/modules/InnovativeExercises/components/IntonationHeatmapPanel.tsx",
  "src/modules/InnovativeExercises/components/VoiceLeadingMazePanel.tsx",
  "src/modules/InnovativeExercises/components/SwingPocketPanel.tsx",
  "src/modules/InnovativeExercises/components/CallAndResponsePanel.tsx",
  "src/modules/InnovativeExercises/components/GhostRhythmPanel.tsx",
  "src/modules/InnovativeExercises/hooks/useGhostNoteMatch.ts",
  "src/modules/InnovativeExercises/hooks/useIntonationHeatmap.ts",
  "src/modules/InnovativeExercises/hooks/useVoiceLeadingMaze.ts",
  "src/modules/InnovativeExercises/hooks/useSwingPocket.ts",
  "src/modules/InnovativeExercises/hooks/useCallAndResponse.ts",
  "src/modules/InnovativeExercises/hooks/useGhostRhythm.ts",
  "src/modules/InnovativeExercises/core/IntonationHeatmapLogic.ts (optional)",
  "src/modules/InnovativeExercises/core/SwingAnalysis.ts (optional)"
]
---

# Phase 17 Plan: Innovative Interactive Exercises (Ear + Rhythm)

**Focus**: New **module** of six innovative exercises: three pitch-centric (Ghost Note Match, Intonation Heatmap, Voice-Leading Maze) and three micro-timing (Swing Pocket Validator, Call and Response Rhythmic Mimicry, Ghost Rhythm Poly-Meter). All driven by real-time mic (and optionally MIDI) with clear pedagogical feedback.

**Success Criteria**:
- REQ-IE-01: Ghost Note Match: one lick with one ghost note; student plays missing note within 10¢ → ghost replaced by pro sample; full lick plays.
- REQ-IE-02: Intonation Heatmap: drone + scale; heatmap green/blue/red per scale degree (ET / Just / out of tune).
- REQ-IE-03: Voice-Leading Maze: ii–V–I; only 3rds/7ths correct; wrong note mutes backing until correct.
- REQ-IR-01: Swing Pocket: metronome 2 and 4; 8th-note pattern yields swing ratio and Pocket Gauge; Push/Lay Back reports ms offset.
- REQ-IR-02: Call and Response: pro 2-bar break; student rhythm overlays pro waveform with early/late feedback.
- REQ-IR-03: Ghost Rhythm: 4/4 backing; 3-over-4 on one note; win = pitch within 5¢ + correct 3-vs-4 rhythm.

---

## Context (Existing Assets)

- **Pitch**: useITMPitchStore, useHighPerformancePitch, frequencyToNote (note + cents, isPerfectIntonation ±10¢), CrepeStabilizer.
- **Theory**: GuideToneCalculator.calculate(chordSymbol) → 3rd, 7th; ChordScaleEngine, Tonal.js Scale/Chord/Note.
- **Input**: Mic pipeline (pitch-processor.js, SwiftF0Worker); MIDI (useMidi, lastNote). ExerciseInputAdapter (Phase 13) unifies mic/MIDI → getCurrentNote.
- **Playback**: useJazzBand, globalAudio, Transport (BPM, beat); chart-driven chord progression. Mute = set backing gain to 0 or mute stems.
- **Rhythm**: useClapValidation (Rhythm Architect) for onset vs grid; Transport for high-resolution time. See RESEARCH.md for onset/RMS and swing ratio.

---

## Wave 1: Ear Exercises (Pitch-Centric)

*Goal: Ghost Note Match, Intonation Heatmap, Voice-Leading Maze using existing pitch pipeline and GuideToneCalculator.*

### 17.1 – Ghost Note Match (REQ-IE-01)

- <task id="W1-T1">**Lick format and ghost asset**  
  Define a curated short lick (e.g. 1–2 bars) with one note designated “ghost”: metadata includes target pitch (note name or MIDI) and timing. Audio: play normal notes; at ghost slot play “ghost” sound (noise or muffled thump). Pro sample set: one-shot samples per note (or pitch class + octave) for replacement. Store lick as JSON or in-code (events: pitch, duration, timeOffset, isGhost).</task>

- <task id="W1-T2">**Target note + 10¢ check**  
  From lick metadata, get target pitch for ghost slot (frequency or note name). Consume mic pitch via useITMPitchStore or useHighPerformancePitch; convert with frequencyToNote. If student plays during ghost window and isPerfectIntonation (|centsDeviation| ≤ 10) for target (pitch class + octave tolerance), trigger “match.” Optional: allow ±1 semitone for “close” feedback.</task>

- <task id="W1-T3">**Replacement playback**  
  On match: at ghost slot, play high-fidelity pro sample for the matched note (instead of or after ghost sound). Sync with rest of lick (play ghost → replacement in sequence, or pre-baked full lick with replacement). Ensure one full lick flow: play missing note within 10¢ → ghost swaps to pro sample; lick plays through.</task>

- <task id="W1-T4">**Ghost Note Match UI**  
  Create GhostNoteMatchPanel (or equivalent): play lick button; “Play the missing note” prompt; during ghost slot show listening state; on match show “Perfect!” and play full lick with replacement; optional retry. Use useGhostNoteMatch hook (state: lick, ghostSlot, isListening, matched, playReplacement).</task>

### 17.2 – Intonation Heatmap (REQ-IE-02)

- <task id="W1-T5">**Drone + scale playback**  
  Implement drone (sustained root, e.g. C) and optional scale reference (e.g. C Major scale played or displayed). Scale degrees as target sequence (1–7) or free play; student plays each degree. Use Tone.js or globalAudio for sustained tone; scale can be display-only or optional playback.</task>

- <task id="W1-T6">**Cents per scale degree**  
  For each played note: map to scale degree via Tonal.js (Scale.get(scaleName).notes; match pitchClass to degree). Store cents deviation (from frequencyToNote) per degree. Classify: ET = |cents| ≤ ~10 (green); “Just” = tunable band per degree (blue, optional v1); out of tune = |cents| > ~25 (red). See RESEARCH.md for bands.</task>

- <task id="W1-T7">**Heatmap UI**  
  Create IntonationHeatmapPanel: one cell or bar per scale degree (1–7); color = green (ET), blue (Just if implemented), red (out of tune); optional legend. “Play each note of the scale” prompt; update heatmap as student plays. useIntonationHeatmap hook: state = { degree → { cents, classification } }.</task>

### 17.3 – Voice-Leading Maze (REQ-IE-03)

- <task id="W1-T8">**Progression + guide tones**  
  Use chord progression (e.g. Dm7–G7–Cmaj7). Per chord, GuideToneCalculator.calculate(chordSymbol) yields allowed 3rds and 7ths (note names or MIDI). Build allowed set per chord (pitch class or MIDI in one octave). Current chord from progression index (e.g. 2 bars per chord or 4 bars total).</task>

- <task id="W1-T9">**Input vs guide tones + mute**  
  Compare current mic/MIDI note (pitch class) to allowed set for current chord. If student plays a note and it is in set → correct (unmute or keep unmuted). If student plays a note and it is not in set → mute backing. When muted, backing gain = 0 (or mute stems via globalAudio/useJazzBand). When student plays correct 3rd or 7th, unmute. useVoiceLeadingMaze: progression, currentChordIndex, allowedSet, isMuted, checkNote(note).</task>

- <task id="W1-T10">**Voice-Leading Maze UI**  
  Create VoiceLeadingMazePanel: show progression (ii–V–I); “Play guide tones only (3rds and 7ths)”; start playback; visual feedback (muted vs playing); optional target 3rd/7th hints per chord. Wire mute to backing; show “Muted—play a guide tone” when muted.</task>

---

## Wave 2: Rhythm Exercises (Micro-Timing)

*Goal: Swing Pocket Validator, Call and Response, Ghost Rhythm using onset timing, swing ratio, RMS/overlay, and pitch stability.*

### 17.4 – Swing Pocket Validator (REQ-IR-01)

- <task id="W2-T1">**Onset timing**  
  Capture onset times from mic (or MIDI note-on) with high-resolution timestamps (performance.now() or Transport.seconds). Align to grid: BPM, beat boundaries (2 and 4 for metronome). For 8th-note pattern, assign each onset to “first 8th” or “second 8th” of a beat. Reuse or extend useClapValidation / onset detection (RMS threshold or spectral flux).</task>

- <task id="W2-T2">**Swing ratio + Pocket Gauge**  
  Compute swing ratio per beat: (duration of first 8th) / (duration of second 8th). Aggregate (e.g. average) → e.g. 2:1 (triplet) vs 3:1 (hard). Compute average offset of onsets vs grid (ms): positive = late, negative = early. Expose to UI: ratio (e.g. “2.1:1”) and offset (e.g. “15 ms ahead”). Pocket Gauge: visual (gauge or bar) for ahead / on / behind and optionally ratio. useSwingPocket hook: onsets, grid, ratio, offsetMs, Pocket Gauge state.</task>

- <task id="W2-T3">**Push / Lay Back challenge + UI**  
  Mode where app asks “Push” (play ahead) or “Lay Back” (play behind). Compute average offset in ms; feedback text (e.g. “You’re 15 ms ahead—cool it for a Count Basie feel”). SwingPocketPanel: metronome 2 and 4; record pattern; show Pocket Gauge and ratio; challenge mode with feedback.</task>

### 17.5 – Call and Response Rhythmic Mimicry (REQ-IR-02)

- <task id="W2-T4">**Reference break + student envelope**  
  Define 2-bar syncopated drum break as reference (audio + onset times or RMS envelope). Student records (or real-time) rhythm via mic. Run onset detection (or RMS peak) on student input; timestamp each attack. Align student to reference (e.g. by first attack or bar start).</task>

- <task id="W2-T5">**Overlay + feedback**  
  Overlay student waveform (or onset markers) on pro reference waveform. Show where each attack was early/late (e.g. “and of 4 late by 40 ms”). useCallAndResponse: reference onsets, student onsets, aligned pairs, early/late per attack. CallAndResponsePanel: play pro break → “Play it back”; show overlay and early/late feedback.</task>

### 17.6 – Ghost Rhythm Poly-Meter (REQ-IR-03)

- <task id="W2-T6">**3 vs 4 grid + pitch stability**  
  Define 3/4 grid over 4/4: 3 equally spaced attacks per bar (e.g. 0, 1.33, 2.67 in beat units). Score student onsets against this grid (tolerance window, e.g. ±80 ms). During exercise, sample pitch from useITMPitchStore; compute variance (e.g. std dev of cents around target note G). Require pitch within 5 cents (e.g. std dev ≤ 5 or max deviation ≤ 5). Win = rhythm hits on 3/4 grid and pitch stable (≤5¢).</task>

- <task id="W2-T7">**Ghost Rhythm UI**  
  GhostRhythmPanel: 4/4 backing; “Play 3-over-4 on one note (e.g. G)”; show pitch stability indicator and rhythm accuracy; win state when both conditions met. useGhostRhythm: onsets, 3/4 grid, pitch samples, rhythmScore, pitchStable, win.</task>

---

## Wave 3: Module Entry and Verification

*Goal: App nav entry, unified input, docs and verification.*

- <task id="W3-T1">**Module entry in app nav**  
  Add “Innovative Exercises” to app navigation (Dashboard or main nav). Create module root (e.g. route `/innovative-exercises` or section in Dashboard). List all six exercises: Ghost Note Match, Intonation Heatmap, Voice-Leading Maze, Swing Pocket Validator, Call and Response, Ghost Rhythm. Each entry links to corresponding panel.</task>

- <task id="W3-T2">**Unified input (mic + optional MIDI)**  
  Ensure all exercises support mic. Where applicable (Ghost Note, Voice-Leading Maze, Swing Pocket), support optional MIDI via existing ExerciseInputAdapter or useMidi so getCurrentNote works from MIDI. Same scoring/logic for both.</task>

- <task id="W3-T3">**Tests and verification**  
  Add unit tests where feasible: (1) IntonationHeatmapLogic: map note to scale degree, classify ET/out. (2) SwingAnalysis: compute ratio and offset from mock onsets. (3) Voice-Leading Maze: allowed set from GuideToneCalculator; mute logic. (4) Ghost Note: 10¢ match from frequencyToNote. Verification checklist: run each exercise once; Ghost Note → match → pro sample; Intonation Heatmap → heatmap updates; Voice-Leading Maze → mute on wrong note; Swing Pocket → ratio and ms feedback; Call and Response → overlay; Ghost Rhythm → win on 5¢ + 3-vs-4. Update STATE.md and phase SUMMARY.md when complete.</task>

---

## Implementation Notes

- **Ghost Note**: Lick format can start with one hardcoded lick; pro samples can use same soundfont/sampler as app or a small set of one-shots.
- **Intonation Heatmap**: Start with green (ET, |cents| ≤ 10) and red (out, |cents| > 25); add blue (Just) bands in same wave or follow-up.
- **Voice-Leading Maze**: Mute can be a global “backing muted” flag that globalAudio or useJazzBand respects (e.g. master gain for backing stems).
- **Swing Pocket**: Onset detection can reuse Rhythm Architect approach (amplitude/RMS threshold) or a small AnalyserNode + RMS in rAF.
- **Call and Response**: Reference break can be pre-recorded audio + precomputed onset list; student side real-time or one-shot record then analyze.
- **Ghost Rhythm**: 3/4 grid in 4/4 = 3 attacks at 0, 4/3, 8/3 beats (or 0, 1.33, 2.67); tolerance ~80–100 ms for “hit.”

---

## Plan Verification

- [ ] Phase 17 exists in ROADMAP.md and STATE.md; REQ-IE-01..03 and REQ-IR-01..03 defined in REQUIREMENTS.md and milestone REQUIREMENTS.md.
- [ ] All six exercises are covered: Wave 1 (Ghost Note, Intonation Heatmap, Voice-Leading Maze), Wave 2 (Swing Pocket, Call and Response, Ghost Rhythm), Wave 3 (module entry, unified input, verification).
- [ ] Dependencies (pitch pipeline, GuideToneCalculator, playback/mute, Transport) are satisfied and documented in RESEARCH.md.
- [ ] Files modified/created list is complete; module can live under `src/modules/InnovativeExercises/` or similar.
- [ ] Success criteria for each REQ are testable (acceptance criteria from milestone REQUIREMENTS.md).
