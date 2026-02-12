# Jazz Band Comping Evolution – Roadmap

## Phase 1: Markov Pattern Engine and Tagging

**Focus**: Introduce pattern types and Markov-based selection so the band does not play one pattern for 32 bars.

- **Success Criteria**: Patterns are tagged with type (LOW / MEDIUM / HIGH / FILL); Markov engine returns next type and a concrete pattern per bar (or per 4/8 bars); FILL never repeats; transition &lt;1ms.
- **Tasks**:
  - [ ] **REQ-JBCE-01**: Tag pattern library (or subset) with `type: PatternType` and optional energy/connectivity.
  - [ ] **REQ-JBCE-02**: Implement Markov transition matrix and `getNextPatternType()` / `getPatternForBar()` (or equivalent).
  - [ ] **REQ-JBCE-03**: Expose selection API so useJazzBand (or band loop) can request next pattern at bar boundary.
- **Deliverables**: JazzMarkovEngine (or equivalent) class; pattern metadata; integration point in band loop.

## Phase 2: Stochastic Humanization

**Focus**: Micro-timing, velocity variation, and ghost-note probability so no two bars sound identical.

- **Success Criteria**: Bass notes have micro-timing offset (−5ms to +2ms); comping velocities vary (±10%); ghost notes play with configurable probability (e.g. 60%); applied at schedule time, not in stored pattern.
- **Tasks**:
  - [ ] **REQ-JBCE-04**: Bass micro-timing offsets at schedule time.
  - [ ] **REQ-JBCE-05**: Piano velocity humanization (Gaussian or ±10%) at schedule time.
  - [ ] **REQ-JBCE-06**: Ghost-note probability gate for snare/hi-hat (or equivalent).
- **Deliverables**: Humanization layer applied when converting pattern to Transport events; no change to pattern library content.

## Phase 3: Procedural Lead-Ins

**Focus**: Last eighth of bar is procedural—chromatic or dominant approach to next chord—so the bass line connects to the harmony.

- **Success Criteria**: Last eighth note of each bar is computed from current/next chord (approach logic); bass line audibly leads into the next chord; reuse WalkingBassEngine / Functional Decomposition logic.
- **Tasks**:
  - [ ] **REQ-JBCE-07**: Implement procedural last-eighth note (chromatic/dominant approach to next chord root).
  - [ ] **REQ-JBCE-08**: Wire currentChord/nextChord from useJazzBand (or band loop) into procedural lead-in; override last eighth of pattern at schedule time.
- **Deliverables**: Procedural lead-in module; integration at bar boundary in band loop.

## Phase 4: Rhythmic Density Tracker and Markov Bridge (Optional)

**Focus**: Band responds to soloist density (SwiftF0 + onset) via RhythmicDensityTracker and MarkovBridge when soloist-responsive mode is on.

- **Success Criteria**: RhythmicDensityTracker maintains 4s onset window and exposes `getDensity()` (0–1); MarkovBridge updates engine matrix (or effective energy) based on density; band shifts toward HIGH when density high, LOW when low; no instant flip; optional—can be disabled.
- **Tasks**:
  - [ ] **REQ-JBCE-09**: Implement RhythmicDensityTracker (SwiftF0 + confidence + pitch jump / RMS; 4s window; getDensity()).
  - [ ] **REQ-JBCE-10**: Implement MarkovBridge (updateBandVibe(tracker, engine)); wire density into Markov engine when soloist-responsive is on.
- **Deliverables**: RhythmicDensityTracker; MarkovBridge; integration with useJazzBand and soloist-responsive toggle.

## Phase 5 (Future): Meter Independence

**Focus**: Store patterns as rhythmic fragments (atoms); recombine for 5/4, 7/8, etc.

- **Success Criteria**: (Deferred) Patterns atomized into 1-beat fragments; recombination rules for 5/4, 7/8; no v1 commitment.
- **Tasks**:
  - [ ] **REQ-JBCE-11**: (Deferred) Rhythmic fragments and recombination; document in REQUIREMENTS.md only.
- **Deliverables**: Design doc or RESEARCH note; implementation in a later milestone.

## Dependencies

- Phase 2 depends on Phase 1 (Markov engine and tagged patterns must exist).
- Phase 3 depends on Phase 1 (band loop must request pattern; lead-in uses same chord context).
- Phase 4 depends on Phase 1 (Markov engine must support matrix bias); optional and can follow Phase 2/3.
- Phase 5 is deferred.

## Success Metrics (Overall)

- Transitions between LOW / MEDIUM / HIGH / FILL are audibly logical; no instant jump from ballad to double-time.
- Humanization: timing and velocity vary; ghost notes breathe.
- Procedural lead-ins: last eighth of bar leads into next chord.
- With density: band shifts energy with soloist density when soloist-responsive is on.
- No regression when feature is off or density not used.
