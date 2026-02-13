# Milestone: Jazz Trio Database (JTD) — Integration with Chord Lab

## Vision

Integrate the **Jazz Trio Database** (JTD), a ~45-hour annotated jazz piano trio dataset, into Chord Lab’s planning and optional implementation. Use JTD as a **reference and validation source** for JazzKiller playback (timing, swing, density) and as a potential **data pipeline** for real performance statistics, while continuing to use **JJazzLab** (in `legacy_projects/JJazzLab-master`) as the primary design reference for rhythm, harmony, and style behaviour.

## Core Value

- **Evidence-based playback tuning**: Calibrate swing ratio, humanization, and density using real trio timing and onset data from JTD (complementing JJazzLab’s rule-based behaviour).
- **Single legacy stack**: JTD lives in `legacy_projects/Jazz-Trio-Database`; JJazzLab in `legacy_projects/JJazzLab-master`; both inform JazzKiller and related milestones (Creative Jazz Trio, Jazz Band Comping Evolution).
- **Optional data pipeline**: Scripts or tooling (e.g. Python/mirdata) to export JTD annotations (beats, onsets, downbeats, piano MIDI) to JSON/TS for use in the app (e.g. reference timing curves, style stats).

## High-Level Requirements (Active)

- **JTD in repo**: Jazz Trio Database cloned into `legacy_projects/Jazz-Trio-Database` (done).
- **Research**: Document JTD structure, mirdata usage, annotation types, and how they map to our playback (RESEARCH.md).
- **Requirements**: Define v1 (export pipeline, validation use) and v2 (optional Zenodo audio, style stats) in REQUIREMENTS.md.
- **Roadmap & state**: ROADMAP.md and STATE.md for this milestone; link from main ROADMAP/STATE if desired.

## Relationship to Other Milestones

- **JJazzLab playback research** (`.planning/milestones/jjazzlab-playback-research/`): Design and behaviour reference (styles, swing, bass/drums). JTD does **not** replace JJazzLab; it adds **real performance data** for validation and tuning.
- **Creative Jazz Trio / Jazz Band Comping Evolution**: Our engines (DrumEngine, WalkingBassEngine, ReactiveCompingEngine) can be tuned or validated using JTD-derived timing and density stats.

## Out of Scope (This Milestone)

- Hosting or streaming JTD audio in the app (Zenodo access is request-based; use for offline research or export only).
- Replacing our algorithmic playback with JTD playback; JTD is reference and calibration, not the runtime engine.
- Building a full mirdata port in TypeScript; use Python/mirdata for export, consume JSON/TS in the app.

## Key Decisions

| Decision | Option chosen | Rationale |
|----------|----------------|-----------|
| JTD location | `legacy_projects/Jazz-Trio-Database` | Same pattern as JJazzLab; keeps main app codebase clean. |
| Primary use | Reference + validation + optional export | Aligns with “evidence-based tuning” without tying runtime to Python. |
| Audio | Zenodo by request; optional later | License/access; annotations are sufficient for timing/density work. |
| JJazzLab | Unchanged; JTD complements it | JJazzLab = rules/patterns; JTD = real data for tuning and research. |
