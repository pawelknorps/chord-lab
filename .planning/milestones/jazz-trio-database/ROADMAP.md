# Jazz Trio Database — Roadmap

## Phase 1: Onboarding and Research (Current)

- **Goal**: JTD in repo; understand structure and how it can enhance JazzKiller.
- **Tasks**:
  - [x] Clone JTD into `legacy_projects/Jazz-Trio-Database`.
  - [ ] Write RESEARCH.md: JTD overview, mirdata, annotation types, mapping to our playback (swing, humanization, density).
  - [ ] Cross-link milestone with JJazzLab and PROJECT.md (Creative Jazz Trio, Jazz Band Comping Evolution).
- **Success**: RESEARCH.md complete; REQUIREMENTS and ROADMAP committed.

## Phase 2: Export Pipeline (Optional v1)

- **Goal**: Reproducible way to get JTD data into formats we can use (JSON/TS).
- **Tasks**:
  - [ ] Document or implement a small pipeline (e.g. Python script using mirdata) that exports beat/onset/downbeat (and optionally piano MIDI) per track to JSON.
  - [ ] Define a minimal schema for “reference timing” or “style stats” consumed by our code or docs.
- **Success**: Script or doc in repo; at least one sample export or schema.

## Phase 3: Validation and Tuning (v2)

- **Goal**: Use JTD-derived stats to validate or tune GrooveManager, swing, humanization.
- **Tasks**:
  - [ ] Compute or document JTD-based stats (e.g. swing ratio by tempo band, onset density).
  - [ ] Compare with current GrooveManager/JJazzLab-aligned behaviour; document or implement parameter tweaks.
- **Success**: Either tuned defaults or a short “JTD validation” note in docs/milestone.

## Dependencies

- **JJazzLab milestone**: Style registry, swing, bass/drums behaviour (design reference); JTD complements with real data.
- **Creative Jazz Trio / Jazz Band Comping Evolution**: Engines that can be tuned using JTD stats.
