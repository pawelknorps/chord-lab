---
phase: 20
name: Jazz Band Comping Evolution (Smart Pattern Engine)
milestone: .planning/milestones/jazz-band-comping-evolution/
waves: 4
dependencies: [
  "Phase 10: State-Machine Rhythmic Phrasing (RhythmEngine)",
  "Phase 11: Pro Drum Engine (DrumEngine.generateBar, generateFill)",
  "Phase 18: Creative Jazz Trio Playback (placeInCycle, songStyle)",
  "Phase 19: Soloist-Responsive Playback (optional: density for MarkovBridge)",
  "ReactiveCompingEngine, useJazzBand, WalkingBassEngine, BassRhythmVariator"
]
principle: "Use old patterns; incorporate whole current implementation. No deletion of pattern library; add Markov layer and humanization on top."
files_modified: [
  "src/core/theory/RhythmEngine.ts",
  "src/modules/JazzKiller/hooks/useJazzBand.ts"
]
files_created: [
  "src/core/theory/JazzMarkovEngine.ts"
]
---

# Phase 20 Plan: Jazz Band Comping Evolution (Smart Pattern Engine)

**Focus**: Integrate the Smart Pattern Engine into the **current implementation** using **mostly existing patterns**. Old patterns (RhythmEngine templates, DrumEngine time/fill, ReactiveCompingEngine density) stay; add Markov selection, humanization, and procedural lead-ins on top.

**Success Criteria**:
- REQ-JBCE-01: Existing RhythmEngine templates tagged with PatternType (LOW / MEDIUM / HIGH); FILL handled via drums + minimal comp.
- REQ-JBCE-02: JazzMarkovEngine returns next pattern type every 4–8 bars; FILL never repeats.
- REQ-JBCE-03: useJazzBand requests pattern type from Markov and passes bias into RhythmEngine; when FILL, uses DrumEngine.generateFill.
- REQ-JBCE-04–06: Humanization at schedule time (bass micro-timing, piano velocity blur, drum ghost probability).
- REQ-JBCE-07–08: Last eighth of bar bass note is procedural (approach to next chord root).

---

## Context (Existing Implementation – Preserved)

- **RhythmEngine**: Keeps `RHYTHM_TEMPLATES` and all 12 template names; keeps `getRhythmPattern(bpm, energy, patternOptions)` with history, repetition penalty, transition matrix. **Add**: tagging map (template name → PatternType) and optional `patternTypeBias` in options to **filter** candidates only.
- **DrumEngine**: Keeps `generateBar` and `generateFill(barIndex)`; no API change. useJazzBand **chooses** generateFill when Markov type is FILL.
- **ReactiveCompingEngine**: Unchanged; density continues to drive comping style.
- **useJazzBand**: Same loop and refs; **add** Markov ref, call every 4 bars, pass patternTypeBias, FILL → generateFill, humanization in scheduling, procedural last eighth for bass.

---

## Wave 1: Pattern Tagging and Markov Engine (REQ-JBCE-01, REQ-JBCE-02, REQ-JBCE-03)

*Goal: Tag existing RhythmEngine templates with PatternType; add JazzMarkovEngine; wire into useJazzBand so pattern type biases selection and FILL triggers drum fill.*

### 20.1 – Tagging Existing Templates (REQ-JBCE-01)

- <task id="W1-T1">**PatternType and map**  
  Define `PatternType = 'LOW_ENERGY' | 'MEDIUM_ENERGY' | 'HIGH_ENERGY' | 'FILL'`. Add `RHYTHM_TEMPLATE_TO_PATTERN_TYPE: Record<RhythmTemplateName, PatternType>` in RhythmEngine (or a shared types file): Sustain, BalladPad → LOW_ENERGY; Standard, RedGarland, Driving, LateLanding, BackbeatPhrase → MEDIUM_ENERGY; BebopClassic, WyntonKelly, MonkMinimal, TheSkip, ThroughTheBar → HIGH_ENERGY. FILL has no piano template (handled in 20.3).</task>

