# JJazzLab Playback Research — Roadmap

## Phase 1: Research & Documentation ✅

- **Success criteria**: RESEARCH.md and PROJECT.md written; borrow list and requirements agreed.
- **Deliverables**: RESEARCH.md, PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md.
- **Requirements**: JJ-01, JJ-02.

## Phase 2: Swing & Pipeline (P1)

- **Success criteria**: Swing ratio validated/tuned; single swing + humanization pipeline used by bass and drums in useJazzBand.
- **Tasks**: Validate getSwingRatio(bpm) against JJazzLab; refactor/confirm shared pipeline in useJazzBand.
- **Requirements**: JJ-03, JJ-04.

## Phase 3: Bass Two-Feel & Drum Feels (P1)

- **Success criteria**: User can select “Two-feel” bass; drum “Brushes” and Intro/Ending (by place-in-cycle) available.
- **Tasks**: Add two-feel mode to bass generation; add Brushes and Intro/Ending to DrumEngine/LinearDrummingEngine and wire to place-in-cycle.
- **Requirements**: JJ-05, JJ-06.

## Phase 4: Style Registry (P2)

- **Success criteria**: A small style registry (Ballad, Medium Swing, Up-tempo, Bossa, Waltz) drives division, bass style, drum feel, comping density; integrable with jazz-trio-playback milestone.
- **Tasks**: Define Style type and registry; map style → GrooveManager/DrumEngine/WalkingBassEngine/ReactiveCompingEngine presets; hook into song or UI.
- **Requirements**: JJ-07.

## Phase 5: Bossa & Waltz (P2, Optional in v2)

- **Success criteria**: Bossa and Jazz Waltz styles produce coherent bass + drums + comping.
- **Tasks**: Bossa bass pattern + bossa drums + bossa comping; waltz ride/bass/comping hardening.
- **Requirements**: JJ-08, JJ-09.

## Mapping: Requirement → Phase

| Req | Phase |
|-----|-------|
| JJ-01, JJ-02 | 1 |
| JJ-03, JJ-04 | 2 |
| JJ-05, JJ-06 | 3 |
| JJ-07 | 4 |
| JJ-08, JJ-09 | 5 |
| JJ-10–JJ-12 | Backlog |
