# Phase 18: Creative Jazz Trio Playback – Verification

## REQ-TRIO-01: Place-in-Cycle Resolver

- [x] `getPlaceInCycle(currentLoop, totalLoops, logicalBar, planLen, measure?)` returns `intro` | `head` | `solo` | `out head` | `ending`.
- [x] Rules: loop 0 = head (or intro when section label "Intro"); 1..totalLoops-2 = solo; totalLoops-1 = out head; ending from measure marker or last bars.
- [x] useJazzBand computes at beat 0 and stores in `placeInCycleRef.current`.
- [x] Unit tests: `trioContext.test.ts` (head, solo, out head, ending, intro, guard).

## REQ-TRIO-02: Song-Style Tag

- [x] `getSongStyleTag(song, bpm?)` returns Ballad | Medium Swing | Up-tempo | Latin | Bossa | Waltz.
- [x] Mapping: ballad (style/compStyle/tempo < 90), waltz (3/4), bossa, latin, up-tempo (tempo > 190), default Medium Swing.
- [x] useJazzBand computes at beat 0 and stores in `songStyleRef.current`.
- [x] Unit tests: `trioContext.test.ts` (Ballad, Waltz, Bossa, Latin, Up-tempo, default).

## REQ-TRIO-03: Style-Driven Comping

- [x] ReactiveCompingEngine.getTargetDensity accepts optional trioContext; when solo or Ballad, cap at 0.5.
- [x] RhythmEngine.getRhythmPattern accepts placeInCycle/songStyle; balladMode derived for sustain bias.
- [x] useJazzBand passes trioContext into getTargetDensity and placeInCycle/songStyle into getRhythmPattern.

## REQ-TRIO-04: Style-Driven Bass

- [x] Bass half-time when songStyle === 'Ballad' or placeInCycle === 'solo' (extended from ballad first-cycle).
- [x] BassRhythmVariator.applyVariations accepts soloistSpace; when true, no push/skip/rake.
- [x] useJazzBand passes soloistSpace into applyVariations and uses needsHalfTimeBass for half-time line.

## REQ-TRIO-05: Style-Driven Drums

- [x] DrumEngine.generateBar accepts optional trioContext; when solo or Ballad, effectiveDensity capped at 0.5.
- [x] useJazzBand passes trioContext into generateBar.

## REQ-TRIO-06: Soloist-Space Policy

- [x] When place === 'solo' or style === 'Ballad': comping density cap 0.5, RhythmEngine sustain bias, bass variation 0 (soloistSpace), drums density cap 0.5, half-time bass.
- [x] isSoloistSpace(placeInCycle, songStyle) used for applyVariations and half-time condition.

## REQ-TRIO-07: Cross-Instrument Interaction

- [x] Piano density → drums simplify: existing listenerAdjustment in DrumEngine (pianoDensity > 0.8 → -0.3).
- [x] Solo place → all reduce: trioContext passed to comping, drums, bass; density cap and sustain/variation applied.
- [x] Out head: not capped (only solo/Ballad cap), so band can build when activity high.

## REQ-TRIO-08: Band Loop Integration

- [x] useJazzBand computes placeInCycle and songStyleTag once per bar at beat 0 (before Question–Answer and BASS/PIANO/DRUMS).
- [x] Same refs (placeInCycleRef.current, songStyleRef.current) passed to ReactiveCompingEngine, RhythmEngine, DrumEngine, BassRhythmVariator in the same beat-0 block.
- [x] No duplicate computation; single source of truth.

## Hybrid / Backward Compatibility

- [x] Existing balladMode, activity, tuneProgress, tuneIntensity unchanged.
- [x] Engines accept optional trio params; when omitted, behaviour unchanged (getCompingHitsForBar, etc., do not pass trioContext).
- [x] Old concept preserved; upgrade is additive only.