- <task id="W1-T2">**RhythmEngine patternTypeBias**  
  Extend `RhythmPatternOptions` with optional `patternTypeBias?: PatternType`. In `getRhythmPattern`, when `patternTypeBias` is set and not FILL, filter the `options` array to only templates where `RHYTHM_TEMPLATE_TO_PATTERN_TYPE[name] === patternTypeBias`. When `patternTypeBias === 'FILL'`, restrict to a single minimal comp pattern (e.g. one step at 0:0:0) or a dedicated “fill bar” pattern so piano doesn’t compete with drums. All existing weight/repetition/transition logic runs **within** the filtered set.</task>

### 20.2 – JazzMarkovEngine (REQ-JBCE-02, REQ-JBCE-03)

- <task id="W1-T3">**JazzMarkovEngine class**  
  Create `src/core/theory/JazzMarkovEngine.ts`. State: `currentType: PatternType` (default LOW_ENERGY or MEDIUM_ENERGY). Transition matrix: row = current, column = next; e.g. LOW → [0.70, 0.20, 0.05, 0.05], FILL → [0.40, 0.40, 0.20, 0.00] (no FILL→FILL). Method `getNextPatternType(): PatternType` — sample from row, update currentType, return. Optional: `updateIntensity(density: number)` to temporarily bias matrix (for Phase 4). Keep computation &lt;1ms.</task>

- <task id="W1-T4">**useJazzBand: Markov every 4 bars**  
  In useJazzBand, add `markovEngineRef = useRef(new JazzMarkovEngine())` and `markovPatternTypeRef = useRef<PatternType>('MEDIUM_ENERGY')`. In the Transport loop at beat 0, when `bar % 4 === 0` (or 8), set `markovPatternTypeRef.current = markovEngineRef.current.getNextPatternType()`.</task>

- <task id="W1-T5">**Pass patternTypeBias and FILL drums**  
  When calling `getRhythmPattern`, add `patternTypeBias: markovPatternTypeRef.current` to options. When `markovPatternTypeRef.current === 'FILL'`, set `currentDrumHitsRef.current = drumEngineRef.current.generateFill(bar)` instead of `generateBar(...)`. Otherwise keep existing generateBar call. Ensure piano gets FILL comp pattern (minimal) when type is FILL.</task>

**Verification Wave 1**: Unit test JazzMarkovEngine (transition probabilities, no FILL→FILL). In band loop, after 16 bars, pattern type varies; on FILL bar, drums use generateFill and piano uses minimal pattern. No regression when patternTypeBias is not passed (existing behaviour).

---

## Wave 2: Stochastic Humanization (REQ-JBCE-04, REQ-JBCE-05, REQ-JBCE-06)

*Goal: Apply micro-timing, velocity variation, and ghost probability at schedule time only; no change to pattern data or engine APIs.*

### 20.3 – Bass Micro-Timing (REQ-JBCE-04)

- <task id="W2-T1">**Bass schedule-time offset**  
  In useJazzBand, where bass time is computed (`bassTime = time + offsetTime + bassTiming + ...`), add a per-note random offset in range −5 ms to +2 ms: e.g. `bassTime += (Math.random() * 7 - 5) / 1000`. Do not change WalkingBassEngine or BassRhythmVariator output.</task>

### 20.4 – Piano Velocity Humanization (REQ-JBCE-05)

- <task id="W2-T2">**Piano velocity variation**  
  In useJazzBand, where piano velocity is passed to `triggerAttackRelease` (or equivalent), multiply by `0.9 + Math.random() * 0.2` (±10%) so no two hits are identical. Do not change RhythmEngine or CompingEngine.</task>

### 20.5 – Drum Ghost-Note Probability (REQ-JBCE-06)

- <task id="W2-T3">**Drum ghost probability gate**  
  In useJazzBand, in the loop that schedules drum hits, if hit velocity &lt; threshold (e.g. 0.4), with probability 0.6 skip scheduling that hit (`Math.random() < 0.6` → continue). Apply only at schedule time; DrumEngine output unchanged.</task>

**Verification Wave 2**: Audibly, bass/piano/drums show slight timing and velocity variation; ghost notes (low-velocity) sometimes absent. No change to pattern content or engine return values.

---

## Wave 3: Procedural Lead-In (REQ-JBCE-07, REQ-JBCE-08)

