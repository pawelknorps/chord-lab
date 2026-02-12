# Creative Jazz Trio Playback – Roadmap

## Phase 1: Place-in-Cycle and Style Tag

**Focus**: Give the band a clear notion of “where we are” and “what kind of tune.”

- **Success Criteria**: place-in-cycle role and style tag are computed from playback state and song metadata and are available inside the band loop.
- **Tasks**:
  - [ ] **REQ-TRIO-01**: Implement place-in-cycle resolver (loopCount, playback plan, section labels → intro | head | solo | out head | ending).
  - [ ] **REQ-TRIO-02**: Implement song-style tag (Rhythm, CompStyle, Tempo → Ballad | Medium Swing | Up-tempo | Latin | Bossa | Waltz).
  - [ ] Expose both via signal or ref; wire into useJazzBand at beat 0 (or bar start).
- **Deliverables**: Resolver module or helper; style tag helper; integration in useJazzBand so engines can read place + style.

## Phase 2: Song-Style Matrix and Engine Rules

**Focus**: Each engine (comping, bass, drums) uses style and place to choose behaviour.

- **Success Criteria**: Audibly distinct behaviour for Ballad vs Medium Swing; Latin/Bossa/Waltz when applicable.
- **Tasks**:
  - [ ] **REQ-TRIO-03**: RhythmEngine (or ReactiveCompingEngine) uses style tag and place-in-cycle for pattern choice (sustain/sparse for ballad, standard for medium, etc.).
  - [ ] **REQ-TRIO-04**: WalkingBassEngine / BassRhythmVariator use style and place (ballad → half-time/pedal, low variation; Latin → appropriate pattern; waltz → 3-note bar).
  - [ ] **REQ-TRIO-05**: DrumEngine uses style and place (ballad → brushes/light; medium → ride 2 and 4; Latin/Bossa → groove; waltz → 3/4).
- **Deliverables**: Style matrix (config or constants); engine API extensions (style, place); useJazzBand passes place + style into all three engines.

## Phase 3: Soloist Space and Interaction

**Focus**: Leave space in ballads and solo sections; refine cross-instrument interaction.

- **Success Criteria**: In ballad or “solo” place, comping density is capped and sustain bias is higher; trio feels coherent (piano/drums/bass respond to each other and to form).
- **Tasks**:
  - [ ] **REQ-TRIO-06**: Soloist-space policy: when place is `solo` or style is `Ballad`, cap density, bias sustain, reduce bass variation (and optional half-time/pedal).
  - [ ] **REQ-TRIO-07**: Refine cross-instrument rules (piano density → drums simplify; solo place → all reduce density; out head/last chorus → can build).
  - [ ] **REQ-TRIO-08**: Band loop integration: single computation of place + style per bar; all engines receive and use them consistently.
- **Deliverables**: Soloist-space logic; interaction rules documented and applied; useJazzBand fully wired; optional unit tests for resolver and style tag.

## Dependencies

- Phase 2 depends on Phase 1 (place + style must exist).
- Phase 3 depends on Phase 2 (engines must accept style/place before applying space policy and interaction).

## Success Metrics (Overall)

- For AABA (or similar) with repeats: head vs solo vs out head have measurably different density/style.
- Ballad vs Medium Swing: comping and bass feel are audibly distinct.
- In ballad or solo section: density capped, sustain favoured, bass variation reduced.
- One place-in-cycle resolver and one style matrix used by piano, bass, and drums.
