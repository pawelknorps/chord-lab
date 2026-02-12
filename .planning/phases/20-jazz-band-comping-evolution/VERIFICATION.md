# Phase 20: Jazz Band Comping Evolution – Verification

## Success Criteria (from ROADMAP)

- [x] **REQ-JBCE-01**: Patterns tagged with type (LOW / MEDIUM / HIGH); FILL handled via drums + minimal comp.
- [x] **REQ-JBCE-02**: Markov engine returns next type every 4 bars; FILL never repeats (0% self-transition).
- [x] **REQ-JBCE-03**: useJazzBand requests pattern type and passes bias; when FILL, uses DrumEngine.generateFill.
- [x] **REQ-JBCE-04**: Bass micro-timing −5 ms to +2 ms at schedule time.
- [x] **REQ-JBCE-05**: Piano velocity ±10% at schedule time.
- [x] **REQ-JBCE-06**: Drum ghost-note probability gate (velocity &lt; 0.4 → 60% play).
- [x] **REQ-JBCE-07–08**: Last eighth of bar bass note is procedural (getProceduralLeadInNote).
- [x] **REQ-JBCE-09–10**: When soloist-responsive is on, updateIntensity(density) biases Markov before getNextPatternType().

## Manual Checks

1. **Markov**: Play JazzKiller for 16+ bars; pattern type should vary (LOW/MEDIUM/HIGH/FILL). On FILL bars, drums should play a fill and piano a single chord on 1.
2. **Humanization**: Bass/piano/drums should show slight timing and velocity variation; some ghost drum hits should be absent.
3. **Procedural lead-in**: Last eighth of bar (e.g. beat 3 and 2) bass note should lead into the next chord root (chromatic or 5th approach).
4. **Soloist-responsive**: With Call-and-Response on and high soloist activity, band should shift toward higher energy over time; with low activity, toward lower.

## Regression

- With **patternTypeBias** not passed (e.g. if Markov were disabled), RhythmEngine and band loop behave as before Phase 20 (all templates eligible, no FILL-forced drums). No API change required for engines beyond optional params.

## Unit Tests

- RhythmEngine.test.ts and DrumEngine.test.ts pass. JazzMarkovEngine can be unit-tested in a follow-up (transition probabilities, no FILL→FILL). getProceduralLeadInNote can be tested with known chord pairs.
