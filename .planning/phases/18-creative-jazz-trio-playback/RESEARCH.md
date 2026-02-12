# Phase 18: Creative Jazz Trio Playback – Research

## What We Need to Plan Well

1. **Place-in-cycle**: How to derive "intro / head / solo / out head / ending" from playback state and song structure.
2. **Song-style mapping**: How Rhythm, CompStyle, Tempo (and time signature) map to Ballad, Medium Swing, Up-tempo, Latin, Bossa, Waltz.
3. **Existing band loop**: Where place and style are computed and consumed (useJazzBand, signals, engines).
4. **Engine APIs**: What RhythmEngine, DrumEngine, WalkingBassEngine, BassRhythmVariator, ReactiveCompingEngine already accept and what to add.

---

## 1. Place-in-Cycle Conventions

**Source of truth**: `useJazzBand` loop has:

- `currentLoop` = Math.floor(bar / planLen) (0-based chorus index).
- `totalLoopsSignal.value` = total choruses (e.g. 4).
- `planLen` = bars per chorus (playbackPlan.length).
- `logicalBar` = bar % planLen (position within chorus).
- `measure` = s.music.measures[measureIndex]; measure can have `sectionLabel` (first measure of section only, from JazzSection.Label), `isFirstOfSection`, `endingNumber`, `isFirstOfEnding`, `isEndRepeat`.

**Proposed mapping** (no change to song data):

- **intro**: Optional. If the first section has label "Intro" (or similar), and currentLoop === 0 and logicalBar in first 4–8 bars, treat as intro. Otherwise first chorus can be "head."
- **head**: currentLoop === 0 (first chorus). Optionally restrict to "melody" sections by sectionLabel (A, B, etc.) if we want head vs solo within same chorus later.
- **solo**: currentLoop >= 1 && currentLoop < totalLoops - 1 (middle choruses). Standard: choruses 2..N-1 are "solo" for typical AABA.
- **out head**: currentLoop === totalLoops - 1 (last chorus). Optionally same as head but with "out" feel (can allow slightly more density if desired).
- **ending**: Last 2–4 bars of last chorus (logicalBar >= planLen - 4) or any measure with sectionLabel/endingNumber indicating ending. Optional: detect "Ending" section in playbackPlan.

**Output**: Single role per bar, e.g. `PlaceInCycle = 'intro' | 'head' | 'solo' | 'out head' | 'ending'`. Optional: `isFirstChorus`, `isLastChorus` booleans for engines that want them.

**Implementation**: Standalone resolver function `getPlaceInCycle(currentLoop, totalLoops, logicalBar, planLen, measure?)` in JazzKiller utils (e.g. `placeInCycle.ts` or `trioContext.ts`). No new signals required for v1 if we compute at beat 0 and pass into engines; optional `placeInCycleSignal` for UI/debug.

---

## 2. Song-Style Tag

**Inputs** (from song / playback):

- `song.style` (Rhythm from iReal, e.g. "Swing", "Ballad", "Bossa Nova", "Latin").
- `song.compStyle` (CompStyle from iReal, optional, e.g. "Ballad", "Medium Swing").
- `song.TimeSignature` (e.g. "3/4", "4/4").
- Tempo: `song.Tempo` or current `bpmSignal.value`.

**Proposed mapping**:

- **Ballad**: (style or compStyle contains "ballad" case-insensitive) OR (tempo < 90 and style doesn’t force Latin).
- **Waltz**: TimeSignature === "3/4" (or numerator 3).
- **Bossa**: style or compStyle contains "bossa" / "bossa nova".
- **Latin**: style or compStyle contains "latin" / "samba" / "afro" / "mambo" (and not Bossa if we want Bossa separate).
- **Up-tempo**: tempo > 190 (or > 180) and not Ballad.
- **Medium Swing**: default when none of the above; also explicit "Medium" in compStyle or 90 <= tempo <= 190.

**Output**: `SongStyleTag = 'Ballad' | 'Medium Swing' | 'Up-tempo' | 'Latin' | 'Bossa' | 'Waltz'`. Default `'Medium Swing'`.

