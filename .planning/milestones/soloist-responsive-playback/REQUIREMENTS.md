# Soloist-Responsive Playback – Requirements

## Phase 1: Toggle and Soloist Activity Derivation

### REQ-SRP-01: Soloist-Responsive Toggle

- **Requirement**: Implement a persistent setting (signal or user preference) that enables or disables soloist-responsive mode.
- **Behaviour**: When off (default), band behaviour is unchanged from current Phase 18 (place-in-cycle, song style, activity from BPM/tune intensity only). When on, band density/space is also influenced by soloist activity from SwiftF0.
- **Integration**: Expose via a signal (e.g. `soloistResponsiveEnabledSignal`) so useJazzBand and UI can read/write it; optional persistence (e.g. localStorage or user settings).

### REQ-SRP-02: Soloist Activity from SwiftF0

- **Requirement**: Derive a **soloist activity** value (0–1) from the existing SwiftF0 pipeline (useITMPitchStore / useHighPerformancePitch).
- **Input**: Pitch presence (getLatestPitch with confidence), optional onset events (useHighPerformancePitch onset stream).
- **Output**: A single 0–1 value representing “how much the soloist is playing” over a short window (e.g. last N seconds or last bar). High when user is playing more and faster; low when user is silent or sparse.
- **Implementation**: Small module or hook (e.g. `useSoloistActivity` or `soloistActivityFromPitch`) that polls or subscribes to pitch store and optionally onset; computes rolling activity (e.g. onset count per bar, or “has pitch” duty cycle); writes to a signal or ref consumed by the band loop.
- **Integration**: Expose via signal or ref (e.g. `soloistActivitySignal`) so useJazzBand can read it when toggle is on.

### REQ-SRP-03: Graceful Fallback When No Mic

- **Requirement**: When soloist-responsive is on but no microphone stream is available (or pitch store not initialized), treat soloist activity as “low” (or ignore and use existing activity only) so the band does not break.
- **Goal**: Toggle can be on without mic; band behaves as if soloist is resting (more backing). When mic is connected and playing, band reacts.

## Phase 2: Band Loop Integration

### REQ-SRP-04: Effective Activity in Band Loop

- **Requirement**: When soloist-responsive is on, useJazzBand (or shared band loop) computes an **effective activity** that combines (or overrides) existing activity (BPM/tune intensity) with soloist activity.
- **Behaviour**: High soloist activity → lower effective activity for band density (more space). Low soloist activity → normal or slightly higher effective activity (more backing). Exact formula is implementation-defined (e.g. invert soloist activity for “space” or blend with existing activity).
- **Goal**: Comping density, drum density, and bass variation probability respond to soloist activity when toggle is on.

### REQ-SRP-05: Trio Engines Receive Effective Activity

- **Requirement**: ReactiveCompingEngine, DrumEngine, RhythmEngine, and BassRhythmVariator receive the effective activity (and optional soloist-space override) when soloist-responsive is on.
- **Behaviour**: Same engines as Phase 18; no new engine APIs required if effective activity is passed as the existing “activity” or “density” input. Optionally pass a “soloist is playing” flag to tighten soloist-space policy (e.g. cap density more when soloist is playing).
- **Goal**: Band leaves more space when user plays more/faster; plays more backing when user plays less.

### REQ-SRP-06: No Regression When Toggle Off

- **Requirement**: When soloist-responsive is off, band behaviour is identical to current implementation (Phase 18). No change to activityLevelSignal, place-in-cycle, or song-style logic.
- **Goal**: Existing users and flows are unaffected.

## Phase 3: UI and Verification

### REQ-SRP-07: Toggle UI

- **Requirement**: A UI control (e.g. in Mixer or band panel) allows the user to turn soloist-responsive mode on or off. Label clearly (e.g. “Soloist-Responsive” or “Call-and-Response”).
- **Goal**: Feature is discoverable and opt-in.

### REQ-SRP-08: Verification and Documentation

- **Requirement**: Document behaviour in STATE.md or VERIFICATION.md; optional manual test steps (toggle on, play busily → band gets sparser; toggle on, rest → band fills; toggle off → no change).
- **Goal**: Milestone is verifiable and maintainable.

## Out of Scope (v1)

- Changing tempo or bar structure based on soloist.
- Pitch-based “follow the soloist’s notes” (only activity level).
- User-editable sensitivity or smoothing sliders (can be v2).

## Summary Table

| ID | Requirement | Phase |
|----|-------------|--------|
| REQ-SRP-01 | Soloist-responsive toggle | 1 |
| REQ-SRP-02 | Soloist activity from SwiftF0 | 1 |
| REQ-SRP-03 | Graceful fallback when no mic | 1 |
| REQ-SRP-04 | Effective activity in band loop | 2 |
| REQ-SRP-05 | Trio engines receive effective activity | 2 |
| REQ-SRP-06 | No regression when toggle off | 2 |
| REQ-SRP-07 | Toggle UI | 3 |
| REQ-SRP-08 | Verification and documentation | 3 |
