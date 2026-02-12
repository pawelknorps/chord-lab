# Innovative Interactive Exercises (Ear + Rhythm) – Project Vision

## Vision Statement

Introduce a **new module** of **innovative interactive exercises** that leverage ITM’s 2026 stack (sub-cent pitch, millisecond timing, functional harmony) to teach **harmonic anticipation**, **expressive intonation**, and **micro-timing feel**—blurring the line between practice and performance.

## Problem Statement

- Existing ear and rhythm training is mostly “right/wrong” (pitch or beat). Students don’t get feedback on **how** they’re in tune (just vs equal temperament) or **where** they sit in the pocket (push vs lay back).
- Guide-tone and voice-leading are taught as theory; there’s no **interactive drill** that mutes the track until the student plays the correct connective note.
- Jazz pedagogy emphasizes “ghost notes,” “intonation heat,” and “swing ratio,” but few tools **measure** these in real time and feed back.

## Core Value Proposition

**“The app listens like a pro and teaches like one.”**

1. **Pitch-centric ear training**: Ghost Note Match (fill the missing note → ghost becomes pro sample); Intonation Heatmap (drone + scale → green/blue/red by tuning flavor); Voice-Leading Maze (ii–V–I guide tones only, track mutes until correct).
2. **Micro-timing rhythm training**: Swing Pocket Validator (2:1 vs 3:1 swing ratio + pocket gauge); Call and Response Rhythmic Mimicry (RMS envelope overlay vs pro); Ghost Rhythm Poly-Meter (3-over-4 with pitch-stability win condition).
3. **2026 tech**: Sub-cent pitch (SwiftF0/MPM + frequencyToNote), millisecond time-stamping, Functional Decomposition (guide tones, chord DNA), RMS/onset for rhythm.

## Target Audience

- **Jazz students** who want to train “the feel” and expressive intonation, not just correct notes.
- **Teachers** who want exercises that measure swing ratio, intonation flavor, and voice-leading in real time.

## Core Functionality (The ONE Thing)

**A single new module (or sub-module) that offers six innovative exercises: three pitch-centric (Ghost Note, Intonation Heatmap, Voice-Leading Maze) and three micro-timing (Swing Pocket, Call and Response, Ghost Rhythm), all driven by real-time mic (and optionally MIDI) with clear pedagogical feedback.**

## High-Level Requirements

### I. Innovative Ear Training (Pitch-Centric)

| Exercise | Drill | Action | 2026 Innovation |
|----------|--------|--------|------------------|
| **Ghost Note Match** | App plays a short jazz lick with one note replaced by a “ghost” (noise/thump). | Student plays the missing note on instrument. | If pitch within 10 cents, ghost transforms into high-fidelity pro sample → “perfect” collaborative lick. Teaches **harmonic anticipation**. |
| **Intonation Heatmap** | App plays drone (e.g. C pedal). Student plays slow scale (e.g. C Major). | Play each scale degree. | Map **tonal gravity**: Major 3rd “bright,” minor 7th “dark.” UI heatmap: Green = ET, Blue = Just (sweet), Red = out of tune. Teaches **expressive intonation**. |
| **Voice-Leading Maze** | App shows ii–V–I progression. | Sing or play a continuous line of **guide tones** (3rds and 7ths) with shortest distance. | If student plays a note that isn’t a 3rd or 7th, **backing track mutes** until they find the correct connective note. Uses **Functional Decomposition** (GuideToneCalculator). |

### II. Innovative Rhythm Training (Micro-Timing)

