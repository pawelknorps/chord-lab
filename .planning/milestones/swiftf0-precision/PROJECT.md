# SwiftF0 SOTA Precision – Project Vision

## Vision Statement

Achieve **State-of-the-Art (SOTA) precision** for SwiftF0 pitch detection by eliminating flickering and semitone jitter. SwiftF0 has a bin resolution of ~33.1 cents; a semitone is 100 cents, so raw argmax causes audible jumps. This milestone adds **Local Expected Value decoding** (sub-bin accuracy), **Temporal Smoothing** (median filter + hysteresis/note lock), and **Chromatic + Cents display** so the system feels precise and neighbor-tone variation reads as natural vibrato.

## Problem Statement

- **Flickering**: Model confidence fluctuates between frames (~16 ms apart), so the "winning" bin jumps between adjacent tones (e.g. C ↔ C#).
- **Lack of semitone precision**: Relying on the raw argmax bin yields ~33 cents resolution; users expect stable note labels and cent-level feedback (e.g. tuner bar).
- **Wrong mapping**: If mapping rounds to natural notes (A, B, C) instead of chromatic (A, A#, B, C, C#), semitones can appear "ignored."

## Core Value Proposition

**"Sub-bin accuracy, stable notes, visible cents."**

1. **Local Expected Value (LEV)**: Do not use argmax; use a 9-bin weighted average in log-frequency space so the output is cent-level precise: \(f_{final} = 2^{\sum p'_i \cdot \log_2(f_i)}\) over a window centered on the peak.
2. **Temporal Smoothing**: (A) Median filter over the last 5–7 frequency estimates to remove single-frame spikes and octave jumps; (B) Hysteresis (Schmitt trigger): change the **note label** only if the new frequency is >60 cents away and stable for ≥3 consecutive frames (~48 ms).
3. **Chromatic + Cents**: Map frequency to chromatic note via \(n = 12 \cdot \log_2(f/440) + 69\); note number = round(n); cents offset = (n − round(n)) × 100. Expose a **tuner bar** (cents) so small variation reads as vibrato, not flicker.

## Target Audience

- **Developers** maintaining the SwiftF0 pipeline and UI.
- **End users** (students, teachers) who see pitch in ITM, JazzKiller, Innovative Exercises, and tuner/intonation UIs.

## Core Functionality (The ONE Thing)

**Verify and lock in Local Expected Value decoding, median filter, and hysteresis in the SwiftF0 pipeline, and expose cents (tuner bar) in the UI so pitch feedback is SOTA-precise and flicker-free.**

## High-Level Requirements

| Area | Goal | Out of Scope |
|------|-----|--------------|
| Decoding | Use LEV (9-bin weighted average in log space); no argmax-only pitch | Changing ONNX model or bin count |
| Temporal | Median filter (5–7 frames); hysteresis 60¢, 3-frame stability for note change | Moving inference to Worklet |
| Mapping | Chromatic note (n = 12·log2(f/440)+69); cents = (n−round(n))·100 | Changing Tonal.js or note naming |
| UI | Display cents (tuner bar) where pitch is shown | Full redesign of all pitch UIs |

## Technical Constraints

- Reuse **SwiftF0Worker**, **swiftF0Inference**, **CrepeStabilizer**, **frequencyToNote**, and **useITMPitchStore**; no breaking changes to the pitch API.
- LEV and temporal smoothing live in the existing Worker + stabilizer pipeline (post-inference).
- Tuner bar / cents display is additive UI where pitch is already consumed.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Verify LEV in swiftF0Inference | Codebase already has 9-bin weighted average; confirm formula matches spec (log-space weighted geometric mean). |
| Median 5 as optional sweet spot | User spec: "5 frames is the sweet spot for latency vs. stability"; support 5 or 7 per profile. |
| Hysteresis 60¢, 3 frames | User spec: note change only if >60¢ away and stable for 3 frames (~48 ms). Align profiles where needed. |
| Tuner bar with cents | So "neighbor tone flickering" looks like vibrato; improves perceived precision. |

## Success Metrics

- No argmax-only path for final pitch (LEV used).
- Median filter active (window 5 or 7); single-frame spikes/octave jumps suppressed.
- Note label changes only after hysteresis (e.g. 60¢ + 3-frame stability).
- Chromatic note + cents exposed; at least one tuner bar (cents) in the app.

## Integration Points

- **swiftF0Inference.ts**: classificationToPitch (LEV over 9-bin window); already present—verify formula.
- **CrepeStabilizer.ts**: Median filter + hysteresis + stability timer; align hysteresisCents/stabilityThreshold with 60¢ / 3 frames where appropriate.
- **instrumentProfiles.ts**: hysteresisCents, stabilityThreshold, windowSize.
- **frequencyToNote**: Chromatic n and cents; already correct—ensure all consumers can show cents.
- **UI**: ITM / JazzKiller / Innovative Exercises / any pitch display: add or wire tuner bar (cents).

## Next Steps

1. Detail requirements with REQ-SF0-P* (REQUIREMENTS.md).
2. Plan implementation waves (ROADMAP.md).
3. Execute; update STATE.md and main ROADMAP/STATE.
