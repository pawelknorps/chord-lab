# Phase 12: Walking Bass Engine (Target & Approach)

## Goal

Replace beat-by-beat walking bass with a **teleological** 4-beat strategy: every bar asks "Where is the next chord, and how do I get there smoothly?" Beat 4 is the key—chromatic or dominant approach into the next bar's root.

## Strategy

1. **Beat 1 (Anchor)**: Establish harmonic function—root (or nearest chord tone to hand).
2. **Beat 4 (Approach)**: Calculated first. Chromatic from below/above or 5th of destination.
3. **Beats 2–3 (Bridge)**: Chord tones or scale steps between Beat 1 and Beat 4.

## Implementation

- **WalkingBassEngine** (`src/core/theory/WalkingBassEngine.ts`): Class using tonal.js (Chord, Note); `generateWalkingLine(currentChord, nextChord)` returns 4 MIDI notes; E1 (28)–G3 (55) range.
- **Band integration**: useJazzBand generates full line at beat 0, caches in ref, plays `line[beat]` for beats 0–3; syncs engine state from `lastBassNoteRef` before generating.
- **Fallback**: If line invalid, use existing `JazzTheoryService.getNextWalkingBassNote`.

## Verification

- `WalkingBassEngine.test.ts`: 4 notes per bar; all in range; Beat 1 root; Beat 4 approach; state carry.
- Manual: Play JazzKiller with bass on; confirm Beat 4 leads into next chord (e.g. G7→Cmaj7: Beat 4 B or C# or F).
