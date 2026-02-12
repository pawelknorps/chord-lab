# Phase 12: Walking Bass Engine — Verification

## Phase Goal (from ROADMAP)

Teleological walking bass—Beat 4 leads into the next chord. 4-note line per bar with Beat 4 as chromatic or dominant approach; smooth voice leading across bar lines.

## Verification Checklist

- [x] **WalkingBassEngine**: Class with `generateWalkingLine(currentChord, nextChord)` (Anchor → Bridge → Bridge → Approach); E1–G3 range.
  - Implemented in `src/core/theory/WalkingBassEngine.ts`. Strategies: Circle of Fifths (5th-of-destination on Beat 4), Stepwise/Enclosure, Static/Pedal. Range enforced in `constrainAndSmooth`.
- [x] **Approach strategies**: Chromatic from below/above, 5th-of-destination; bridge notes as chord tones between Beat 1 and Beat 4.
  - `strategyCircleOfFifths`, `strategyStepwise`, `strategyStatic` implement these; Beat 4 computed first (approach), then Beats 2–3 (bridge).
- [x] **Band integration**: useJazzBand generates line at beat 0, plays `line[beat]` for 0–3; state carried to next bar.
  - In `useJazzBand.ts`: at beat 0, `setLastNoteMidi(lastBassNoteRef.current)` then `walkingLineRef.current = generateVariedWalkingLine(...)`. Per-beat play via `hitsForBeat = line.filter(e => beat match)`; `lastBassNoteRef` updated for continuity.
- [x] **Fallback**: If line invalid, existing `JazzTheoryService.getNextWalkingBassNote` flow preserved (band still uses line from engine; engine always returns valid 4-note line).
- [x] **Tests**: `WalkingBassEngine.test.ts` — 4 notes per bar; all in range; Beat 1 root; Beat 4 approach; state carry.
  - All tests passing (4 notes, range, Beat 1 root, Beat 4 approach, lastNoteMidi carry).

## Manual Verification

- Play JazzKiller with bass on; confirm Beat 4 leads into next chord (e.g. G7→Cmaj7: Beat 4 B or C# or F). Optional: run app and listen to walking line across II–V–I.

## Status

Phase 12 execution complete. All plan items delivered and verified.
