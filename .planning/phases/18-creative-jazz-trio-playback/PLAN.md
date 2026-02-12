---
phase: 18
name: Creative Jazz Trio Playback Modelling
waves: 3
dependencies: ["Phase 10: State-Machine Rhythmic Phrasing (RhythmEngine)", "Phase 11: Pro Drum Engine (DrumEngine)", "Phase 12: Walking Bass Engine (WalkingBassEngine, BassRhythmVariator)", "ReactiveCompingEngine", "useJazzBand (playback loop, tuneProgress, activity)"]
files_modified: [
  "src/modules/JazzKiller/hooks/useJazzBand.ts",
  "src/modules/JazzKiller/state/jazzSignals.ts (optional: placeInCycleSignal, songStyleSignal)",
  "src/core/theory/RhythmEngine.ts",
  "src/core/theory/ReactiveCompingEngine.ts",
  "src/core/theory/DrumEngine.ts",
  "src/core/theory/WalkingBassEngine.ts",
  "src/core/theory/BassRhythmVariator.ts"
]
files_created: [
  "src/modules/JazzKiller/utils/placeInCycle.ts (or trioContext.ts)",
  "src/modules/JazzKiller/utils/songStyleTag.ts (or same file as placeInCycle)"
]
---

# Phase 18 Plan: Creative Jazz Trio Playback Modelling

**Focus**: Push the limits of modelling jazz trio playing—band adapts to **place in the cycle**, **song type**, **inter-instrument interaction**, and **space for the soloist** (especially in ballads).

**Success Criteria**:
- REQ-TRIO-01: Place-in-cycle resolver (loopCount, playback plan, section labels) → intro | head | solo | out head | ending; available at beat 0 in band loop.
- REQ-TRIO-02: Song-style tag (Rhythm, CompStyle, Tempo, TimeSignature) → Ballad | Medium Swing | Up-tempo | Latin | Bossa | Waltz; available in band loop.
- REQ-TRIO-03: RhythmEngine (or ReactiveCompingEngine) uses style and place for pattern choice (sustain/sparse for ballad, standard for medium, etc.).
- REQ-TRIO-04: Bass uses style and place (ballad → half-time/pedal, low variation; Latin/Bossa/Waltz when applicable).
- REQ-TRIO-05: DrumEngine uses style and place (ballad → brushes/light; medium → ride 2 and 4; Latin/Bossa/Waltz when applicable).
- REQ-TRIO-06: Soloist-space policy: when place is solo or style is Ballad, cap density, bias sustain, reduce bass variation.
- REQ-TRIO-07: Cross-instrument interaction: piano density → drums simplify; solo place → all reduce density; out head/last chorus + high activity → can build.
- REQ-TRIO-08: Band loop computes place + style once per bar and passes them into all engines.

---

## Context (Existing Assets)

- **useJazzBand**: Loop at beat 0 has currentLoop, totalLoopsSignal, planLen, logicalBar, measureIndex, measure (with sectionLabel on first of section), song (style, compStyle, TimeSignature, Tempo), tuneProgress, tuneIntensity, activityLevelSignal, bpmSignal.
- **Engines**: RhythmEngine.getRhythmPattern(bpm, targetDensity, { chordsPerBar, answerContext, balladMode }); ReactiveCompingEngine.getTargetDensity(activity, bassMode); DrumEngine.generateBar(activity, pianoDensity, bar, answerContext, pianoSteps); WalkingBassEngine + BassRhythmVariator (activity, ballad first cycle). balladMode already derived from song style/compStyle.
- **Signals**: activityLevelSignal, tuneProgressSignal, tuneIntensitySignal, bpmSignal, loopCountSignal, totalLoopsSignal; song ref in loop.
- **Research**: See RESEARCH.md for place-in-cycle mapping, song-style mapping, and engine API extensions.

---

## Wave 1: Place-in-Cycle and Style Tag (REQ-TRIO-01, REQ-TRIO-02)

*Goal: Resolver and style tag computed from playback state and song metadata; exposed in band loop at beat 0.*

### 18.1 – Place-in-Cycle Resolver (REQ-TRIO-01)

- <task id="W1-T1">**Resolver function**  
  Implement `getPlaceInCycle(currentLoop, totalLoops, logicalBar, planLen, measure?)` in JazzKiller utils (e.g. `placeInCycle.ts` or `trioContext.ts`). Input: current chorus index, total choruses, bar index within chorus, bars per chorus, optional measure (sectionLabel, endingNumber, isFirstOfEnding). Output: `'intro' | 'head' | 'solo' | 'out head' | 'ending'`. Rules: loop 0 = head (or intro if first section label "Intro" and logicalBar &lt; 8); loops 1..totalLoops-2 = solo; loop totalLoops-1 = out head; last 2–4 bars of last chorus or measure with ending marker = ending. Return single role per bar.</task>

