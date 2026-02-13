# JJazzLab Playback Research — Requirements

## v1 (Current Milestone: Research + First Borrows)

| ID | Requirement | Source |
|----|-------------|--------|
| JJ-01 | Document JJazzLab rhythm database, JJSwing, YamJJazz, bass/drums/swing in RESEARCH.md | Research |
| JJ-02 | Define prioritized borrow list (swing, bass style, drum feels, style matrix) in RESEARCH.md | Research |
| JJ-03 | Validate/tune GrooveManager.getSwingRatio(bpm) against JJazzLab tempo–swing behavior (e.g. 2.0 at 120 BPM baseline) | SwingTransformations |
| JJ-04 | Ensure bass and drums share a single swing + humanization pipeline in useJazzBand (same getOffBeatOffsetInBeat and jitter) | JJSwing tempo adapters |
| JJ-05 | Add bass style: Two-feel (roots on 1 and 3 in 4/4, or 1 and 2 in 3/4) as a playback option | BassStyle.TWO_FEEL |
| JJ-06 | Add drum “feels”: Brushes (softer, different ride/hi-hat pattern) and sparse Intro/Ending by place-in-cycle | DrumsStyle |
| JJ-07 | Define a small style registry (e.g. Ballad, Medium Swing, Up-tempo, Bossa, Waltz) mapping to division, bass style, drum feel, comping density | RhythmFeatures, YamJJazzDefaultRhythms |

## v2 (Deferred)

| ID | Requirement | Source |
|----|-------------|--------|
| JJ-08 | Implement Bossa style: bass pattern (root-fifth-octave), bossa drum pattern, sparse bossa comping | BossaNova2, Latin |
| JJ-09 | Harden Jazz Waltz: waltz ride (1-2-3), waltz bass, optional waltz comping; align with dynamic meter 3/4 | JazzWaltz* |
| JJ-10 | Optional: Walking double-time (8th-note walking) mode in WalkingBassEngine or BassRhythmVariator | WalkingDoubleNotePhraseBuilder |
| JJ-11 | Optional: User-adjustable swing intensity (SwingProfile) in UI | SwingProfile |
| JJ-12 | Optional: Configurable anticipation (e.g. “and of 4”) and early attacks for bass/comping | AnticipatedChordProcessor |

## Phase 6: JJazzLab Library Import (New Phase)

| ID | Requirement | Source |
|----|-------------|--------|
| JJ-13 | Parse JJSwing drums44DB.mid and convert to our drum pattern format (per DrumsStyle: RIDE_1, BRUSHES_1, etc.); load into DrumEngine or pattern registry | drums/db/drums44DB.mid |
| JJ-14 | Parse JJSwing bass MIDI (WalkingBassMidiDB, 2feel A/B) and convert to bass phrase format; optionally use for tiling or as reference for two-feel/walking patterns | bass/db/*.mid |
| JJ-15 | Export YamJJazzDefaultRhythms to a style catalog (JSON/TS): style id, name, genre, tags; use for style registry and UI | YamJJazzDefaultRhythms.java |
| JJ-16 | Optionally parse PhraseTransform percussion MIDI (Congas, Tambourine, etc.) for Latin/percussion layers or Bossa | PhraseTransform/resources/*.mid |
| JJ-17 | Document Yamaha .prs/.sst/.yjz format and ZIP location; decide whether to pursue a parser in a future phase | YamJJazzDefaultFiles.zip |

## Out of Scope

- Porting full RhythmDatabase or running JJazzLab in the browser.
- Implementing a Yamaha style file parser in v1 (catalog + JJSwing MIDI only unless we spike).
- Implementing every YamJJazz genre (ChaCha, Mambo, Reggae, etc.); only Swing, Bossa, Waltz in scope for v1/v2.
