# Phase 20: Jazz Band Comping Evolution – Research (Integration Context)

**Goal**: Plan how to integrate the Smart Pattern Engine (Markov + humanization + procedural lead-ins) into the **current implementation** using **mostly existing patterns**—no deletion of the old pattern library; the whole old implementation should be incorporated as much as possible.

---

## 1. Where Patterns Live Today

### 1.1 RhythmEngine (`src/core/theory/RhythmEngine.ts`)

- **Pattern library**: `RHYTHM_TEMPLATES` — a single object mapping `RhythmTemplateName` to arrays of `RhythmStep[][]` (multiple variations per template).
- **Template names**: `Standard`, `Sustain`, `BalladPad`, `Driving`, `RedGarland`, `BebopClassic`, `WyntonKelly`, `MonkMinimal`, `TheSkip`, `ThroughTheBar`, `LateLanding`, `BackbeatPhrase`.
- **Selection**: `getRhythmPattern(bpm, energy, patternOptions)` — uses BPM weights, balladMode, placeInCycle, songStyle, energy, **repetition penalty** (last 4 patterns), **transition matrix** (template-to-template bonuses), answerContext, tempo subdivision. Returns `RhythmPattern { name, steps }`.
- **Existing “Markov-like” behaviour**: Already has `transitionMatrix` (e.g. Sustain → Standard 20, Driving → RedGarland 25) and repetition penalty. So we are **not** replacing this; we add a **higher-level band** (LOW / MEDIUM / HIGH / FILL) and **bias** which templates are allowed when that band is active.

**Integration**: Add an optional **pattern type bias** (e.g. `patternTypeBias?: 'LOW_ENERGY' | 'MEDIUM_ENERGY' | 'HIGH_ENERGY' | 'FILL'`). When provided, **filter** the candidate `RhythmTemplateName[]` to only those tagged with that type (see §2). All existing logic (weights, repetition penalty, transition matrix) continues to run **within** that filtered set. No removal of templates.

### 1.2 ReactiveCompingEngine (`src/core/theory/ReactiveCompingEngine.ts`)

- **Patterns**: No named template library; `selectTemplate(density)` returns one of three inline patterns (Red Garland / Bill Evans / Herbie style) based on density.
- **Integration**: No change required for v1. Density is already driven by activity, place-in-cycle, and song style. The Markov layer can influence **effective energy/density** passed into the band (e.g. when pattern type is LOW_ENERGY, we already pass lower density from trio/soloist space). So ReactiveCompingEngine stays as-is; the “pattern type” is expressed via the **density** and **RhythmEngine bias** only.

### 1.3 DrumEngine (`src/core/theory/DrumEngine.ts`)

- **Patterns**: `generateBar(activity, pianoDensity, bar, answerContext, pianoStepTimes, trioContext, beatsPerBar)` produces `DrumHit[]` (ride, snare, kick, hi-hat). **Fill**: `generateFill(barIndex)` already exists (triplet, 8ths, or mixed); used when “a fill is due.”
- **Ghosts**: Ride/snare use velocity to imply ghosted notes (e.g. 0.32–0.36 for skip beats). No explicit “ghost” flag on `DrumHit`; humanization can apply a **probability gate** to low-velocity hits (e.g. velocity &lt; 0.4 → play with 60% probability).
- **Integration**: When the **Markov layer** says current bar is `FILL`, use `drumEngineRef.current.generateFill(bar)` instead of `generateBar(...)` for that bar only. No new fill patterns; use existing `generateFill`. For humanization: in useJazzBand, when scheduling drum hits, apply a probability gate for low-velocity hits (REQ-JBCE-06).

### 1.4 useJazzBand (`src/modules/JazzKiller/hooks/useJazzBand.ts`)

- **Beat 0**: Computes `pianoPattern = rhythmEngineRef.current.getRhythmPattern(bpm, targetDensity, { chordsPerBar, answerContext, balladMode, placeInCycle, songStyle })`; `currentDrumHitsRef.current = drumEngineRef.current.generateBar(...)`. Bass line from WalkingBassEngine / JazzTheoryService + BassRhythmVariator.
- **Scheduling**: Piano: for each step in `currentPatternRef.current.steps`, schedule voicing at step.time; bass: for each event in `walkingLineRef.current` at current beat, schedule with groove micro-timing; drums: iterate `currentDrumHitsRef.current` and schedule.
- **Integration**: (1) Every 4 (or 8) bars, call a **JazzMarkovEngine.getNextPatternType()**; store in a ref. (2) Pass `patternTypeBias: markovPatternTypeRef.current` into `getRhythmPattern(..., { ..., patternTypeBias })`. (3) When type is `FILL`, set `currentDrumHitsRef.current = drumEngineRef.current.generateFill(bar)`. (4) **Humanization**: when computing `bassTime` / piano time / drum time, add a small random offset (bass: −5 to +2 ms); when setting velocity, add ±10% for piano. (5) **Procedural lead-in**: for bass, on the **last eighth** of the bar (e.g. beat 3, sixteenth 2), replace the scheduled note with a single **approach note** to the next chord root (reuse WalkingBassEngine or JazzTheoryService approach logic).

