# JJazzLab Playback Research — Phase 1: Research & Documentation

**Milestone**: `.planning/milestones/jjazzlab-playback-research/`  
**Phase**: 1 — Research & Documentation

---

## Frontmatter

- **Waves**: 1 (documentation only).
- **Dependencies**: None (research phase).
- **Files likely modified**: `RESEARCH.md`, optionally `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`.

---

## Goal

Document JJazzLab’s rhythm model, swing behavior, bass styles, and drum styles so we can borrow **concepts and numbers** for JazzKiller without porting Java or binary formats. Establish a single source of truth for style registry (genre + division + tempo), swing alignment (e.g. 2.0 at 120 BPM), and bass/drums style decisions.

---

## Tasks

<task id="P1-T1">Document **rhythm model** in RESEARCH.md: RhythmDatabase / RhythmInfo / RhythmFeatures as reference only. Style registry = (genre + division + tempo); list Genre (JAZZ, BOSSA, SAMBA, …) and Division (BINARY, EIGHTH_SHUFFLE, EIGHTH_TRIPLET). No Java implementation.</task>

<task id="P1-T2">Document **swing** in RESEARCH.md: JJazzLab tempo–swing correlation (SwingProfile.swingRatios [50→2.3, 120→2.0, 190→1.8, 240→1.6]); upbeat = R/(1+R). GrooveManager current behavior (e.g. 120 BPM ≈ 0.625). Alignment target: 2.0 at 120 BPM → 2/3; single shared bass/drums pipeline.</task>

<task id="P1-T3">Document **bass** in RESEARCH.md: BassStyle (Two-feel, Walking, Walking double-note, Intro/Ending). Borrow two-feel and optional double-time walking; keep algorithmic WalkingBassEngine; no Wbp phrase DB.</task>

<task id="P1-T4">Document **drums** in RESEARCH.md: DrumsStyle (Ride, Brushes, Shuffle, Intro/Ending). Shared swing + humanization pipeline with bass; no DpSourceDatabase port.</task>

<task id="P1-T5">Add **Phase 1 Research Summary** (e.g. §12) to RESEARCH.md: style registry, swing alignment table (BPM vs JJazzLab ratio vs GrooveManager), bass/drums borrow list.</task>

<task id="P1-T6">Ensure REQUIREMENTS.md and ROADMAP.md list Phase 1 success criteria (JJ-01, JJ-02) and Phase 2+ map to swing validation, two-feel, drum feels, style registry.</task>

---

## Verification

- [ ] RESEARCH.md contains rhythm model (style registry, Genre, Division) and states “no Java implementation”.
- [ ] RESEARCH.md contains JJazzLab swing ratios and GrooveManager alignment target (2.0 at 120 BPM → 2/3); shared pipeline noted.
- [ ] RESEARCH.md contains BassStyle borrow list (two-feel, walking, optional double-time, intro/ending; no Wbp DB).
- [ ] RESEARCH.md contains DrumsStyle borrow list (Ride, Brushes, Shuffle, Intro/Ending; shared pipeline).
- [ ] RESEARCH.md has a Phase 1 Research Summary section (e.g. §12) with table and bullets as above.
- [ ] REQUIREMENTS.md and ROADMAP.md are consistent with Phase 1 = research, Phase 2 = swing & pipeline.

---

## Next Steps

When Phase 1 is complete, run **Phase 2** (Swing & Pipeline): validate `GrooveManager.getSwingRatio(bpm)` against JJazzLab (e.g. 2/3 at 120 BPM) and confirm `useJazzBand` uses a single swing + humanization path for bass and drums. Recommend `/gsd-execute-phase` for the milestone or run Phase 2 plan/execute as needed.
