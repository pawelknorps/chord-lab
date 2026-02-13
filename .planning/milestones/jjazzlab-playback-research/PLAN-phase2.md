# JJazzLab Playback Research — Phase 2: Swing & Pipeline

**Milestone**: `.planning/milestones/jjazzlab-playback-research/`  
**Phase**: 2 — Swing & Pipeline (P1)

---

## Frontmatter

- **Waves**: 1 (swing tune + pipeline confirm/refactor).
- **Dependencies**: Phase 1 complete (RESEARCH.md §12 alignment targets).
- **Files likely modified**: `src/core/theory/GrooveManager.ts`, `src/modules/JazzKiller/hooks/useJazzBand.ts`, optional unit test for GrooveManager.

---

## Goal

Satisfy **JJ-03** and **JJ-04**: (1) Validate/tune `GrooveManager.getSwingRatio(bpm)` so 120 BPM gives 2/3 (JJazzLab baseline) and the curve follows JJazzLab’s four-point trend; (2) Ensure bass and drums in `useJazzBand` share a single swing + humanization pipeline (same `getOffBeatOffsetInBeat` and same jitter source).

---

## Context (from RESEARCH §12.2)

- **JJazzLab** `SwingProfile.swingRatios`: [50→2.3, 120→2.0, 190→1.8, 240→1.6] BPM. Upbeat fraction = R/(1+R) → 120 BPM: 2/3 ≈ 0.6667.
- **Current** `GrooveManager`: linear 0.75 @ 60 BPM, 0.5 @ 180 BPM → 120 BPM ≈ 0.625.
- **useJazzBand**: One `grooveRef` (GrooveManager) used for `Transport.swing`, bass/drum `getOffBeatOffsetInBeat`, drum `getHumanizationJitter`; bass uses ad-hoc humanization `(Math.random()*7-5)/1000` instead of `getHumanizationJitter`.

---

## Tasks

<task id="P2-T1">**Tune getSwingRatio(bpm)** in `GrooveManager.ts`: Use piecewise linear interpolation with JJazzLab-style anchors so that 120 BPM returns 2/3 (0.6667). Anchors: 50→2.3/(1+2.3)≈0.697, 120→2/3, 190→1.8/2.8≈0.643, 240→1.6/2.6≈0.615. Clamp result to [0.5, 0.75]. Preserve existing API (returns fraction of beat for the upbeat).</task>

<task id="P2-T2">**Add unit test** (optional but recommended): In `GrooveManager.test.ts` (create if missing), assert `getSwingRatio(120)` ≈ 2/3 (e.g. 0.66–0.67), and that 50 &lt; 120 &lt; 190 &lt; 240 gives decreasing fractions (slower = more swing).</task>

<task id="P2-T3">**Single humanization pipeline for bass**: In `useJazzBand.ts`, replace the bass humanization `(Math.random()*7-5)/1000` with `grooveRef.current.getHumanizationJitter(...)` (e.g. sigmaMs 3 or 4) so bass and drums use the same jitter API from the same GrooveManager instance. Keep bass micro-timing via `getMicroTiming(bpm,"Bass")` as is.</task>

<task id="P2-T4">**Confirm shared pipeline**: Verify that in `useJazzBand` both bass and drums use the same `grooveRef.current` for `getOffBeatOffsetInBeat(bpm)` and for humanization (getHumanizationJitter). Document in code (short comment) or in RESEARCH/STATE that one GrooveManager per loop drives swing + humanization for bass and drums. No second GrooveManager in the schedule path (DrumEngine’s internal groove is only for getMicroTiming; swing grid is from useJazzBand’s grooveRef).</task>

<task id="P2-T5">**Set Transport.swing** from tuned ratio: useJazzBand already sets `Tone.Transport.swing = grooveRef.current.getSwingRatio(bpm)`; no change needed once getSwingRatio is tuned. Spot-check that Transport.swing at 120 BPM is ~0.667.</task>

---

## Verification

- [ ] **JJ-03**: `GrooveManager.getSwingRatio(120)` returns a value in [0.66, 0.67]. Curve: 50 BPM &gt; 120 &gt; 190 &gt; 240 (decreasing fraction).
- [ ] **JJ-04**: Bass and drums both use `grooveRef.current.getOffBeatOffsetInBeat(bpm)` and `grooveRef.current.getHumanizationJitter(...)` in useJazzBand; no separate swing/jitter source in the schedule path.
- [ ] No regression: playback at 60, 120, 180 BPM still sounds coherent; bass and ride remain locked on the same swing grid.

---

## Success Criteria (from ROADMAP)

- Swing ratio validated/tuned against JJazzLab (2.0 at 120 BPM → 2/3).
- Single swing + humanization pipeline used by bass and drums in useJazzBand.

---

## Next Steps

When Phase 2 is complete, run **Phase 3** (Bass Two-Feel & Drum Feels): add two-feel bass option and Brushes/Intro/Ending drum feels (JJ-05, JJ-06). Recommend `/gsd-execute-phase` for Phase 2 when ready to implement.
