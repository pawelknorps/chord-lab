# JJazzLab Library Import — Plan

This phase pulls the **library of styles, rhythms, and comping patterns** from JJazzLab into Chord Lab: extract data from the legacy repo, convert to our formats, and wire into JazzKiller playback.

---

## Goals

1. **Drum patterns**: Use JJazzLab’s `drums44DB.mid` (all DrumsStyle variants) as our drum pattern source for swing (Ride, Brushes, Shuffle, Intro/Ending, etc.).
2. **Bass phrases**: Use JJSwing bass MIDI (walking + two-feel A/B) as optional phrase library for tiling or as reference to validate/enrich our WalkingBassEngine and two-feel.
3. **Style catalog**: One canonical list of styles (name, genre, tags) from YamJJazzDefaultRhythms for the style registry and UI.
4. **Optional**: Percussion patterns (Congas, Tambourine, etc.) for Latin/Bossa layers.
5. **Document**: Yamaha .prs/.sst/.yjz and ZIP so we can decide later whether to add a parser for full comping patterns.

---

## Source Assets (in repo)

| Asset | Path (relative to `legacy_projects/JJazzLab-master`) |
|-------|--------------------------------------------------------|
| Drums 4/4 DB | `plugins/JJSwing/src/main/resources/org/jjazz/jjswing/drums/db/drums44DB.mid` |
| Bass walking | `plugins/JJSwing/src/main/resources/org/jjazz/jjswing/bass/db/WalkingBassMidiDB.mid` |
| Bass 2-feel A | `plugins/JJSwing/src/main/resources/org/jjazz/jjswing/bass/db/WalkingBass2feelAMidiDB.mid` |
| Bass 2-feel B | `plugins/JJSwing/src/main/resources/org/jjazz/jjswing/bass/db/WalkingBass2feelBMidiDB.mid` |
| Percussion | `core/PhraseTransform/src/main/resources/org/jjazz/phrasetransform/resources/*.mid` |
| Style catalog | `plugins/YamJJazz/.../YamJJazzDefaultRhythms.java` (code → export to data) |

---

## Implementation Plan

### Step 1: MIDI parsing and format

- Add a **build-time or runtime MIDI parser** (e.g. `midi-file` npm or `@tonejs/midi`) to read:
  - **Markers**: Meta events (e.g. marker type 6) for section names (`_RIDE_1`, `#fill`, `_END`, chord symbols in bass files).
  - **Note events**: note-on/off, channel, pitch, velocity, tick position.
- Define our **pattern format** (TypeScript types + JSON):
  - **Drum pattern**: `{ styleId, name, events: { timeBeats, instrument, velocity }[], timeSignature }`.
  - **Bass phrase**: `{ styleId, bars, chordSequence?, events: { timeBeats, pitchMidi, velocity, durationBeats }[] }`.
- Resolution: JJazzLab uses PPQ; we can normalize to beats (e.g. 480 ticks = 1 beat) and store in our format.

### Step 2: Drums

- Script or module: read `drums44DB.mid`, split by markers `_<DRUMS_STYLE>` and `#fill` / `#alt` / `_END`.
- Map MIDI note numbers to our `DrumInstrument` (Ride, Snare, Kick, HatPedal, HatOpen) using GM drum map if that’s what JJazzLab uses.
- Output: one JSON file or TS module per style (or one big `jjazzlab-drum-patterns.ts`) and load into `DrumEngine` / pattern registry so we can select “Ride 1”, “Brushes 1”, “Intro”, etc.

### Step 3: Bass

- Parse the three bass MIDI files; extract sessions and phrases (markers + note runs). WbpSourceDatabase expects chord symbols as markers and builds 1–4 bar phrases.
- Output: bass phrase library (e.g. `jjazzlab-bass-phrases.ts` or JSON) keyed by style (walking, 2feel-a, 2feel-b) and optionally by chord progression length.
- Integration: (a) Use as **reference** only and keep generating bass with WalkingBassEngine + two-feel mode; or (b) Add a **phrase-tiling** path that picks phrases from this library by chord match and concatenates them (more work, higher fidelity to JJazzLab).

### Step 4: Style catalog

- Extract from `YamJJazzDefaultRhythms.java`: for each `add("StyleName.ext", Genre.X, "tag1", "tag2")`, emit `{ id, name, genre, tags }`.
- Add preferred tempo and time signature where we can infer (e.g. from filename or a small map).
- Output: `src/data/jjazzlab-style-catalog.ts` or `public/data/jjazzlab-styles.json`.
- Use in style registry (Phase 4) and in UI (e.g. “Choose style” dropdown).

### Step 5: Percussion (optional)

- Parse PhraseTransform `.mid` files; convert to our percussion pattern format (time, instrument, velocity).
- Map instrument names (Congas, Cabasa, etc.) to our percussion channel or to a new “percussion” layer.
- Use for Bossa/Latin styles when we add them.

### Step 6: Documentation

- Add a short doc (or section in RESEARCH.md) on Yamaha style files: where to get `YamahaDefaultFiles.zip` / `YamJJazzDefaultFiles.zip`, what .prs/.sst/.yjz contain (comping, bass, drums per style), and that a future phase could add a parser to pull comping patterns from those binaries.

---

## Yamaha style files (.prs, .sst, .yjz, .sty, .bcs) — reference

- **Location**: Not in the Chord Lab repo. Shipped in JJazzLab as:
  - `YamahaRhythmProvider`: `resources/YamahaDefaultFiles.zip` (in plugin `plugins/YamJJazz`).
  - `YamJJazzRhythmProvider`: `resources/YamJJazzDefaultFiles.zip`.
  These ZIPs are part of the JJazzLab build/distribution; extract from an installed JJazzLab or from the [JJazzLab source](https://github.com/jjazzboss/JJazzLab) build artifacts.
- **Content**: Yamaha proprietary style format. Each file defines one rhythm style: comping (chord) patterns, bass patterns, drum patterns, and meta (tempo, time signature). JJazzLab reads them via `YamJJazzRhythmImpl` and related parsers in `plugins/YamJJazz`.
- **Future**: A future phase could add a JS/TS parser (or port the Java reader) to extract comping/bass/drum patterns from these binaries for use in our style registry. For now we use the **style catalog** (from YamJJazzDefaultRhythms) and **JJSwing MIDI** (drums + bass) only.

---

## Deliverables

- `src/data/jjazzlab-drum-patterns.ts` (or JSON) — drum patterns per DrumsStyle.
- `src/data/jjazzlab-bass-phrases.ts` (or JSON) — optional bass phrase library.
- `src/data/jjazzlab-style-catalog.ts` — style id, name, genre, tags.
- Optional: `src/data/jjazzlab-percussion-patterns.ts` for Latin/percussion.
- Doc: Yamaha format and ZIP (in RESEARCH.md or LIBRARY_IMPORT.md).
- Integration: DrumEngine (or equivalent) loads drum patterns; style registry uses catalog; bass optionally uses phrase library.

---

## Dependencies

- Phase 4 (Style Registry) can consume the style catalog; Phase 3 (Bass Two-Feel, Drum Feels) can consume drum patterns and optional bass phrases.
- No dependency on Phase 5 (Bossa/Waltz) for minimal import; percussion helps Phase 5.

---

## License

JJazzLab is LGPL v2.1. Extracting data (MIDI, catalog) and converting to our format is using the project as reference; the resulting pattern data and catalog are our own representation. Keep attribution in code or docs (e.g. “Drum patterns derived from JJazzLab JJSwing drums44DB.mid, https://www.jjazzlab.org”).
