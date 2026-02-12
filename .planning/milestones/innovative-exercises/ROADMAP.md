# Innovative Interactive Exercises – Roadmap

## Overview

This milestone delivers **six innovative exercises** in two groups: **Ear (Pitch-Centric)** and **Rhythm (Micro-Timing)**. Phases are ordered to reuse existing pitch and theory first, then add rhythm and UI.

---

## Wave 1: Foundation and Ear Exercises (Pitch-Centric)

*Focus: Reuse pitch pipeline and theory; ship first ear exercise and heatmap.*

### 17.1 – Ghost Note Match (REQ-IE-01)

- **Success criteria**: One jazz lick with one ghost note; student plays missing note within 10 cents → ghost replaced by pro sample; full lick plays.
- **Tasks**:
  - [ ] **Lick + ghost asset**: Curated short lick (e.g. 1–2 bars) with one note designated “ghost”; audio: noise/thump for ghost slot; pro sample set for possible replacement notes (or single-note samples).
  - [ ] **Target note + 10¢ check**: From lick metadata, target pitch for ghost slot; consume mic pitch (useITMPitchStore / frequencyToNote); if `isPerfectIntonation` (≤10¢) for target, trigger replacement.
  - [ ] **Replacement playback**: Swap ghost segment with high-fidelity pro sample for matched note; sync with rest of lick (or play ghost → replacement in sequence).
  - [ ] **Ghost Note Match UI**: Screen/panel for exercise: play lick, show “play the missing note,” feedback (match → sample plays), optional retry.

### 17.2 – Intonation Heatmap (REQ-IE-02)

- **Success criteria**: Drone (e.g. C) + scale (e.g. C Major); student plays each degree; heatmap shows green/blue/red per degree (ET vs Just vs out of tune).
- **Tasks**:
  - [ ] **Drone + scale playback**: Drone (sustained root) and optional scale reference; scale degrees as target sequence (or free play per degree).
  - [ ] **Cents per degree**: For each played note, map to scale degree (Tonal.js); store cents deviation; classify ET / Just / out-of-tune (thresholds TBD).
  - [ ] **Heatmap UI**: Component: one cell or bar per scale degree; color = green (ET), blue (Just), red (out); optional legend.
  - [ ] **Intonation Heatmap screen**: Combine drone, scale, and heatmap; “play each note of the scale” prompt.

### 17.3 – Voice-Leading Maze (REQ-IE-03)

- **Success criteria**: ii–V–I progression; only 3rds and 7ths are “correct”; playing wrong note mutes backing until correct note.
- **Tasks**:
  - [ ] **Progression + guide tones**: Use chord progression (e.g. Dm7–G7–Cmaj7); per chord, GuideToneCalculator (or equivalent) yields allowed 3rds and 7ths.
  - [ ] **Input vs guide tones**: Compare current mic/MIDI note to allowed set for current chord; if not in set → mute backing; if in set → unmute (or keep playing).
  - [ ] **Transport/playback mute**: Hook to backing track (globalAudio or JazzKiller-style playback); mute/unmute based on correct/wrong note.
  - [ ] **Voice-Leading Maze UI**: Show progression (ii–V–I); “play guide tones only”; visual feedback (muted vs playing); optional target 3rd/7th hints.

---

## Wave 2: Rhythm Exercises (Micro-Timing)

*Focus: Millisecond timing, swing ratio, RMS/onset; waveform overlay and poly-meter.*

### 17.4 – Swing Pocket Validator (REQ-IR-01)

- **Success criteria**: Metronome 2 and 4; student plays 8th-note pattern; UI shows swing ratio (e.g. 2:1 vs 3:1) and Pocket Gauge; Push/Lay Back challenge reports offset in ms.
- **Tasks**:
  - [ ] **Onset timing**: Capture onset times (mic or MIDI) with high-resolution timestamps; align to grid (BPM, 2 and 4).
  - [ ] **Swing ratio**: Compute ratio of “first 8th” to “second 8th” in each beat (e.g. 2:1 triplet, 3:1 hard); expose to UI.
  - [ ] **Pocket Gauge**: Visual (gauge or bar) for “ahead / on / behind” and optionally swing ratio.
  - [ ] **Push / Lay Back challenge**: Mode where app asks “Push” or “Lay Back”; compute average offset in ms; feedback text (e.g. “15ms ahead”).
  - [ ] **Swing Pocket UI**: Metronome, record pattern, show Pocket Gauge and ratio; challenge mode with feedback.

### 17.5 – Call and Response Rhythmic Mimicry (REQ-IR-02)

- **Success criteria**: Pro drummer 2-bar break; student plays/scats rhythm back; overlay student waveform on pro; show where “and of 4” (etc.) is late/early.
- **Tasks**:
  - [ ] **Reference break**: 2-bar syncopated drum break as reference; onset times (or RMS envelope) for comparison.
  - [ ] **Student envelope**: RMS or onset detection from mic; timestamp each attack.
  - [ ] **Alignment + overlay**: Align student onsets to reference (e.g. by bar start); overlay waveforms or onset markers (student vs pro).
  - [ ] **Call and Response UI**: Play pro break → “play it back”; show overlay and early/late feedback (e.g. “and of 4 late by 40ms”).

### 17.6 – Ghost Rhythm Poly-Meter (REQ-IR-03)

- **Success criteria**: 4/4 backing; student plays 3/4 on one note (e.g. G); win = pitch within 5 cents + correct 3-against-4 rhythm.
- **Tasks**:
  - [ ] **3 vs 4 grid**: Define 3/4 grid over 4/4 (e.g. 3 attacks per bar at 0, 1.33, 2.67 beats or equivalent); score student onsets against this grid.
  - [ ] **Pitch stability**: During exercise, sample pitch (useITMPitchStore); compute variance (e.g. std dev of cents around G); require ≤5 cents (or similar) for “stable.”
  - [ ] **Win condition**: Combine rhythm score (hits on 3/4 grid) + pitch stability (≤5¢); success = both pass.
  - [ ] **Ghost Rhythm UI**: 4/4 play; “play 3-over-4 on one note”; show pitch stability and rhythm accuracy; win state when both conditions met.

---

## Wave 3: Polish and Integration

- **Module entry**: Add “Innovative Exercises” to app nav (or under Ear Training / Rhythm); list all six exercises.
- **Unified input**: Ensure all exercises support mic; optional MIDI where applicable (e.g. Ghost Note, Voice-Leading, Swing Pocket) via existing adapters.
- **Docs and verification**: Update main ROADMAP/STATE; optional RESEARCH.md for swing ratio and intonation thresholds.

---

## Dependency Summary

| Wave | Depends on |
|------|------------|
| 17.1–17.3 | Pitch pipeline (useITMPitchStore, frequencyToNote), GuideToneCalculator, playback/mute |
| 17.4–17.6 | Onset/RMS timing, high-resolution time, transport (BPM); pitch for 17.6 |
| 17.3 | Backing track mute control (JazzKiller or globalAudio) |
