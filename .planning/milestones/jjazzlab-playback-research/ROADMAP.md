# JJazzLab Playback Research — Roadmap

## Phase 1: Research & Documentation ✅

- **Success criteria**: RESEARCH.md and PROJECT.md written; borrow list and requirements agreed.
- **Deliverables**: RESEARCH.md, PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md.
- **Requirements**: JJ-01, JJ-02.

## Phase 2: Swing & Pipeline (P1) ✅

- **Success criteria**: Swing ratio validated/tuned; single swing + humanization pipeline used by bass and drums in useJazzBand.
- **Done**: getSwingRatio tuned to JJazzLab four-point curve (120 BPM → 2/3); bass uses getHumanizationJitter (same as drums); shared pipeline documented. JJ-03, JJ-04.

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

## Phase 6: JJazzLab Library Import ✅

- **Success criteria**: Styles, rhythms, and comping patterns from JJazzLab are available in our app: drum patterns from drums44DB.mid, optional bass phrases from JJSwing bass MIDI, and a style catalog derived from YamJJazzDefaultRhythms.
- **Done**: Style catalog (`src/data/jjazzlab-style-catalog.ts`); drum patterns script + data (`scripts/import-jjazzlab-drums.mjs`, `src/data/jjazzlab-drum-patterns.*`); Yamaha format doc in LIBRARY_IMPORT.md. Bass (JJ-14) and percussion (JJ-16) deferred.
- **Requirements**: JJ-13 ✅, JJ-15 ✅, JJ-17 ✅; JJ-14, JJ-16 optional/follow-up.

## Mapping: Requirement → Phase

| Req | Phase |
|-----|-------|
| JJ-01, JJ-02 | 1 |
| JJ-03, JJ-04 | 2 |
| JJ-05, JJ-06 | 3 |
| JJ-07 | 4 |
| JJ-08, JJ-09 | 5 |
| JJ-13–JJ-17 | 6 (Library Import) |
| JJ-10–JJ-12 | Backlog |