*Goal: Last eighth of bar bass note is computed as approach to next chord root; reuse existing approach logic.*

### 20.6 – Procedural Last-Eighth Note (REQ-JBCE-07, REQ-JBCE-08)

- <task id="W3-T1">**getProceduralLeadInNote helper**  
  Implement a function that returns a single bass note (MIDI) as chromatic or dominant approach to the next chord’s root. Signature e.g. `getProceduralLeadInNote(currentChordSymbol: string, nextChordSymbol: string, lastBassMidi: number): number`. Reuse logic from WalkingBassEngine or JazzTheoryService (approach strategies). Place in `src/core/theory/WalkingBassEngine.ts` as static/helper or in JazzKiller utils.</task>

- <task id="W3-T2">**Override last eighth in useJazzBand**  
  In useJazzBand bass scheduling, when the current event’s time is the last eighth of the bar (e.g. `0:3:2` in 4/4, or last note of half-time bar), replace `event.note` with `getProceduralLeadInNote(currentChord, nextChord, lastBassNoteRef.current)`. Use currentChord/nextChord from the same band loop context. Keep timing and duration from the walking line.</task>

**Verification Wave 3**: Last eighth of bar (e.g. beat 3 and 2) bass note clearly leads into the next chord root; no regression for half-time or 3/4 (define “last eighth” appropriately). Unit test for getProceduralLeadInNote with known chord pairs.

---

## Wave 4 (Optional): RhythmicDensityTracker + MarkovBridge (REQ-JBCE-09, REQ-JBCE-10)

*Goal: When soloist-responsive is on, bias Markov matrix by soloist density (HIGH when dense, LOW when sparse).*

### 20.7 – Density Bias (REQ-JBCE-09, REQ-JBCE-10)

- <task id="W4-T1">**MarkovBridge / updateIntensity**  
  In JazzMarkovEngine, implement `updateIntensity(density: number)` (or equivalent) that temporarily biases the transition matrix: density &gt; 0.75 → favor HIGH_ENERGY next; density &lt; 0.3 → favor LOW_ENERGY; else MEDIUM. Use either a copy of the matrix or a “bias overlay” so transitions stay smooth (no instant flip). Call from useJazzBand when soloist-responsive is on, before getNextPatternType(), using soloistActivitySignal.value as density (or a dedicated RhythmicDensityTracker in a follow-up).</task>

- <task id="W4-T2">**Wire density into band loop**  
  In useJazzBand at the same beat-0 block where Markov is called, when soloistResponsiveEnabledSignal.value is true, call markovEngineRef.current.updateIntensity(soloistActivitySignal.value) (or density from RhythmicDensityTracker) before getNextPatternType(). Optional: add RhythmicDensityTracker class (4 s onset window, getDensity()) in a later task if notes-per-second style is required.</task>

**Verification Wave 4**: With soloist-responsive on and high soloist activity, pattern type shifts toward HIGH over time; with low activity, toward LOW. No regression when soloist-responsive is off.

---

## Verification (Phase Goal)

- **Integration**: All existing RhythmEngine templates, DrumEngine generateBar/generateFill, ReactiveCompingEngine, and useJazzBand flow remain in use; no removal of old patterns.
- **Markov**: Pattern type (LOW/MEDIUM/HIGH/FILL) changes every 4–8 bars; FILL never consecutive; piano and drums respect type.
- **Humanization**: Bass/piano/drums show micro-timing and velocity variation; drum ghosts sometimes dropped.
- **Procedural lead-in**: Last eighth bass note is approach to next chord.
- **Regression**: With feature flag or patternTypeBias omitted, behaviour matches current Phase 19.

---

## Next Steps

1. Execute Wave 1 (tagging, JazzMarkovEngine, useJazzBand wiring).
2. Execute Wave 2 (humanization at schedule time).
3. Execute Wave 3 (procedural lead-in).
4. Optionally execute Wave 4 (density bias).
5. Update `.planning/milestones/jazz-band-comping-evolution/STATE.md` and add VERIFICATION.md.

Recommend running **`/gsd-execute-phase 20`** to start implementation (Wave 1).