### 1.5 WalkingBassEngine / JazzTheoryService

- **Approach logic**: WalkingBassEngine and JazzTheoryService already have “Beat 4 as approach to next chord root” (chromatic, 5th-of-destination, etc.). Bass line is 4 notes per bar (or 2 for half-time); the **fourth** note is already an approach. For “last eighth procedural,” we can: either (a) ensure the **fourth** note of the walking line is always computed from approach logic (already the case), or (b) add an explicit “last eighth override” in useJazzBand: when scheduling the event at `0:3:2`, replace it with one note from a small helper `getProceduralLeadIn(currentChord, nextChord)` that returns a single approach note (reuse same logic as WalkingBassEngine beat-4).
- **Integration**: Prefer (b) for clarity: one explicit “procedural last eighth” function used only for that slot; rest of the bar unchanged. Reuse chord symbols and approach strategy from existing engines.

---

## 2. Tagging Existing Templates (REQ-JBCE-01)

Map each **RhythmTemplateName** to a **PatternType** so the Markov layer can restrict choice:

| RhythmTemplateName | PatternType   | Rationale |
|--------------------|---------------|-----------|
| Sustain, BalladPad | LOW_ENERGY    | Spaced-out, long notes |
| Standard, RedGarland, Driving, LateLanding, BackbeatPhrase | MEDIUM_ENERGY | Standard swing, Spang-a-lang |
| BebopClassic, WyntonKelly, MonkMinimal, TheSkip, ThroughTheBar | HIGH_ENERGY | Syncopated, busier |
| (FILL: no piano template) | FILL          | Drums only: use generateFill; piano can use MEDIUM or a single sparse stab |

- **FILL**: For piano, when type is FILL we have two options: (1) use a single “space” pattern (e.g. one chord on 1) or (2) keep last bar’s pattern. Recommend (1): pick one predefined “fill bar” comp pattern (e.g. one step at 0:0:0) so piano doesn’t compete with the drum fill. That can be a special case in RhythmEngine when `patternTypeBias === 'FILL'`: only allow a single minimal pattern (or a small subset).

**Implementation**: Add a constant map `RHYTHM_TEMPLATE_TO_PATTERN_TYPE: Record<RhythmTemplateName, PatternType>` (and optionally `PATTERN_TYPE_TO_TEMPLATES: Record<PatternType, RhythmTemplateName[]>`). In `getRhythmPattern`, when `patternTypeBias` is set, filter `options` to only templates where `RHYTHM_TEMPLATE_TO_PATTERN_TYPE[name] === patternTypeBias`. For FILL, either allow only a “minimal” template or use a dedicated one-bar comp pattern.

---

## 3. JazzMarkovEngine (REQ-JBCE-02, REQ-JBCE-03)

- **Responsibility**: State machine over `PatternType` (LOW, MEDIUM, HIGH, FILL). Transition matrix: row = current type, column = next type; FILL → 0% self-repeat.
- **Invocation**: Every **4 bars** (or 8) in useJazzBand at beat 0: e.g. `if (bar % 4 === 0) markovPatternTypeRef.current = markovEngineRef.current.getNextPatternType()`.
- **Output**: `getNextPatternType(): PatternType`; optionally `getPatternForBar()` is not needed if we only pass the **type** into RhythmEngine and DrumEngine (type drives bias + fill vs time).
- **Placement**: New file e.g. `src/core/theory/JazzMarkovEngine.ts` (or under `src/modules/JazzKiller/` if preferred). useJazzBand holds a ref and calls it every 4 bars.

**Existing behaviour preserved**: RhythmEngine still does all its internal weighting and history; we only **narrow** the set of templates it can pick from. DrumEngine still generates time or fill; we only **choose** between generateBar and generateFill based on type.

---

## 4. Humanization (REQ-JBCE-04, REQ-JBCE-05, REQ-JBCE-06)

