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

### Wave 2 (Rhythm) – Stubs Only

| Item | Status | Notes |
|------|--------|--------|
| REQ-IR-01: Swing Pocket Validator | 🔲 | Placeholder panel only. |
| REQ-IR-02: Call and Response | 🔲 | Placeholder panel only. |
| REQ-IR-03: Ghost Rhythm Poly-Meter | 🔲 | Placeholder panel only. |

### Wave 3 (Module Entry)

| Item | Status | Notes |
|------|--------|--------|
| Route `/innovative-exercises` | ✅ | App.tsx. |
| Nav “Innovative Exercises” | ✅ | Dashboard Practice section. |
| List of six exercises | ✅ | InnovativeExercisesModule sidebar. |
| Unified input (mic + optional MIDI) | 🔲 | Mic only for v1; MIDI deferred. |

## Manual Verification Steps

1. **Ghost Note Match**: Open Innovative Exercises → Ghost Note Match. Click “Play Lick”. During ghost slot, play E4 on instrument (within 10¢). Expect “Perfect!” and replacement note; optional retry.
2. **Intonation Heatmap**: Select Intonation Heatmap. Click “Start Drone”. Play C major scale (C, D, E, F, G, A, B). Expect heatmap cells to fill (green for in-tune, red for out).
3. **Voice-Leading Maze**: Select Voice-Leading Maze. Click “Start Backing”. Play a note that is not 3rd or 7th of Dm7 → backing mutes. Play F or C (3rd/7th of Dm7) → unmutes and advances to G7. Continue with guide tones for G7 and Cmaj7.

## Sign-Off

- Wave 1 (Ear) and module entry are implemented and verifiable.
- Wave 2 (Rhythm) is stubbed; full implementation is deferred to a follow-up.
- ROADMAP.md and STATE.md updated to reflect Phase 17 partial completion.
