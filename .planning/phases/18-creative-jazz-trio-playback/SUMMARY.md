# Phase 18: Creative Jazz Trio Playback – Summary

## Approach: Hybrid (Back Up Old System, Upgrade Additively)

Per user request: **never get rid of the old concept—just upgrade it.** All changes are additive:

- **Existing** `balladMode`, `activity`, `tuneProgress`, `tuneIntensity`, and engine behaviour remain.
- **New** place-in-cycle and song-style are computed at beat 0 and passed as **optional** params; when omitted, engines behave exactly as before.
- **Soloist space** (density cap, sustain bias, bass variation 0) is applied when place is `solo` or style is `Ballad`, in addition to existing ballad-first-cycle logic.

## Wave 1: Place-in-Cycle and Style Tag

- **trioContext.ts** (new): `getPlaceInCycle(currentLoop, totalLoops, logicalBar, planLen, measure?)` → `intro` | `head` | `solo` | `out head` | `ending`; `getSongStyleTag(song, bpm?)` → `Ballad` | `Medium Swing` | `Up-tempo` | `Latin` | `Bossa` | `Waltz`; `isSoloistSpace(place, style)`.
- **useJazzBand**: At beat 0, compute `placeInCycleRef.current` and `songStyleRef.current`; store in refs so the rest of the bar and engines can read them. No removal of existing logic.

## Wave 2: Style-Driven Engines (Optional Params)

- **ReactiveCompingEngine.getTargetDensity(activity, bassMode, trioContext?)**: When `placeInCycle === 'solo'` or `songStyle === 'Ballad'`, return `Math.min(lastBarDensity, 0.5)`. Otherwise unchanged.
- **RhythmEngine.getRhythmPattern(..., options)**: Added `placeInCycle?`, `songStyle?` to options. `balladMode = opts.balladMode || opts.placeInCycle === 'solo' || opts.songStyle === 'Ballad'`. Existing `balladMode` still works.
- **DrumEngine.generateBar(..., trioContext?)**: Optional 6th param; when solo or Ballad, `effectiveDensity = Math.min(effectiveDensity, 0.5)`.
- **BassRhythmVariator.applyVariations(..., soloistSpace?)**: Optional 6th param; when true, pushChance = 0, skipChanceMultiplier = 0, no rake.
- **useJazzBand**: Passes `trioContext` into getTargetDensity, getRhythmPattern, generateBar; passes `soloistSpace` into applyVariations; extends ballad half-time condition to `songStyle === 'Ballad' || placeInCycle === 'solo'`.

## Wave 3: Soloist Space and Cross-Instrument

- **Soloist space**: Applied via same trio context in all engines (density cap, sustain bias, bass variation 0, half-time bass when Ballad or solo).
- **Cross-instrument**: Piano density → drums simplify (existing); solo place → all three reduce density (via trioContext); out head does not get capped so band can build.
- **Single computation**: Place and style computed once per bar at beat 0; same refs passed to comping, bass, and drums.

## Files Touched

| File | Change |
|------|--------|
| `src/modules/JazzKiller/utils/trioContext.ts` | **New**: getPlaceInCycle, getSongStyleTag, isSoloistSpace. |
| `src/modules/JazzKiller/utils/trioContext.test.ts` | **New**: Unit tests for trio context. |
| `src/modules/JazzKiller/hooks/useJazzBand.ts` | Refs for place/style at beat 0; pass trio context into engines; extend half-time condition. |
| `src/core/theory/ReactiveCompingEngine.ts` | getTargetDensity optional trioContext; cap when solo/Ballad. |
| `src/core/theory/RhythmEngine.ts` | RhythmPatternOptions placeInCycle, songStyle; balladMode derived from them. |
| `src/core/theory/DrumEngine.ts` | generateBar optional trioContext; cap effectiveDensity when solo/Ballad. |
| `src/core/theory/BassRhythmVariator.ts` | applyVariations optional soloistSpace; no push/skip/rake when true. |

## Verification

- Unit tests: `trioContext.test.ts` (getPlaceInCycle, getSongStyleTag, isSoloistSpace).
- Manual: Ballad vs Medium Swing; head vs solo vs out head (density/style differ; ballad and solo leave space).
- Backward compatibility: Callers that do not pass trio context get unchanged behaviour.
