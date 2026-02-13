---
phase: 19
name: Soloist-Responsive Playback (Call-and-Response)
waves: 3
dependencies: ["Phase 18: Creative Jazz Trio Playback (place-in-cycle, song-style, soloist space)", "useITMPitchStore / useHighPerformancePitch (SwiftF0)", "useJazzBand (effectiveActivity, activity → comping/drums/bass)"]
files_modified: [
  "src/modules/JazzKiller/state/jazzSignals.ts",
  "src/modules/JazzKiller/hooks/useJazzBand.ts",
  "src/modules/JazzKiller/components/Mixer.tsx"
]
files_created: [
  "src/modules/JazzKiller/hooks/useSoloistActivity.ts",
  "src/modules/JazzKiller/utils/soloistActivityFromPitch.ts"
]
---

# Phase 19 Plan: Soloist-Responsive Playback (Call-and-Response)

**Focus**: Add an **experimental toggle** so the playback engine listens to the soloist via SwiftF0 and **steers** the band in real time—more space when the user plays more/faster, more backing when the user plays less. **Existing band rules stay intact**; additive only.

**Success Criteria**:
- REQ-SRP-01: Toggle exists (default off); band behaviour unchanged when off.
- REQ-SRP-02: Soloist activity (0–1) derived from SwiftF0 (pitch/onset); exposed via signal or ref.
- REQ-SRP-03: No mic or pitch store not ready → soloist activity treated as low (band fills).
- REQ-SRP-04: When toggle on, useJazzBand computes effective activity by **steering** existing activity with soloist activity (high soloist → lower band density; low soloist → normal or slightly higher).
- REQ-SRP-05: Same engines receive steered effective activity; no engine API or logic changes.
- REQ-SRP-06: Toggle off → behaviour identical to Phase 18.
- REQ-SRP-07: Toggle UI in Mixer or band panel.
- REQ-SRP-08: STATE.md / VERIFICATION.md updated.

---

## Context (Existing Assets)

- **useJazzBand**: Already computes `effectiveActivity = activityLevelSignal.value * (0.3 + 0.7 * tuneIntensity)` and `activity = effectiveActivity`; passes `activity` to comping, drums, bass. Place-in-cycle and song-style (Phase 18) computed at beat 0; trio engines receive activity, placeInCycle, songStyle, soloistSpace.
- **useITMPitchStore**: `getLatestPitch()` returns `{ frequency, clarity, rms, onset }`. SwiftF0 and MPM feed the store. No API changes required.
- **jazzSignals**: activityLevelSignal, tuneIntensitySignal, etc. Add soloistResponsiveEnabledSignal and soloistActivitySignal (or ref updated by a hook).
- **Design principle**: Do not replace place-in-cycle, song style, or trio context logic. Only **steer** the activity value passed into the same engines.

---

## Wave 1: Toggle and Soloist Activity Derivation (REQ-SRP-01, REQ-SRP-02, REQ-SRP-03)

*Goal: Toggle signal (default off); soloist activity (0–1) computed from pitch/onset and exposed; no mic → activity low.*

### 19.1 – Toggle Signal (REQ-SRP-01)

- <task id="W1-T1">**Add soloistResponsiveEnabledSignal**  
  In `src/modules/JazzKiller/state/jazzSignals.ts`, add `soloistResponsiveEnabledSignal = signal(false)`. Export it. Optional: persist to localStorage on change and read on load so preference survives refresh.</task>

### 19.2 – Soloist Activity from SwiftF0 (REQ-SRP-02)

- <task id="W1-T2">**soloistActivityFromPitch module**  
  Create `src/modules/JazzKiller/utils/soloistActivityFromPitch.ts`. Implement a function or small class that, given a way to read the latest pitch (e.g. `getLatestPitch: () => { frequency, clarity, rms, onset } | null`), computes a 0–1 **soloist activity** over a short window. Options: (a) rolling “has pitch” duty cycle (e.g. sample every 50–100 ms, count fraction of samples where `frequency > 0 && clarity > 0.8` over last ~1–2 s), or (b) rolling onset count per bar (if onset events are available) normalized to 0–1. Output: number in [0, 1]. High when user is playing more/faster; low when silent or sparse. Use a bounded buffer (e.g. last 20–40 samples at 50 ms) to avoid unbounded growth.</task>

- <task id="W1-T3">**soloistActivitySignal and update loop**  
  Add `soloistActivitySignal = signal(0)` in `jazzSignals.ts`. Create `src/modules/JazzKiller/hooks/useSoloistActivity.ts`: when JazzKiller (or a parent that has mic) mounts and optionally when soloist-responsive is on, start a short interval (e.g. 100 ms) or use rAF to poll `useITMPitchStore.getState().getLatestPitch()`, feed result into `soloistActivityFromPitch`, and set `soloistActivitySignal.value` to the computed activity. When unmounted or toggle off, clear the interval and optionally set soloistActivitySignal to 0. Ensure the hook does not require a MediaStream internally—it only reads from the global pitch store (which may or may not be initialized).</task>

### 19.3 – Graceful Fallback When No Mic (REQ-SRP-03)

