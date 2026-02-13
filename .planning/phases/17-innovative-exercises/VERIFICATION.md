# Phase 17: Innovative Interactive Exercises – Verification

## Phase Goal (from ROADMAP.md)

Six exercises deliverable; Ghost Note (10¢ → pro sample), Intonation Heatmap (green/blue/red per degree), Voice-Leading Maze (mute until guide tone); Swing Pocket (ratio + Pocket Gauge + ms offset), Call and Response (waveform overlay), Ghost Rhythm (5¢ stability + 3-vs-4).

## Verification Checklist

### Wave 1 (Ear) – Implemented

| Item | Status | Notes |
|------|--------|--------|
| REQ-IE-01: Ghost Note Match | ✅ | Lick + ghost; 10¢ match → replacement (globalAudio); GhostNoteMatchPanel + useGhostNoteMatch. |
| REQ-IE-02: Intonation Heatmap | ✅ | Drone (Tone.Synth C4) + scale; heatmap green/red (ET/out) per degree; useIntonationHeatmap + IntonationHeatmapPanel. |
| REQ-IE-03: Voice-Leading Maze | ✅ | ii–V–I (Dm7–G7–Cmaj7); GuideToneCalculator; wrong note mutes backing (Gain node); correct note unmutes and advances. |

### Wave 2 (Rhythm) – Implemented

| Item | Status | Notes |
|------|--------|--------|
| REQ-IR-01: Swing Pocket Validator | ✅ | Metronome 2 and 4; onset capture via useHighPerformancePitch; SwingAnalysis (ratio + offset ms); SwingPocketPanel with Pocket Gauge and Push/Lay Back feedback. |
| REQ-IR-02: Call and Response | ✅ | Reference 2-bar break (REFERENCE_ONSETS_SEC); play reference; record student onsets; align by first attack; CallAndResponsePanel with early/late per attack. |
| REQ-IR-03: Ghost Rhythm Poly-Meter | ✅ | 4/4 backing; 3-over-4 grid (0, 4/3, 8/3 beats); useGhostRhythm (onset + pitch per attack); win = rhythm ≥80% + pitch G ±5¢; GhostRhythmPanel. |

### Wave 3 (Module Entry)

| Item | Status | Notes |
|------|--------|--------|
| Route `/innovative-exercises` | ✅ | App.tsx. |
| Nav “Innovative Exercises” | ✅ | Dashboard Practice section. |
| List of six exercises | ✅ | InnovativeExercisesModule sidebar. |
| Unified input (mic + optional MIDI) | ✅ | Ghost Note, Voice-Leading Maze, Swing Pocket support Mic | MIDI via ExerciseInputAdapter; panels have Input selector. |

## Manual Verification Steps

### Wave 1
1. **Ghost Note Match**: Open Innovative Exercises → Ghost Note Match. Click “Play Lick”. During ghost slot, play E4 on instrument (within 10¢). Expect “Perfect!” and replacement note; optional retry.
2. **Intonation Heatmap**: Select Intonation Heatmap. Click “Start Drone”. Play C major scale (C, D, E, F, G, A, B). Expect heatmap cells to fill (green for in-tune, red for out).
3. **Voice-Leading Maze**: Select Voice-Leading Maze. Click “Start Backing”. Play a note that is not 3rd or 7th of Dm7 → backing mutes. Play F or C (3rd/7th of Dm7) → unmutes and advances to G7. Continue with guide tones for G7 and Cmaj7.

### Wave 2
4. **Swing Pocket**: Select Swing Pocket Validator. Set BPM (e.g. 120). Start metronome (clicks on 2 and 4). Click “Record 4 bars” and play 8th-note pattern on mic. After 4 bars (or stop early) see Pocket Gauge: swing ratio and offset ms; feedback (“ahead” / “behind” / “in the pocket”).
5. **Call and Response**: Select Call and Response. Click “Play reference” (2-bar click pattern). Click “Record my response” and play the same rhythm. Click “Stop”. See list “Attack 1: X ms late/early” per attack.
6. **Ghost Rhythm**: Select Ghost Rhythm. Start 4/4 backing. Click “Record 4 bars (3-over-4 on G)” and play 3 attacks per bar on a single G. After 4 bars see rhythm accuracy %, pitch stable (G ±5¢), and “You win!” if both conditions met.

## Wave 3 (Module Entry and Verification)

- W3-T1: Module entry (route, nav, six exercises) — done.
- W3-T2: Unified input (mic + optional MIDI) — Ghost Note, Voice-Leading Maze, Swing Pocket use `useExerciseInputAdapter` / MIDI note-on; panels have Input: Mic | MIDI.
- W3-T3: Unit tests — `SwingAnalysis.test.ts` (computeSwingPocket), `useVoiceLeadingMaze.test.ts` (getAllowedPitchClasses); 8 tests passing.

## Sign-Off

- Wave 1 (Ear), Wave 2 (Rhythm), Wave 3 (module entry, unified input, tests) are implemented and verifiable.
- ROADMAP.md and STATE.md updated to reflect Phase 17 completion (all six exercises + optional MIDI + tests).