- <task id="W1-T2">**Optional signal/ref**  
  Expose place-in-cycle in band loop: either compute at beat 0 and store in a ref (e.g. placeInCycleRef.current) or write to placeInCycleSignal. useJazzBand must have access to currentLoop, totalLoops, logicalBar, planLen, and measure when calling resolver.</task>

### 18.2 – Song-Style Tag (REQ-TRIO-02)

- <task id="W2-T3">**Style tag function**  
  Implement `getSongStyleTag(song, bpm?)` in JazzKiller utils. Input: song (style, compStyle, TimeSignature, Tempo), optional current BPM. Output: `'Ballad' | 'Medium Swing' | 'Up-tempo' | 'Latin' | 'Bossa' | 'Waltz'`. Mapping: Ballad if style/compStyle contains "ballad" or tempo &lt; 90; Waltz if TimeSignature 3/4; Bossa if "bossa"; Latin if "latin"/"samba"/"mambo" (and not Bossa); Up-tempo if tempo &gt; 190; default Medium Swing. Use song.Tempo or bpm when provided.</task>

- <task id="W2-T4">**Wire style into band loop**  
  In useJazzBand, when song is set or at first bar of playback, compute songStyleTag once (or per bar if BPM can change) and store in ref or signal (e.g. songStyleRef.current or songStyleSignal). Ensure band loop at beat 0 can read current placeInCycle and songStyleTag.</task>

### 18.3 – Band Loop Integration (REQ-TRIO-08, partial)

- <task id="W1-T5">**Compute and pass at beat 0**  
  In useJazzBand loop, at beat === 0: call getPlaceInCycle(currentLoop, totalLoopsSignal.value, logicalBar, planLen, measure) and getSongStyleTag(song, bpm) (or read from ref if set on load). Store in refs or signals. Pass placeInCycle and songStyleTag into RhythmEngine, ReactiveCompingEngine, DrumEngine, and bass logic in the same beat-0 block (Wave 2/3 will consume them).</task>

**Verification Wave 1**: Place-in-cycle and style tag are computed and available inside the band loop at beat 0; unit tests for getPlaceInCycle and getSongStyleTag with fixed inputs.

---

## Wave 2: Style-Driven Engines (REQ-TRIO-03, REQ-TRIO-04, REQ-TRIO-05)

*Goal: RhythmEngine, ReactiveCompingEngine, DrumEngine, and bass logic use style tag and place-in-cycle for distinct behaviour (Ballad vs Medium vs Latin/Waltz).*

### 18.4 – Style-Driven Comping (REQ-TRIO-03)

- <task id="W2-T1">**ReactiveCompingEngine density cap**  
  Extend getTargetDensity(activity, bassMode) with optional placeInCycle and songStyle. When placeInCycle === 'solo' or songStyle === 'Ballad', cap returned density (e.g. Math.min(targetDensity, 0.5)). Return capped value so RhythmEngine receives lower target density in ballad/solo.</task>

- <task id="W2-T2">**RhythmEngine pattern choice**  
  Extend getRhythmPattern(bpm, targetDensity, options) with optional placeInCycle and songStyle (and soloistSpaceCap if needed). When songStyle === 'Ballad' or placeInCycle === 'solo', bias toward Sustain/Pedal patterns (e.g. increase weight for sustain, decrease for driving). When songStyle === 'Up-tempo', allow lighter, more anticipations. When songStyle === 'Waltz', use 3-beat patterns if RhythmEngine supports them. Keep balladMode in options for backward compatibility; can derive from songStyle === 'Ballad'.</task>

### 18.5 – Style-Driven Bass (REQ-TRIO-04)

- <task id="W2-T3">**Bass feel and variation**  
  In useJazzBand bass block at beat 0: pass placeInCycle and songStyleTag (or songStyle ref) into bass logic. When songStyle === 'Ballad' or placeInCycle === 'solo', use half-time walk (existing ballad first-cycle logic can extend to full ballad and solo); set bass variation probability to 0 or very low. When songStyle === 'Medium Swing', keep current variation probability; when 'Up-tempo' and activity high, allow existing skip/rake. For Waltz (3/4), ensure walking line has 3 notes per bar (WalkingBassEngine or note choice already may respect meter). Latin/Bossa: optional v1 stub (two-feel or bossa pattern) or defer to Phase 18 follow-up.</task>

### 18.6 – Style-Driven Drums (REQ-TRIO-05)

- <task id="W2-T4">**DrumEngine style and place**  
  Extend DrumEngine.generateBar(activity, pianoDensity, bar, answerContext, pianoSteps) with optional placeInCycle and songStyle. When songStyle === 'Ballad' or placeInCycle === 'solo', use lighter pattern set (e.g. fewer ride hits, sparser kick/snare; or "brushes" mode if implemented). When songStyle === 'Medium Swing', keep current behaviour. When songStyle === 'Up-tempo', keep collaborative simplification when piano dense. Latin/Bossa/Waltz: optional v1 stub (different groove) or defer. Goal: drums do not overpower ballads and solo sections.</task>

