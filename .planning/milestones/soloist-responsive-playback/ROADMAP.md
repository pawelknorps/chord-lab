# Soloist-Responsive Playback – Roadmap

## Phase 1: Toggle and Soloist Activity Derivation

**Focus**: Add the toggle and derive soloist activity from SwiftF0.

- **Success Criteria**: Toggle exists (default off); soloist activity (0–1) is computed from pitch/onset and exposed via signal or ref; no mic → activity treated as low.
- **Tasks**:
  - [ ] **REQ-SRP-01**: Implement `soloistResponsiveEnabledSignal` (or equivalent); wire to UI later.
  - [ ] **REQ-SRP-02**: Implement soloist-activity derivation (e.g. `useSoloistActivity` or `soloistActivityFromPitch`) using useITMPitchStore / useHighPerformancePitch; output 0–1; expose via `soloistActivitySignal` or ref.
  - [ ] **REQ-SRP-03**: When no mic or pitch store not ready, soloist activity = 0 (or ignore in band loop).
- **Deliverables**: New signal(s) in jazzSignals or equivalent; small soloist-activity module/hook; integration point for useJazzBand.

## Phase 2: Band Loop Integration

**Focus**: Wire soloist activity into useJazzBand to **steer** (not replace) band density/space. Existing band rules stay intact.

- **Success Criteria**: When toggle on, effective activity is steered by soloist activity so comping, drums, and bass leave more space when soloist plays more and fill when soloist rests; same engines and rules as Phase 18; when toggle off, behaviour unchanged.
- **Tasks**:
  - [ ] **REQ-SRP-04**: In useJazzBand loop, when soloist-responsive is on, compute effective activity by steering existing activity with soloist activity (e.g. blend; high soloist → lower band density). Do not replace place-in-cycle, song style, or trio context.
  - [ ] **REQ-SRP-05**: Pass effective activity to ReactiveCompingEngine, DrumEngine, RhythmEngine, BassRhythmVariator as the existing “activity”/“density” input; no engine API or logic changes—only steer the input value.
  - [ ] **REQ-SRP-06**: Ensure when toggle off, no code path uses soloist activity; regression test or manual check.
- **Deliverables**: useJazzBand reads toggle + soloist activity; effective activity steers band; all existing band rules intact; no regression when off.

## Phase 3: UI and Verification

**Focus**: Expose toggle in UI and document behaviour.

- **Success Criteria**: User can turn soloist-responsive on/off from Mixer or band panel; behaviour is documented and verifiable.
- **Tasks**:
  - [ ] **REQ-SRP-07**: Add toggle control (e.g. “Soloist-Responsive” or “Call-and-Response”) in Mixer or band settings; bind to `soloistResponsiveEnabledSignal`.
  - [ ] **REQ-SRP-08**: Update STATE.md and optional VERIFICATION.md with test steps and expected behaviour.
- **Deliverables**: Toggle UI; STATE.md and optional VERIFICATION.md updated.

## Dependencies

- Phase 2 depends on Phase 1 (toggle and soloist activity must exist).
- Phase 3 depends on Phase 2 (band integration done before promoting UI).

## Success Metrics (Overall)

- Toggle on + user playing busily → comping/drums/bass density decrease vs toggle off.
- Toggle on + user silent/sparse → band density normal or slightly higher.
- Toggle off → behaviour identical to current Phase 18.
- Toggle discoverable in UI; no regression when mic unavailable.
