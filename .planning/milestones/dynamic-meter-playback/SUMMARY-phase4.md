# Phase 4: Bass & Drums Adaptation – Summary

## Done

### Bass (DMP-07)

- **JazzTheoryService**: `generateWaltzWalkingLine(currentChord, nextChord, lastNote): number[]` – 3 notes (Root, chord tone toward 5th/3rd, 5th or chord tone). Used when `beatsPerBar === 3`.
- **BassRhythmVariator**: Loop uses `line.length` instead of hardcoded 4; Push only when `numBeats === 4 && i === 3`. Velocities use `bebopVelocities[i] ?? 0.85` for 3-note lines.
- **useJazzBand**: When `beat === 0` and `beatsPerBar === 3`, call `generateWaltzWalkingLine` and `applyVariations(line, ...)`; else existing legacy/engine path.

### Drums (DMP-08)

- **LinearDrummingEngine**: `WALTZ_GRID = ["0:0:0", "0:1:0", "0:2:0"]`. `generatePhrase(barIndex, intensity, divisionsPerBar?)` – when `divisionsPerBar === 3` use waltz grid and hi-hat on 2 & 3; else standard grid and hi-hat on 2 & 4. `selectPhraseMask(..., gridLen)` supports `gridLen === 3` for waltz.
- **DrumEngine**: `generateBar(..., divisionsPerBar?)`; when `barIndex !== undefined` pass `divisionsPerBar` to `generatePhrase`; when 3/4 skip 4/4 fills (use phrase only).
- **useJazzBand**: Pass `beatsPerBar` as last argument to `drumEngineRef.current.generateBar(..., beatsPerBar)`.

### Comping (DMP-12)

- No code change: loop already uses `state` from `positionToPlaybackState(positionString, m)` where `m` is meter-for-bar (Phase 3), so `beatsPerBar`, `beat`, `lastBeat` are correct for comping and piano pattern.

## Requirements

- DMP-07: Walking bass uses waltz pattern in 3/4 ✅
- DMP-08: Drums use waltz ride (1, 2, 3) in 3/4 ✅
- DMP-12: Comping receives meter-for-bar from Phase 3 ✅

## Next

Phase 5: Lead sheet visuals (bar width by meter, meter marker at change bars, beat highlight by current bar).
