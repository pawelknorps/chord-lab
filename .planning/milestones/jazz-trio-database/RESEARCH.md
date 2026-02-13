# Jazz Trio Database (JTD) — Research: What We Can Use for Chord Lab

**Sources**: `legacy_projects/Jazz-Trio-Database` (repo), [mirdata JTD](https://mirdata.readthedocs.io/en/stable/source/quick_reference.html), [JTD docs](https://huwcheston.github.io/Jazz-Trio-Database/), [paper (TISMIR 2024)](https://doi.org/10.5334/tismir.186)  
**Target**: Chord Lab JazzKiller playback (GrooveManager, DrumEngine, WalkingBassEngine, humanization) and optional validation/tuning pipelines.

---

## 1. JTD Overview

- **What it is**: ~45 hours of jazz piano trio performances (piano, bass, drums), annotated by an automated signal processing pipeline. Source-separated audio (Demucs/Spleeter-style) used to generate annotations.
- **In mirdata**: JTD is integrated as dataset `jtd`. **Annotations**: Beats, Global Tempo, Piano Notes (MIDI). **Tracks**: 1,294. **Audio**: 🔑 (Zenodo, by request). **License**: MIT (annotations/code); YouTube-sourced audio use not covered by MIT.
- **Install**: `pip install mirdata` → `mirdata.initialize('jtd')` → `jtd.download()` (annotations; audio placement instructed on download; Zenodo access requested separately).

---

## 2. Annotation Types (Relevant to Playback)

| Annotation   | Description | Use in Chord Lab |
|-------------|-------------|-------------------|
| **Beats**   | Beat timestamps (and downbeats) from automatic beat tracking. | Calibrate or validate **swing ratio** and **micro-timing** (e.g. beat-upbeat delay) by tempo band; feed into GrooveManager or humanization. |
| **Global Tempo** | One tempo per track (BPM). | Map “real” tempo distribution; tune our tempo–swing curve (with JJazzLab) against real data. |
| **Piano Notes**  | MIDI-like note events for the **piano soloist** (onset, offset, pitch). | Onset density, phrase length, “space” stats for **soloist-responsive** and **place-in-cycle** (intro/head/solo/ending); optional reference for comping density. |

The JTD pipeline also produced **onsets** (e.g. for evaluation; mean F-measure 0.94 vs ground truth). In mirdata the primary exposure is Beats, Tempo, Piano Notes; onset-level data may be in the repo’s `src` or built from source (see JTD docs).

---

## 3. Repo Structure (legacy_projects/Jazz-Trio-Database)

- **data/**: Raw and processed data placeholders; actual annotations downloaded via mirdata (or built from source).
- **docs/**: Installation, database structure, download, usage, API.
- **src/**: Pipeline and feature code (detect, clean, features, visualise).
- **notebooks/**, **example.ipynb**: Example workflow (process track, extract features, plot).
- **references/**: Manual annotation, corpus construction, parameter optimisation.
- **models/**, **reports/**, **test/**: Models, reports, tests.

Working with JTD in Chord Lab does **not** require running the full pipeline; **mirdata** is the recommended way to get annotations. The repo is useful for understanding how annotations were built and for any custom export (e.g. beat timing stats, onset lists).

---

## 4. How JTD Complements JJazzLab

| Aspect | JJazzLab (legacy_projects/JJazzLab-master) | JTD (legacy_projects/Jazz-Trio-Database) |
|--------|-------------------------------------------|----------------------------------------|
| **Role** | **Design & behaviour reference**: styles, swing, bass/drums patterns (rules and MIDI libraries). | **Data reference**: real trio timing, tempo, density from ~1.3k tracks. |
| **Swing** | Tempo–swing correlation (e.g. 2.0 at 120 BPM); shared bass/drums pipeline. | Real beat/onset timing to **validate or tune** that correlation and humanization. |
| **Density / space** | Place-in-cycle, style matrix (Ballad, Medium Swing, etc.). | Piano note density and phrase stats to **calibrate** “soloist space” and comping density. |
| **Format** | Java, MIDI, style catalog; we borrow concepts and import MIDI/patterns. | Python/mirdata; we **export** to JSON/TS or aggregate stats for our engines. |

**Conclusion**: Use **JJazzLab** for *what* to implement (styles, two-feel, brushes, swing curve). Use **JTD** to *tune and validate* those implementations with real performance data (beats, tempo, piano activity).

---

## 5. Mapping to Our Stack

- **GrooveManager (swing, humanization)**: Use JTD beat timestamps (and downbeats) to compute e.g. beat–upbeat delay or swing ratio by BPM band; compare to `getSwingRatio(bpm)` and humanization jitter; document or adjust parameters (JTD-06 in REQUIREMENTS).
- **DrumEngine / RhythmEngine**: JTD does not provide drum annotations in mirdata; we keep using JJazzLab and our engines. Optional: use JTD **tempo** and **piano density** as proxies for “energy” to validate intensity/density choices.
- **Soloist-responsive / place-in-cycle**: Piano Notes (onset count, note density per section) can inform “soloist space” and density caps (Creative Jazz Trio, Soloist-Responsive Playback milestones).
- **WalkingBassEngine / comping**: No direct bass or chord annotations in mirdata JTD; JJazzLab and our harmonic/pattern logic remain the source. JTD can still inform **global timing feel** (tempo, beat consistency) that affects how we drive bass and comping.

---

## 6. Export Pipeline (Optional)

- **Goal**: Get JTD data into formats we can use in Chord Lab (or in docs/scripts) without running Python in the app.
- **Approach**: Small Python script (e.g. in `scripts/` or `legacy_projects/Jazz-Trio-Database/`) using mirdata:
  - For each track (or a subset): load Beats, Tempo, Piano Notes.
  - Export to JSON: e.g. `{ track_id, bpm, beat_times, downbeat_indices, piano_onsets_by_bar_or_interval }`.
  - Optionally aggregate: e.g. mean “swing” delay by BPM bin, or onset density by tempo/style.
- **Consumption**: Our app or a validation script reads JSON; no mirdata dependency in the browser. Schema can be minimal (see REQUIREMENTS JTD-03).

---

## 7. Audio (Zenodo)

- JTD audio (mixed + source-separated) is on [Zenodo](https://zenodo.org/records/13828030); access is **by request** for valid research use.
- For **annotation-only** work (beats, tempo, piano notes), Zenodo is not required; mirdata can download annotation data without full audio.
- If we obtain access later: reference mixes or stems could support A/B listening, “play like this” reference, or perceptual tuning (v2, JTD-05).

---

## 8. References

- Cheston, H., Schlichting, J. L., Cross, I., & Harrison, P. M. C. (2024). Jazz Trio Database: Automated Annotation of Jazz Piano Trio Recordings Processed Using Audio Source Separation. *Transactions of the International Society for Music Information Retrieval*. https://doi.org/10.5334/tismir.186
- mirdata: https://mirdata.readthedocs.io/
- JTD docs: https://huwcheston.github.io/Jazz-Trio-Database/
- JJazzLab research (our milestone): `.planning/milestones/jjazzlab-playback-research/RESEARCH.md`
