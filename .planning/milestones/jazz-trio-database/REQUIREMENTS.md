# Jazz Trio Database (JTD) — Requirements

## v1 (Current Milestone)

| ID | Requirement | Notes |
|----|-------------|--------|
| JTD-01 | JTD repo present in `legacy_projects/Jazz-Trio-Database` | Clone from https://github.com/HuwCheston/Jazz-Trio-Database (done). |
| JTD-02 | Document JTD: structure, mirdata, annotations (beats, onsets, downbeats, piano MIDI), and mapping to JazzKiller in RESEARCH.md | So we can plan export and tuning. |
| JTD-03 | Define optional export pipeline: mirdata (or JTD src) → JSON/TS (e.g. beat times, onset lists, per-track or per-style stats) for use in Chord Lab | Script in repo or docs; consumed by GrooveManager/validation. |
| JTD-04 | Link this milestone to JJazzLab milestone and PROJECT.md pillars (Creative Jazz Trio, Jazz Band Comping Evolution) | Cross-ref in ROADMAP and STATE. |

## v2 (Deferred)

| ID | Requirement | Notes |
|----|-------------|--------|
| JTD-05 | If Zenodo access obtained: document how reference audio (mixed or stems) could be used (e.g. A/B, “play like this” reference) | Optional; license/access dependent. |
| JTD-06 | Use JTD-derived stats (e.g. swing ratio by tempo, onset density by style) to tune GrooveManager / DrumEngine / humanization | After export pipeline and analysis. |
| JTD-07 | Optional: small “reference timing” dataset (curated JTD excerpts) shipped with app for validation or display | Depends on size and licensing. |

## Out of Scope

- Running mirdata or Python inside the web app.
- Replacing Tone.js/useJazzBand playback with JTD audio playback.
- Full replication of JTD pipeline in TypeScript.
