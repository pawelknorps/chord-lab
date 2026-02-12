# Phase 20: Jazz Band Comping Evolution – Summary

## Completed

Phase 20 (Smart Pattern Engine) was executed in four waves. The **existing implementation** (RhythmEngine templates, DrumEngine, ReactiveCompingEngine, useJazzBand) was **preserved**; a Markov layer and humanization were added on top.

### Wave 1: Pattern Tagging and Markov Engine (REQ-JBCE-01–03)

- **PatternType** and **RHYTHM_TEMPLATE_TO_PATTERN_TYPE** added in `RhythmEngine.ts`: Sustain/BalladPad → LOW_ENERGY; Standard/RedGarland/Driving/LateLanding/BackbeatPhrase → MEDIUM_ENERGY; BebopClassic/WyntonKelly/MonkMinimal/TheSkip/ThroughTheBar → HIGH_ENERGY.
- **RhythmPatternOptions.patternTypeBias** added; when set, `getRhythmPattern` filters candidates to that type and zeros weights for others. When `patternTypeBias === 'FILL'`, returns minimal comp (one step at 0:0:0).
- **JazzMarkovEngine** (`src/core/theory/JazzMarkovEngine.ts`): transition matrix (LOW/MEDIUM/HIGH/FILL), FILL → 0% self-repeat; `getNextPatternType()`; `updateIntensity(density)` for soloist-responsive bias.
- **useJazzBand**: `markovEngineRef`, `markovPatternTypeRef`; every 4 bars at beat 0 calls `getNextPatternType()` and, when soloist-responsive is on, `updateIntensity(soloistActivitySignal.value)`. Passes `patternTypeBias` into `getRhythmPattern`. When type is FILL, uses `drumEngineRef.current.generateFill(bar)` instead of `generateBar`.
- **DrumEngine**: public `generateFill(barIndex)` added, delegating to `linearEngine.generateFill`.

### Wave 2: Stochastic Humanization (REQ-JBCE-04–06)

- **Bass**: Per-note micro-timing offset −5 ms to +2 ms; velocity ±10% at schedule time in useJazzBand.
- **Piano**: Final velocity multiplied by `0.9 + Math.random() * 0.2` at schedule time.
- **Drums**: For hits with velocity &lt; 0.4, 60% probability gate (skip scheduling) at schedule time.

### Wave 3: Procedural Lead-In (REQ-JBCE-07–08)

- **JazzTheoryService.getProceduralLeadInNote(currentChord, nextChord, lastBassMidi)**: returns one bass note as chromatic or dominant approach to next chord root (reuses approach logic).
- **useJazzBand**: When bass event time is last eighth (`0:3:2` in 4/4 or `0:2:2` in 3/4), `event.note` is replaced with `getProceduralLeadInNote(currentChord, nextChord, lastBassNoteRef.current)`.

### Wave 4: MarkovBridge (REQ-JBCE-09–10)

- Implemented in Wave 1: `JazzMarkovEngine.updateIntensity(density)` biases matrix (HIGH when density &gt; 0.75, LOW when &lt; 0.3). useJazzBand calls it before `getNextPatternType()` when `soloistResponsiveEnabledSignal.value` is true.

## Files Touched

- **New**: `src/core/theory/JazzMarkovEngine.ts`
- **Modified**: `src/core/theory/RhythmEngine.ts`, `src/core/theory/index.ts`, `src/core/theory/DrumEngine.ts`, `src/modules/JazzKiller/hooks/useJazzBand.ts`, `src/modules/JazzKiller/utils/JazzTheoryService.ts`

## Verification

- See `VERIFICATION.md` for manual and regression checks.
- No removal of existing patterns; all RHYTHM_TEMPLATES and DrumEngine behaviour retained. When `patternTypeBias` is omitted, behaviour matches pre–Phase 20.
