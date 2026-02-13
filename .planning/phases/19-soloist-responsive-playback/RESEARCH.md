# Phase 19: Soloist-Responsive Playback — Research

## What We Need to Plan Well

1. **Soloist activity derivation**: How to turn SwiftF0 pitch/onset into a 0–1 “how much the soloist is playing” value.
2. **Steering formula**: How to combine existing activity (BPM/tune intensity) with soloist activity so the band leaves more space when soloist plays more and fills when soloist rests.
3. **Integration points**: Where to read pitch store and where to apply steering without changing engine APIs.

---

## 1. Soloist Activity from SwiftF0

**Source**: `useITMPitchStore.getLatestPitch()` returns `{ frequency, clarity, rms, onset }`. SwiftF0 and MPM feed the store; no new pitch stack.

**Options**:

- **A. “Has pitch” duty cycle**: Poll every 50–100 ms. Over a rolling window (e.g. last 1–2 s), count the fraction of samples where `frequency > 0 && clarity > 0.8`. That fraction is soloist activity 0–1. Simple; robust to single-note sustains and sparse playing.
- **B. Onset rate**: If `onset` is a discrete event (e.g. 1 on new note, 0 otherwise), count onsets per bar (or per second) and normalize to 0–1 (e.g. cap at N onsets per bar → 1). Captures “how busy” (notes per bar) but may miss long sustains.
- **C. Hybrid**: Use duty cycle as base and optionally boost when onset rate is high (e.g. `activity = 0.7 * dutyCycle + 0.3 * min(1, onsetRate / 8)`).

**Recommendation**: Start with **A** (duty cycle) for v1; window 1–2 s, sample every 100 ms, bounded buffer (e.g. 20 samples). No engine or store API changes.

---

## 2. Steering Formula (Effective Activity)

**Current**: `effectiveActivity = activityLevelSignal.value * (0.3 + 0.7 * tuneIntensity)`; then `activity = effectiveActivity` is passed to comping, drums, bass.

**Goal**: When soloist-responsive is on, **steer** so:
- High soloist activity → **lower** band activity (more space).
- Low soloist activity → **normal** or slightly higher band activity (more backing).

**Options**:

- **Linear steer**: `steeredActivity = baseActivity * (1 - k * soloistActivity)` with `k` in (0.5, 1]. E.g. `k = 0.7`: when soloist = 1, band activity = 0.3 * base; when soloist = 0, band activity = base.
- **Blend**: `steeredActivity = baseActivity * (1 - soloistActivity * 0.6) + 0.1` so band never goes to zero and slightly fills when soloist rests.
- **Smooth**: Apply low-pass or exponential smoothing to soloistActivity before steering to avoid sudden jumps (optional v1; can add in follow-up).

**Recommendation**: Use **linear steer** with `k = 0.6–0.7` so band clearly leaves space when soloist is busy and returns to baseline when soloist is silent. No changes to place-in-cycle, song-style, or trio context—only the numeric `activity` passed to engines is steered.

---

## 3. Integration Points

- **Toggle**: `soloistResponsiveEnabledSignal` in jazzSignals; default false. UI (Mixer or band panel) toggles it.
- **Soloist activity**: `soloistActivitySignal` in jazzSignals, updated by a hook (e.g. `useSoloistActivity`) that polls `useITMPitchStore.getState().getLatestPitch()` on an interval and runs `soloistActivityFromPitch`. Hook can live in JazzKillerModule or a parent that has mic context; when toggle is on and store is ready, activity is non-zero when user plays.
- **Band loop**: In useJazzBand, after computing `effectiveActivity`, if `soloistResponsiveEnabledSignal.value` then `activity = effectiveActivity * (1 - k * soloistActivitySignal.value)` (or equivalent); else `activity = effectiveActivity`. Pass `activity` to ReactiveCompingEngine, RhythmEngine, DrumEngine, BassRhythmVariator as today. No engine API or logic changes.

---

## 4. Out of Scope (v1)

- Changing tempo or bar structure based on soloist.
- Pitch-based “follow the soloist’s notes” (only activity level).
- User-editable sensitivity/smoothing sliders (can be v2).