**Verification Wave 2**: Ballad vs Medium Swing tune: comping and bass feel are audibly distinct; in ballad, density is lower and sustain favoured; unit tests for getTargetDensity cap and RhythmEngine options when style is Ballad.

---

## Wave 3: Soloist Space and Cross-Instrument Interaction (REQ-TRIO-06, REQ-TRIO-07, REQ-TRIO-08)

*Goal: Soloist-space policy applied when place is solo or style is Ballad; cross-instrument rules coherent; single computation of place + style per bar.*

### 18.7 – Soloist-Space Policy (REQ-TRIO-06)

- <task id="W3-T1">**Density cap and sustain bias**  
  When placeInCycle === 'solo' OR songStyle === 'Ballad', apply soloist space: (1) ReactiveCompingEngine.getTargetDensity already capped in Wave 2; (2) RhythmEngine bias toward Sustain/Pedal (Wave 2); (3) Bass variation probability 0 or very low (Wave 2); (4) optional: half-time or pedal bass for full ballad and solo choruses. Ensure no "wall of comping" in ballad or solo—density cap enforced and sustain favoured.</task>

- <task id="W3-T2">**Document soloist-space rules**  
  In code or RESEARCH.md, document: when place === 'solo' or style === 'Ballad', max comping density 0.5 (or configured), RhythmEngine sustain bias, bass variation 0, optional half-time bass. Same rules used by all three instruments.</task>

### 18.8 – Cross-Instrument Interaction (REQ-TRIO-07)

- <task id="W3-T3">**Piano density → drums simplify**  
  Confirm existing behaviour: when piano density is high (&gt; 0.8), DrumEngine already simplifies. No change if already present; otherwise ensure DrumEngine receives piano density and reduces hit count when high.</task>

- <task id="W3-T4">**Solo place → all reduce density**  
  When placeInCycle === 'solo', all three (piano, bass, drums) already receive place and style; comping density capped, bass variation low, drums lighter (Wave 2). Verify that all three react to place 'solo' consistently.</task>

- <task id="W3-T5">**Out head / last chorus build**  
  When placeInCycle === 'out head' and activity/tuneIntensity high, allow band to build (e.g. do not over-cap density; allow slightly higher variation or density than in solo). Optional: isLastChorus flag to engines for "build" feel. Document in RESEARCH or PLAN.</task>

### 18.9 – Band Loop Integration Complete (REQ-TRIO-08)

- <task id="W3-T6">**Single computation per bar**  
  Ensure useJazzBand computes placeInCycle and songStyleTag once per bar (at beat 0) and passes them into RhythmEngine, ReactiveCompingEngine, DrumEngine, WalkingBassEngine, and BassRhythmVariator. All engines use these inputs in addition to activity, tension, BPM. No duplicate computation; single source of truth.</task>

- <task id="W3-T7">**Optional unit tests**  
  Add unit tests for getPlaceInCycle (e.g. loop 0 → head, loop 1 with totalLoops 4 → solo, loop 3 → out head; last 2 bars of last chorus → ending) and getSongStyleTag (ballad by tempo, ballad by style, medium swing default, waltz by 3/4). Optional: integration test that loads a tune and runs one chorus, asserting place transitions.</task>

**Verification Wave 3**: In ballad or solo section, comping density capped and sustain favoured; trio feels coherent (piano/drums/bass respond to form and energy); one place-in-cycle and one style tag per bar used by all engines.

---

## Verification Summary

| Requirement   | Verification |
|---------------|--------------|
| REQ-TRIO-01   | getPlaceInCycle returns correct role for loop/bar; unit tests. |
| REQ-TRIO-02   | getSongStyleTag returns correct tag for song/BPM; unit tests. |
| REQ-TRIO-03   | Comping density and pattern choice vary by style and place; ballad/sparse in solo. |
| REQ-TRIO-04   | Bass feel and variation vary by style and place; ballad = half-time, low variation. |
| REQ-TRIO-05   | Drums lighter in ballad/solo; style-appropriate feel. |
| REQ-TRIO-06   | In ballad/solo: density cap, sustain bias, bass variation 0. |
| REQ-TRIO-07   | Piano density → drums simplify; solo → all reduce; out head can build. |
| REQ-TRIO-08   | Place + style computed once per bar at beat 0 and passed to all engines. |

---

## Out of Scope (v1)

- User-editable "band personality" or "space level" sliders.
- Full Latin/Bossa/Waltz pattern sets (stubs or basic support only).
- New stem sets or samples per style.
- AI soloist that the band follows.