**Implementation**: `getSongStyleTag(song, bpm?)` in JazzKiller utils; call once when song loads or at start of playback, store in ref or signal so band loop reads it each bar.

---

## 3. Existing Band Loop (useJazzBand)

- **Beat 0 (bar start)**: Piano pattern and drum hits are chosen; bass line is generated. This is where we must pass `placeInCycle` and `songStyleTag` (and optionally apply soloist-space cap).
- **Signals already used**: activityLevelSignal, tuneIntensitySignal, tuneProgressSignal, bpmSignal, bassModeSignal; song ref (s) has style, compStyle, TimeSignature, music.measures, music.playbackPlan.
- **Engines**: RhythmEngine.getRhythmPattern(bpm, targetDensity, { chordsPerBar, answerContext, balladMode }); DrumEngine.generateBar(activity, pianoDensity, bar, drumsAnswerContext, pianoSteps); WalkingBassEngine + BassRhythmVariator; ReactiveCompingEngine.getTargetDensity(activity, bassMode). balladMode is already derived from s?.style === 'Ballad' || compStyle includes 'ballad'.
- **Gap**: No place-in-cycle yet; no style tag (only ballad boolean); no explicit soloist-space cap or density cap by place.

---

## 4. Engine APIs (Current and Needed)

- **RhythmEngine**: getRhythmPattern(bpm, targetDensity, { chordsPerBar, answerContext, balladMode }). Add: `placeInCycle?`, `songStyle?`, `soloistSpaceCap?` (max density 0..1). balladMode can be replaced or supplemented by songStyle === 'Ballad' and placeInCycle === 'solo'.
- **ReactiveCompingEngine**: getTargetDensity(activity, bassMode). Add: `placeInCycle?`, `songStyle?`; when solo or Ballad, cap returned density (e.g. min(targetDensity, 0.5)).
- **DrumEngine**: generateBar(activity, pianoDensity, bar, answerContext, pianoSteps). Add: `placeInCycle?`, `songStyle?`; ballad → lighter pattern set; Latin/Bossa → different groove (future); Waltz → 3/4.
- **WalkingBassEngine / BassRhythmVariator**: Already take activity and optional ballad (half-time). Add: `placeInCycle?`, `songStyle?`; ballad/solo → half-time or pedal, low variation probability; Waltz → 3 notes per bar (if not already handled by meter).
- **Band loop**: At beat 0, compute placeInCycle and read songStyleTag (from ref/signal); pass into all engines; apply density cap when soloist space is on.

---

## 5. Pitfalls

- **Section labels**: iReal sections may not have "Intro" or "Ending" labels; rely on loop index and position-in-chorus for intro/head/solo/out head/ending to avoid dependency on chart metadata.
- **Tempo source**: Prefer current BPM (bpmSignal) for style so user tempo changes are reflected; fallback to song.Tempo when BPM not yet set.
- **Backward compatibility**: Adding optional parameters (placeInCycle, songStyle) to engines keeps existing behaviour when not passed; default to current behaviour.
- **Testing**: Unit tests for getPlaceInCycle and getSongStyleTag with fixed inputs; integration test: load tune, run one chorus, assert place goes head → (solo if totalLoops > 2) → out head / ending.

---

## Summary

- **Place-in-cycle**: Derive from currentLoop, totalLoops, logicalBar, planLen, optional measure.sectionLabel; resolver returns one role per bar.
- **Song-style**: Derive from song.style, song.compStyle, TimeSignature, tempo; return one tag, default Medium Swing.
- **Integration**: Compute place + style at bar start in useJazzBand; pass into RhythmEngine, ReactiveCompingEngine, DrumEngine, bass logic; add soloist-space cap (density cap + sustain bias) when place === 'solo' or style === 'Ballad'.
- **Engines**: Extend APIs with optional placeInCycle and songStyle (and density cap); keep defaults so existing behaviour is unchanged when not provided.
