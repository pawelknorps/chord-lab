# JJazzLab Playback Research: What to Borrow for JazzKiller

**Source**: `legacy_projects/JJazzLab-master` (Java, LGPL v2.1)  
**Target**: Chord Lab JazzKiller playback (TypeScript, Tone.js, `useJazzBand` / `useJazzPlayback`)

---

## 1. JJazzLab Overview

- **Purpose**: Backing-track generation from chord symbols + selected rhythm (style). Output: drums, bass, guitar, piano, strings, etc.
- **Goals**: Realistic, non-boring (variations), easily customizable for complex songs.
- **Stack**: Apache NetBeans Platform, FluidSynth (embedded), optional VST via virtual MIDI.
- **Docs**: [User Guide](https://jjazzlab.gitbook.io/user-guide/), [Developer Guide](https://jjazzlab.gitbook.io/developer-guide/).

---

## 2. Architecture (Reusable Concepts)

### 2.1 Rhythm as First-Class Entity

- **RhythmDatabase**: Central registry of rhythms by `RhythmInfo` (id, name, tags, time signature, preferred tempo, rhythm features).
- **RhythmFeatures**: `Genre`, `Division`, `TempoRange` — used for **matching** (e.g. find substitute when a rhythm is missing).
- **RhythmProvider**: Plugins supply rhythms (e.g. JJSwing, YamJJazz). Each rhythm has:
  - **RhythmVoices**: DRUMS, BASS, PIANO, etc.
  - **RhythmParameters**: Variation, Intensity, Fill, Mute, BassStyle, DrumsStyle, etc.
- **AdaptedRhythm**: Same rhythm adapted to another time signature (e.g. 4/4 → 3/4).

**Borrow for JazzKiller**: A **style registry** keyed by genre + division + tempo range (e.g. “Medium Swing”, “Bossa”, “Jazz Waltz”) that maps to our `GrooveManager` / `DrumEngine` / `WalkingBassEngine` / `ReactiveCompingEngine` presets. No need to port the full DB; we can define a small set of named styles and switch behavior by style.

### 2.2 Genre & Division

- **Genre** (JJazzLab): JAZZ, BOSSA, SAMBA, BLUES, ROCK, POP, LATIN, REGGAE, RnB, FUNK, CUBAN, CHACHACHA, MAMBO, etc. Used for tags and matching.
- **Division**: BINARY (straight 8ths), EIGHTH_SHUFFLE (swing), EIGHTH_TRIPLET (triplet feel). Drives grid and swing.

**Borrow**: Explicit **Division** in our playback (we already have swing in `GrooveManager`); add **Genre** (or “song style”) so Ballad / Medium Swing / Bossa / Waltz drive density, bass style, and drum set (see Creative Jazz Trio milestone).

### 2.3 Song Model

- **ChordLeadSheet**: Chord symbols + sections (CLI_ChordSymbol, CLI_Section).
- **SongStructure**: Song parts (intro, head, solo, ending) each with a **rhythm** and **time signature**.
- **SongContext**: Song + MidiMix + tempo + bar range — passed into generators.

**Borrow**: We already have song + chords + optional meter changes. We can add **song-part role** (intro / head / solo / ending) to drive “place in cycle” behavior (sparser in ballads/solos) as in the jazz-trio-playback milestone.

---

## 3. Swing & Tempo (High Value)

### 3.1 SwingTransformations (JJSwing)

- **Tempo–swing correlation**: Slow tempos → stronger swing (e.g. 2.5:1), fast → straighter (e.g. 1.8:1).
- **SwingProfile**: Configurable “apply swing ratio” and per-tempo ratios.
- **Humanization**: Shared random for micro-timing (we use Gaussian in `GrooveManager`).

**Borrow**: Our `GrooveManager.getSwingRatio(bpm)` already does tempo–swing (0.75 at 60 BPM, 0.5 at 180 BPM). We can **validate and tune** against JJazzLab’s numbers (e.g. 2.0 at 120 BPM baseline) and consider a **SwingProfile** (user-adjustable intensity) for future UI.

### 3.2 SwingBassTempoAdapter / SwingDrumsTempoAdapter

- Take a **phrase** (sequence of note positions) and **adjust** positions using swing ratio and humanization.
- Bass and drums share the same swing math so they lock.

**Borrow**: We already place bass and ride on the same grid in the loop. Ensuring **one shared swing + humanization pipeline** (e.g. one `getOffBeatOffsetInBeat` / `getHumanizationJitter` used by both) keeps lock. No need to port phrase-based adapters; our real-time loop is the right model for web.

---

## 4. Bass (High Value)

### 4.1 BassStyle (JJSwing)

- **INTRO**, **ENDING**, **TWO_FEEL**, **WALKING**, **WALKING_DOUBLE_NOTE**, **WALKING_DOUBLE_TIME** (+ CUSTOM variants).
- Each style has a **PhraseBuilder** (e.g. `TwoFeelPhraseBuilder`, `WalkingPhraseBuilder`, `WalkingDoubleNotePhraseBuilder`).

**Borrow**: Add **bass style** to our playback options:
- **Two-feel**: Half-note (or quarter) on 1 and 3 (or 1 and 2 in 3/4) — we can derive from chord roots + simple rhythm.
- **Walking**: Keep and extend `WalkingBassEngine` (we already have Friedland-style and context strategies).
- **Walking double-time**: 8th-note walking; we could add a “density” or “subdivision” option in `WalkingBassEngine` or `BassRhythmVariator`.

### 4.2 BassGenerator (JJSwing)

- Uses **WbpSourceDatabase**: pre-recorded **walking bass phrases** (Wbp = walking bass phrase?) that are **tiled** to the chord progression.
- **WbpTiling**: Selects and concatenates phrase segments to cover bars; **WbpSourceAdaptation** adapts to chord roots.
- **AnticipatedChordProcessor**: Handles anticipations (e.g. note on “and of 4” for next chord).
- **AccentProcessor**: Dynamics from chord/beat context.

**Borrow**:
- **Anticipation**: We already have “and of 4” and approach notes in `WalkingBassEngine`. Ensure beat-4 approach and optional **early** attack (e.g. 4&) are configurable.
- **Phrase tiling**: We do **not** need to ship a Wbp database; our algorithmic walking is sufficient. Optionally, we could later add a **small set of 1–2 bar “bass motifs”** (e.g. for two-feel or intros) and tile them by chord — lower priority than style switch and two-feel.

### 4.3 WalkingPhraseBuilder / WalkingDoubleNotePhraseBuilder

- Walking: quarter-note line, chord tones + approach.
- Double-note: two notes per beat (eighth-note walking).

**Borrow**: “Double-time” or “eighth-note walking” as a **mode** in `WalkingBassEngine` or `BassRhythmVariator` (e.g. 8 notes per bar instead of 4).

---

## 5. Drums (High Value)

### 5.1 DrumsStyle (JJSwing)

- **BRUSHES_1/2**, **HI_HAT_1/2**, **RIDE_1/2/3/4**, **SHUFFLE_1/2**, **DOUBLE_1**, **INTRO**, **ENDING**.
- Stored as **RP_DrumsStyle** rhythm parameter; **DrumsGenerator** picks patterns from **DpSourceDatabase** (phrase database per style).

**Borrow**:
- **Named drum “feels”**: Map our `DrumEngine` / `LinearDrummingEngine` to a small set: e.g. **Ride (spang-a-lang)**, **Brushes**, **Shuffle**, **Intro/Ending** (sparse). We already have ride + hi-hat + kick/snare; adding a “brushes” variant (softer, different pattern) and “shuffle” (swing shuffle) would align with JJazzLab.
- **Intro/Ending**: Fewer hits, maybe just kick+cymbal or ride bell — we can do this with **intensity/density** and “place in cycle” (first/last bars).

### 5.2 DrumsGenerator

- **DpSourceDatabase**: Pre-recorded drum phrases per style, tempo-adapted.
- **SwingDrumsTempoAdapter**: Same swing and humanization as bass.

**Borrow**: We don’t need to port the phrase DB. Keep **algorithmic** drums; add **style** (Ride / Brushes / Shuffle / Intro/Ending) that changes pattern and density. Ensure drums use the **same** swing and humanization as bass (single pipeline).

---

## 6. Harmony & Chords

- **ChordLeadSheet**: Chord symbols with position in bar; **ChordRenderingInfo** (e.g. bass note, optional slash).
- **SongChordSequence** / **SimpleChordSequence**: Sequence of chords for a segment; used by all generators.
- **AnticipatedChordProcessor**: For anticipations (e.g. next chord on 4&).

**Borrow**: We already have chord-per-bar (and optional half-bar) and meter changes. No structural change needed; keep using our chord source (e.g. from song or standards) and pass current/next chord into bass and comping.

---

## 7. Styles Beyond Swing (Bossa, Samba, Waltz, etc.)

### 7.1 YamJJazzDefaultRhythms

- Many built-in styles: **BossaNova2**, **ChaCha**, **Mambo5**, **PopRumba**, **SambaCity213**, **Calypso**, **HappyReggae**, **JazzWaltzSlow/Med/Fast**, **Cool8Beat**, **16beat**, **RockShuffle**, **Soul**, **SoulR&B**, **Urban Funk**, etc.
- Each has **Genre** and **tags** for search/substitute.

**Borrow**: A **style matrix** (e.g. Ballad, Medium Swing, Up-tempo, Bossa, Waltz, Latin) that we already reference in the jazz-trio-playback milestone. For each style we can define:
- **Division**: binary vs shuffle vs triplet.
- **Bass**: two-feel vs walking vs “Latin” (e.g. dotted quarter pattern for bossa).
- **Drums**: ride vs brushes vs bossa pattern (e.g. rim + cross-stick) vs waltz (1-2-3).
- **Comping**: density and rhythm set (e.g. bossa comping pattern).

We don’t need to implement all YamJJazz styles at once; **Bossa** and **Jazz Waltz** are the next most valuable after swing.

### 7.2 Bossa / Latin

- Bossa: typically **binary** division, characteristic **bass** (root-fifth or root-fifth-octave pattern) and **drum** pattern (e.g. surdo, rim, cross-stick).
- JJazzLab implements this via separate rhythm **generators** and phrase DBs per style.

**Borrow**: Add **Bossa** as a style:
- **Bass**: 2-bar or 1-bar pattern (e.g. root, fifth, octave, fifth or similar) — algorithmic.
- **Drums**: Simple bossa pattern (kick on 1 and 3, rim/cross-stick on 2 and 4, optional hi-hat 8ths) — we can add a `BossaDrumPattern` or extend `DrumEngine`.
- **Comping**: Sparse, syncopated chords (e.g. on 2 and 4&) — extend `ReactiveCompingEngine` with a “bossa” rhythm set.

---

## 8. What Not to Port

- **RhythmDatabase implementation** (file-based, Java, provider SPI): Overkill; we use a small, code-defined style registry.
- **YamJJazz YJZ/SST file format**: Proprietary; we don’t need to read those; we only take the **idea** of named styles and genre/division.
- **WbpSourceDatabase / DpSourceDatabase**: Pre-recorded phrase DBs; we stay **algorithmic** for now; optional short motif sets later.
- **NetBeans / FluidSynth / VST**: Desktop stack; we keep Web Audio / Tone.js and our existing samplers.

---

## 9. Prioritized Borrow List (for REQUIREMENTS)

| Priority | Item | Source | Action |
|---------|------|--------|--------|
| P1 | Tempo–swing correlation | SwingTransformations, GrooveManager | Validate/tune our `getSwingRatio(bpm)`; optional SwingProfile (intensity). |
| P1 | Single swing + humanization pipeline | Bass/Drums tempo adapters | Ensure bass and drums share same `getOffBeatOffsetInBeat` and jitter in `useJazzBand`. |
| P1 | Bass style: Two-feel | BassStyle.TWO_FEEL, TwoFeelPhraseBuilder | Add two-feel mode: roots on 1 and 3 (or 1 and 2 in 3/4). |
| P1 | Drum “feels”: Brushes, Intro/Ending | DrumsStyle | Add Brushes (softer, different ride/hh) and sparse Intro/Ending by place-in-cycle. |
| P2 | Style matrix (Ballad, Swing, Bossa, Waltz) | Genre, YamJJazzDefaultRhythms | Map style → division, bass style, drum feel, comping density (align with jazz-trio-playback). |
| P2 | Bossa style | BossaNova2, Latin generators | Bossa bass pattern + bossa drum pattern + sparse bossa comping. |
| P2 | Jazz Waltz | JazzWaltzSlow/Med/Fast | We have 3/4 meter; ensure waltz ride (1-2-3) and bass; optional waltz comping. |
| P3 | Walking double-time (8th-note walking) | WalkingDoubleNotePhraseBuilder | Optional mode in WalkingBassEngine / BassRhythmVariator. |
| P3 | Anticipation (4&) configurable | AnticipatedChordProcessor | Make “and of 4” and early attacks explicit options. |

---

## 10. Extractable Library (Styles, Rhythms, Comping Patterns)

### 10.1 JJSwing MIDI Databases (in repo — directly usable)

All under `legacy_projects/JJazzLab-master/plugins/JJSwing/src/main/resources/org/jjazz/jjswing/`:

| Asset | Path | Format | Content |
|-------|------|--------|--------|
| **Drums** | `drums/db/drums44DB.mid` | Standard MIDI, PPQ | One track; markers `_<DRUMS_STYLE>` (e.g. `_RIDE_1`, `_BRUSHES_1`), `#fill`, `#alt`, `_END`. Notes on one channel; phrases per DrumsStyle. |
| **Bass walking** | `bass/db/WalkingBassMidiDB.mid` | Standard MIDI, PPQ | Sessions/phrases with chord symbols as markers; 1–4 bar WbpSource phrases for walking. |
| **Bass 2-feel A** | `bass/db/WalkingBass2feelAMidiDB.mid` | Same | Two-feel phrases (session tag "2FA", "2feel-a"). |
| **Bass 2-feel B** | `bass/db/WalkingBass2feelBMidiDB.mid` | Same | Two-feel phrases (session tag "2FB", "2feel-b"). |

**Conversion**: Parse MIDI (e.g. `midi-file` or `tonejs/midi` in npm), read markers and note events, emit our pattern format (JSON/TS: time in beats, pitch, velocity, duration, plus metadata for style/section). Use for DrumEngine pattern sets and for bass phrase tiling (optional) alongside WalkingBassEngine.

### 10.2 PhraseTransform percussion (in repo)

Under `core/PhraseTransform/src/main/resources/org/jjazz/phrasetransform/resources/`:

- `Congas1-2bar.mid` … `Congas4-2bar.mid`, `CabasaEighths.mid`, `CowBellBeat.mid`, `ShakerSixteenths.mid`, `TambourineOffBeat.mid`, `Tambourine2-4.mid`, `TambourineEighths.mid`, `TambourineSixteenths.mid`, `TriangleEighths.mid`, `TriangleSixteenths.mid`.

**Use**: Latin/percussion layers; convert to our pattern format for optional percussion channel or Bossa/Latin styles.

### 10.3 Style catalog (code → data)

**YamJJazzDefaultRhythms** (`plugins/YamJJazz/.../YamJJazzDefaultRhythms.java`): Map of style filename → Genre + tags. No binary dependency. We can export this to JSON as our **style library catalog** (name, genre, tags, preferred tempo if we add it), and use it for style registry and UI (e.g. “Bossa”, “Jazz Waltz”, “Cha Cha”).

Example entries: `BossaNova2.S469.prs` → BOSSA, tags "bossa", "song-for-my-father"; `JazzWaltzMed.S351.sst` → JAZZ, "waltz", "jazz waltz", "footprints"; etc.

### 10.4 Yamaha style files (.prs, .sst, .yjz, .sty, .bcs)

- **Location**: Shipped in `YamahaDefaultFiles.zip` / `YamJJazzDefaultFiles.zip` (not in repo; part of JJazzLab build/distribution).
- **Content**: Full patterns for many styles (comping, bass, drums, etc.) in Yamaha proprietary format. JJazzLab reads them via YamJJazz parsers (binary).
- **Options**: (1) Obtain ZIP from JJazzLab install/source and document format for a future JS/TS parser; (2) Use only the **catalog** (10.3) and our algorithmic + JJSwing MIDI–derived patterns; (3) Long-term: port or reimplement a minimal Yamaha style reader if we need exact comping patterns from those files.

**Recommendation**: Phase 1 of library import = JJSwing MIDI + style catalog. Yamaha binary = later phase or research spike.

---

## 11. References (Code Paths)

- Rhythm DB: `core/RhythmDatabase/`, `core/Rhythm/src/main/java/org/jjazz/rhythm/api/` (Genre, Division, RhythmFeatures).
- JJSwing: `plugins/JJSwing/` — JJSwingRhythm, BassGenerator, DrumsGenerator, BassStyle, DrumsStyle, SwingTransformations, SwingProfile, tempo adapters.
- JJSwing MIDI: `plugins/JJSwing/src/main/resources/org/jjazz/jjswing/drums/db/drums44DB.mid`, `.../bass/db/WalkingBass*.mid`.
- YamJJazz: `plugins/YamJJazz/` — YamJJazzDefaultRhythms, Style, StylePart; default files in ZIP (not in repo).
- PhraseTransform percussion: `core/PhraseTransform/.../resources/*.mid`.
- Song: `core/ChordLeadSheet/`, `core/SongStructure/`, `app/ActiveSong/` (ActiveSongBackgroundMusicBuilderImpl).
- Phrase DBs (code): `plugins/JJSwing/.../bass/db/`, `.../drums/db/`.

---

## 12. Phase 1 Research Summary (Style Registry, Swing, Bass, Drums)

### 12.1 Rhythm model (concept only; no Java implementation)

- **RhythmDatabase / RhythmInfo / RhythmFeatures**: Central registry of rhythms by id, name, tags, time signature, preferred tempo. **Genre** (JAZZ, BOSSA, SAMBA, BLUES, …) and **Division** (BINARY, EIGHTH_SHUFFLE, EIGHTH_TRIPLET) drive matching and grid.
- **Borrow**: A **style registry** keyed by (genre + division + tempo): e.g. "Medium Swing" = JAZZ + EIGHTH_SHUFFLE + medium tempo range. We define a small set of named styles and map each to GrooveManager / DrumEngine / WalkingBassEngine / ReactiveCompingEngine presets. No port of the Java RhythmDatabase.

### 12.2 Swing: tempo–swing correlation and shared pipeline

- **JJazzLab**: Slow = stronger swing, fast = straighter. `SwingProfile.swingRatios` = [50→2.3, 120→2.0, 190→1.8, 240→1.6] BPM. Upbeat position = R/(1+R) for ratio R; so **2.0 at 120 BPM** → fraction 2/3 ≈ 0.667. Bass and drums share SwingTransformations (same swing + humanization).
- **GrooveManager (current)**: Returns fraction of beat for the upbeat; linear 0.75 @ 60 BPM, 0.5 @ 180 BPM → **120 BPM ≈ 0.625**.
- **Alignment**: Phase 2 should tune `getSwingRatio(bpm)` so 120 BPM gives 2/3 (0.6667) and the curve matches JJazzLab’s four-point trend. Document and verify that bass and drums in `useJazzBand` use a single `getOffBeatOffsetInBeat` and `getHumanizationJitter`.

| BPM (ref) | JJazzLab ratio | Upbeat fraction | GrooveManager (current) |
|-----------|----------------|-----------------|-------------------------|
| 50        | 2.3            | ~0.697          | —                       |
| 120       | 2.0            | 2/3 ≈ 0.667     | ~0.625                  |
| 190       | 1.8            | ~0.643          | —                       |
| 240       | 1.6            | ~0.615          | —                       |

### 12.3 Bass: BassStyle (Two-feel, Walking, Double-note, Intro/Ending)

- **Borrow**: **Two-feel** (roots on 1 and 3 in 4/4, or 1 and 2 in 3/4) and optional **double-time walking** (8th-note subdivision). Keep our **algorithmic** WalkingBassEngine; **no Wbp phrase DB**. Intro/Ending handled by place-in-cycle (sparse/half-time).

### 12.4 Drums: DrumsStyle (Ride, Brushes, Shuffle, Intro/Ending)

- **Borrow**: Named feels — **Ride** (spang-a-lang), **Brushes**, **Shuffle** — and sparse **Intro/Ending** by place-in-cycle. Same shared bass/drums swing + humanization pipeline. No DpSourceDatabase port; keep algorithmic DrumEngine with style-driven pattern/density.