- <task id="W1-T4">**No mic → low activity**  
  In `soloistActivityFromPitch` or in the consumer: when `getLatestPitch()` returns null (store not initialized) or store `isReady === false`, treat soloist activity as 0. In useJazzBand, when reading soloistActivitySignal, if soloist-responsive is on but pitch store is not ready, use soloist activity 0 (band fills). No throw; band keeps playing.</task>

**Verification Wave 1**: Toggle and soloistActivitySignal exist; with mic and playing, soloistActivitySignal increases; with no mic or silent, it stays 0 (or low). No regression when toggle is off.

---

## Wave 2: Band Loop Integration — Steer Effective Activity (REQ-SRP-04, REQ-SRP-05, REQ-SRP-06)

*Goal: When toggle on, effective activity is steered by soloist activity so band leaves more space when user plays more and fills when user rests; same engines; toggle off = unchanged.*

### 19.4 – Steer Effective Activity in useJazzBand (REQ-SRP-04, REQ-SRP-05)

- <task id="W2-T1">**Read toggle and soloist activity**  
  In `useJazzBand.ts`, import `soloistResponsiveEnabledSignal` and `soloistActivitySignal` (or read from jazzSignals). Inside the Tone.Loop callback, after computing the current `effectiveActivity = activityLevelSignal.value * (0.3 + 0.7 * tuneIntensity)`, **when** `soloistResponsiveEnabledSignal.value === true`, compute a **steered** effective activity: e.g. `steeredActivity = effectiveActivity * (1 - k * soloistActivitySignal.value)` with `k` in (0.5–1] so high soloist activity reduces band density, or use a blend that leaves more space when soloist is high and keeps or slightly raises when soloist is low. Do not replace place-in-cycle, song-style, or any other refs/signals; only replace the `activity` variable that is passed to comping, drums, and bass with this steered value when toggle is on.</task>

- <task id="W2-T2">**Pass steered activity to engines**  
  Where `activity` is currently passed to ReactiveCompingEngine, RhythmEngine, DrumEngine, and BassRhythmVariator, use the steered activity when toggle is on (otherwise keep existing `activity`). No changes to engine function signatures or to placeInCycleRef, songStyleRef, soloistSpace logic—only the numeric `activity` (or effectiveActivity) passed in is steered.</task>

### 19.5 – No Regression When Toggle Off (REQ-SRP-06)

- <task id="W2-T3">**Toggle off path**  
  When `soloistResponsiveEnabledSignal.value === false`, do not read soloistActivitySignal; use the existing formula `activity = activityLevelSignal.value * (0.3 + 0.7 * tuneIntensity)` only. No code path that modifies activity when toggle is off.</task>

**Verification Wave 2**: With toggle on and user playing busily, comping/drums/bass become sparser; with toggle on and user silent, band fills. With toggle off, behaviour identical to current Phase 18 (manual or regression check).

---

## Wave 3: UI and Verification (REQ-SRP-07, REQ-SRP-08)

*Goal: Toggle discoverable in UI; behaviour documented.*

### 19.6 – Toggle UI (REQ-SRP-07)

- <task id="W3-T1">**Mixer or band panel control**  
  In `src/modules/JazzKiller/components/Mixer.tsx` (or the band/settings panel that already exposes activity or similar), add a labelled control: e.g. “Soloist-Responsive” or “Call-and-Response” (toggle or checkbox). Bind checked state to `soloistResponsiveEnabledSignal.value` and call `soloistResponsiveEnabledSignal.value = !soloistResponsiveEnabledSignal.value` on change. Ensure useSoloistActivity (or the update loop for soloistActivitySignal) is active when JazzKiller is mounted so that when the user turns the toggle on, activity can be computed (mic may already be on from ITM or another module).</task>

### 19.7 – Documentation and Verification (REQ-SRP-08)

- <task id="W3-T2">**STATE.md and VERIFICATION.md**  
  Update `.planning/milestones/soloist-responsive-playback/STATE.md` with phase progress when waves are done. Add or update `.planning/phases/19-soloist-responsive-playback/VERIFICATION.md` with manual test steps: (1) Toggle off → play; band behaviour unchanged. (2) Toggle on, no mic → band fills. (3) Toggle on, play busily into mic → band gets sparser. (4) Toggle on, rest → band fills. (5) Toggle discoverable in Mixer/panel.</task>

**Verification Wave 3**: User can find and toggle the feature; STATE and VERIFICATION updated.

---

## Verification Summary

| Requirement | Verification |
|-------------|--------------|
| REQ-SRP-01 | Toggle exists; default off; when off, no code path uses soloist activity. |
| REQ-SRP-02 | soloistActivitySignal (or ref) updated from pitch/onset; 0–1; high when playing, low when silent. |
| REQ-SRP-03 | No mic / store not ready → soloist activity 0; band does not break. |
| REQ-SRP-04 | When toggle on, effective activity steered (high soloist → lower band density). |
| REQ-SRP-05 | Same engines; only activity input value steered; no engine API changes. |
| REQ-SRP-06 | Toggle off → behaviour identical to Phase 18. |
| REQ-SRP-07 | Toggle UI in Mixer or band panel; label clear. |
| REQ-SRP-08 | STATE.md and VERIFICATION.md updated. |

---

## Dependencies Between Waves

- Wave 2 depends on Wave 1 (toggle and soloistActivitySignal must exist and be updated).
- Wave 3 depends on Wave 2 (band integration done before promoting UI).
