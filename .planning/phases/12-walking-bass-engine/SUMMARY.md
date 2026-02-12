# Phase 12: Walking Bass Engine — Plan Summary

## Goal (from PLAN.md)

Replace beat-by-beat walking bass with a **teleological** 4-beat strategy: every bar asks "Where is the next chord, and how do I get there smoothly?" Beat 4 is the key—chromatic or dominant approach into the next bar's root.

## Delivered

- **WalkingBassEngine** (`src/core/theory/WalkingBassEngine.ts`): Class using tonal.js (Chord, Note); `generateWalkingLine(currentChord, nextChord)` returns 4 MIDI notes; E1 (28)–G3 (55) range. Strategies: Circle of Fifths (dominant drop on Beat 4), Stepwise/Enclosure, Static/Pedal (Ron Carter–style oscillations, octave skips). Bebop edition with `generateVariedWalkingLine` → `BassEvent[]` via `BassRhythmVariator`.
- **Band integration**: `useJazzBand` generates full line at beat 0 (`walkingLineRef.current = generateVariedWalkingLine(...)`), syncs engine state from `lastBassNoteRef` before generating; plays `line` per beat via `hitsForBeat` (BassEvent[] with time/velocity/ghost). Fallback behavior preserved via existing flow when line invalid.
- **Tests**: `WalkingBassEngine.test.ts` — 4 notes per bar; all in range; Beat 1 root; Beat 4 approach; state carry.

## Verification

See `VERIFICATION.md` in this phase directory.