| Exercise | Drill | Action | 2026 Innovation |
|----------|--------|--------|------------------|
| **Swing Pocket Validator** | Metronome on 2 and 4. | Student plays repetitive 8th-note pattern. | Analyze **swing ratio** (2:1 triplet vs 3:1 hard swing). UI “Pocket Gauge.” Challenge: “Push” or “Lay Back”; report micro-offset in ms (e.g. “15ms ahead—cool it for Count Basie”). |
| **Call and Response Rhythmic Mimicry** | Drummer plays 2-bar syncopated break. | Student scats or plays rhythm back into mic. | **RMS (volume) envelopes** match attack; overlay student waveform on pro waveform. Show where “and of 4” was late. |
| **Ghost Rhythm Poly-Meter** | App plays 4/4 beat. | Student plays 3/4 cross-rhythm on one note (e.g. G). | Track **pitch stability** during rhythm. If pitch wavers, time not internalized. **Win**: pitch within 5 cents + successful 3-against-4. |

### III. Technology Mapping

| Exercise | Technology Used | Why It’s “Incredible” |
|----------|-----------------|------------------------|
| Ghost Note | CREPE-WASM / SwiftF0 + Tonal.js | Blurs “practice” and “performance.” |
| Intonation Heatmap | Sub-cent pitch (frequencyToNote, cents) | Teaches tuning flavor, not just math. |
| Swing Pocket | Millisecond time-stamping | Solves hardest jazz skill: “the feel.” |
| Voice-Leading Maze | Functional DNA (GuideToneCalculator, chord decomposition) | Only 3rds/7ths unlock the track. |

## Technical Constraints

- Reuse **pitch pipeline**: useITMPitchStore, SwiftF0/MPM, frequencyToNote (note + cents), CrepeStabilizer.
- Reuse **theory**: GuideToneCalculator, ChordScaleEngine, chord parsing (functional decomposition).
- **Rhythm**: Reuse or extend onset/RMS from worklet or analyzer; millisecond timestamps from transport or high-resolution timing.
- **UI**: New exercise screens/panels; heatmap and waveform overlay components.

## Out of Scope (v1)

- Full DAW-style waveform editor.
- Automatic generation of “ghost” licks (curated lick library first).
- Multi-user real-time jam.

## Success Metrics

- Ghost Note: Student plays missing note within 10 cents → ghost replaces with pro sample; one full lick flow works.
- Intonation Heatmap: Drone + scale produces heatmap (green/blue/red) per scale degree.
- Voice-Leading Maze: ii–V–I plays; non–guide-tone mutes track; guide-tone line keeps track playing.
- Swing Pocket: 8th-note pattern yields swing ratio and pocket gauge; “Push/Lay Back” challenge reports ms offset.
- Call and Response: Student rhythm overlays pro waveform with clear early/late feedback.
- Ghost Rhythm: 3-over-4 with pitch-stability win (5-cent variance + correct rhythm).

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| New module (not only FET/RhythmArchitect) | Exercises are a distinct product surface; can later embed in FET or Rhythm Architect. |
| Mic-first, MIDI optional | Aligns with “play your instrument” pedagogy; MIDI can be added via existing adapters. |
| 10 cents for Ghost Note “match” | Matches existing “perfect intonation” threshold (frequencyToNote). |
| Guide tones = 3rds and 7ths only (Voice-Leading Maze) | Matches GuideToneCalculator and jazz voice-leading pedagogy. |
| 5 cents for Ghost Rhythm win | Stricter than “perfect intonation” to force internalized time. |

## Integration Points

- **Pitch**: useITMPitchStore, useHighPerformancePitch, frequencyToNote, CrepeStabilizer, SwiftF0Worker.
- **Theory**: GuideToneCalculator, ChordScaleEngine, chord parsing, Tonal.js.
- **Rhythm**: Transport (BPM, beat), onset/RMS (existing or new), high-resolution time.
- **Audio**: globalAudio, playback, stem/mixer for backing and pro samples.
- **UI**: New route or panel set for “Innovative Exercises”; shared components (heatmap, gauges, overlays).

## Next Steps

1. Detail requirements with REQ-IDs (REQUIREMENTS.md).
2. Plan implementation waves (ROADMAP.md).
3. Align with main ITM ROADMAP as Phase 17 (or next phase number).