- **Bass micro-timing**: Already have `grooveRef.current.getMicroTiming(bpm, "Bass")` and offbeat offset. **Add** a per-note random offset in range −5 ms to +2 ms (e.g. `bassTime += (Math.random() * 7 - 5) / 1000`). Apply in useJazzBand where bass time is computed; do not change WalkingBassEngine or line content.
- **Piano velocity**: When scheduling piano, use `velocity * (0.9 + Math.random() * 0.2)` (or Gaussian) so ±10% variation. Apply in useJazzBand at the point where velocity is passed to `triggerAttackRelease`; do not change RhythmEngine or CompingEngine.
- **Ghost-note probability (drums)**: When scheduling a drum hit, if velocity &lt; threshold (e.g. 0.4), with probability 0.6 skip the hit (do not schedule). Apply in useJazzBand in the drum scheduling loop; do not change DrumEngine output, only the **schedule** side.

All three are **additive at schedule time**; no change to stored pattern data or engine APIs beyond optional params if needed.

---

## 5. Procedural Lead-In (REQ-JBCE-07, REQ-JBCE-08)

- **When**: Last eighth of the bar = e.g. beat index 3, sixteenth 2 (time `0:3:2` in 4/4). In useJazzBand, when emitting bass events for beat 3 and the event’s time is `0:3:2`, **replace** that event’s note with a single **approach note** to the next chord root.
- **How**: Implement `getProceduralLeadInNote(currentChordSymbol, nextChordSymbol, lastBassMidi): { note: number }` (or reuse WalkingBassEngine’s approach logic for one note). Use currentChord/nextChord from the same measure/next measure as already available in the band loop.
- **Integration**: In the bass scheduling loop in useJazzBand, when `event.time === '0:3:2'` (or equivalent for last eighth), substitute `event.note` with the result of getProceduralLeadInNote; keep timing and duration from the line. If the bar has only 2 notes (half-time), last eighth may be the second note; define “last eighth” as “last note of the bar” for simplicity.

---

## 6. Optional: RhythmicDensityTracker + MarkovBridge (Phase 4)

- **RhythmicDensityTracker**: New class; receives SwiftF0/pitch store output (or reuse soloist activity from Phase 19); maintains 4 s onset window; exposes `getDensity(): number` (0–1).
- **MarkovBridge**: When soloist-responsive is on, call `markovEngine.updateIntensity(density)` (or equivalent) before `getNextPatternType()` so the transition matrix is biased toward HIGH when density &gt; 0.75, toward LOW when &lt; 0.3. JazzMarkovEngine must support **temporary matrix bias** (or a separate “effective” matrix) so we don’t flip state instantly.
- **Integration**: useJazzBand already reads soloistActivitySignal when soloist-responsive is on. We can either (a) use that same signal as “density” for the Markov bridge, or (b) add RhythmicDensityTracker that feeds a density value and use it when pattern type is chosen. (a) is simpler and reuses Phase 19; (b) is closer to the milestone spec (notes-per-second style). Plan can defer (b) to a later wave and use (a) first.

---

## 7. Files to Touch (Summary)

- **New**: `src/core/theory/JazzMarkovEngine.ts` (or `src/modules/JazzKiller/utils/JazzMarkovEngine.ts`); optionally `getProceduralLeadInNote` in WalkingBassEngine or a small helper in JazzKiller utils.
- **Modified**: `src/core/theory/RhythmEngine.ts` (add pattern type tagging map, add `patternTypeBias` to options, filter candidates); `src/modules/JazzKiller/hooks/useJazzBand.ts` (Markov every 4 bars, pass bias, FILL → generateFill, humanization in schedule, procedural last eighth for bass).
- **Unchanged in v1**: ReactiveCompingEngine (no API change); DrumEngine (no change except caller chooses generateBar vs generateFill); WalkingBassEngine (approach logic reused, not replaced). All existing RHYTHM_TEMPLATES and drum fill logic stay.

---

## 8. Verification (High Level)

- **Markov**: After 16+ bars, pattern type (LOW/MEDIUM/HIGH/FILL) changes over time; FILL appears occasionally and never twice in a row; piano templates stay within the chosen type.
- **Humanization**: Bass/piano/drums do not sound perfectly gridded; velocity and timing vary slightly.
- **Procedural lead-in**: Last eighth of bar (e.g. 0:3:2) bass note clearly leads into the next chord root.
- **Regression**: With a switch or feature flag off, behaviour matches current Phase 19 (no Markov bias, no humanization, no procedural override) so existing behaviour is preserved.
