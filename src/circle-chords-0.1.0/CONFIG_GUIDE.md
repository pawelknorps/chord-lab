# Application Configuration Guide

## Overview

The app loads musical data (scales, chords, progressions, circle of fifths) from JSON files at runtime. Files live under `public/config/` and are fetched by `src/lib/config.ts`. Editing these files requires no code changes or rebuilds (refresh the page).

## Directory

```
public/config/
├── scales.json         # Scales and 12-note names
├── chords.json         # Chord interval patterns and guitar fingerings
├── progressions.json   # Progressions per mode/scale
└── circleOfFifths.json # Circle of fifths keys and relations
```

---

## 1) Scales and Notes (`public/config/scales.json`)

### File structure:
```json
{
  "scales": {
    "scale_name": [intervals in semitones]
  },
  "notes": ["C", "C#", "D", ...],
  "noteNamesRu": {
    "C": "До", "C#": "До#", ...
  }
}
```

### Add a new scale
```json
{
  "scales": {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "harmonic_minor": [0, 2, 3, 5, 7, 8, 11],
    "blues": [0, 3, 5, 6, 7, 10]
  }
}
```

Notes
- Intervals are semitones from the tonic within one octave.
- UI modes are derived from keys of `scales` (no code changes needed).

---

## 2) Chords (`public/config/chords.json`)

### File structure:
```json
{
  "chordPatterns": {
    "chord_type": [intervals]
  },
  "guitarChords": {
    "Chord": [
      {
        "name": "Position name",
        "frets": [frets for each string],
        "fingers": [fingers for each string]
      }
    ]
  }
}
```

### Add a new chord type
```json
"chordPatterns": {
  "major": [0, 4, 7],
  "minor": [0, 3, 7],
  "sus2": [0, 2, 7],
  "sus4": [0, 5, 7],
  "add9": [0, 4, 7, 14]
}
```

### Add a new fingering
```json
"guitarChords": {
  "C": [
    {
      "name": "Open",
      "frets": [null, 3, 2, 0, 1, 0],
      "fingers": [0, 3, 2, 0, 1, 0]
    },
    {
      "name": "New position",
      "frets": [8, 10, 10, 9, 8, 8],
      "fingers": [1, 3, 4, 2, 1, 1]
    }
  ]
}
```

Rules
- `frets`: 6 elements (6 strings)
- `null` = muted string
- `0` = open string
- `1,2,3...` = fret number
- `fingers`: 0 = unused, 1-4 = finger number

---

## 3) Progressions (`public/config/progressions.json`)

### File structure:
```json
{
  "progressions": {
    "scale": [
      {
        "name": "Progression name",
        "degrees": [scale degrees],
        "types": [chord types],
        "description": "Description"
      }
    ]
  }
}
```

### Add a new progression
```json
"major": [
  {
    "name": "I-V-vi-IV (Pop progression)",
    "degrees": [1, 5, 6, 4],
    "types": ["major", "major", "minor", "major"],
    "description": "Most popular pop progression"
  },
  {
    "name": "I-vi-ii-V (Jazz standard)",
    "degrees": [1, 6, 2, 5],
    "types": ["major", "minor", "minor", "major"],
    "description": "Classic jazz sequence"
  }
]
```

Rules
- `degrees`: scale steps (1-7)
- `types`: chord types ("major", "minor", "dim", "maj7", "min7", "dom7")
- Each scale can contain multiple progressions

---

## 4) Circle of Fifths (`public/config/circleOfFifths.json`)

### File structure:
```json
{
  "majorKeys": ["C", "G", "D", ...],
  "minorKeys": ["Am", "Em", "Bm", ...],
  "relativeMinor": {
    "C": "Am", "G": "Em", ...
  }
}
```

Usually does not require changes, but new keys can be added:

```json
{
  "majorKeys": ["C", "G", "D", "A", "E", "B", "F#", "C#"],
  "minorKeys": ["Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m"],
  "relativeMinor": {
    "C": "Am",
    "G": "Em"
  }
}
```

---

## Practical Examples

### Example 1: Adding seventh chords

**1. Add patterns in `chords.json`:**
```json
"chordPatterns": {
  "maj7": [0, 4, 7, 11],
  "min7": [0, 3, 7, 10],
  "dom7": [0, 4, 7, 10],
  "dim7": [0, 3, 6, 9]
}
```

**2. Add fingerings:**
```json
"Cmaj7": [
  {
    "name": "Open",
    "frets": [null, 3, 2, 0, 0, 0],
    "fingers": [0, 3, 2, 0, 0, 0]
  }
]
```

**3. Use in progressions:**
```json
{
  "name": "ii7-V7-Imaj7 (Jazz)",
  "degrees": [2, 5, 1],
  "types": ["min7", "dom7", "maj7"],
  "description": "Jazz cadence with sevenths"
}
```

### Example 2: Adding a new scale (Harmonic Minor)

**1. In `scales.json`:**
```json
"scales": {
  "major": [0, 2, 4, 5, 7, 9, 11],
  "minor": [0, 2, 3, 5, 7, 8, 10],
  "harmonic_minor": [0, 2, 3, 5, 7, 8, 11]
}
```

**2. In `progressions.json`:**
```json
"harmonic_minor": [
  {
    "name": "i-iv-V-i",
    "degrees": [1, 4, 5, 1],
    "types": ["minor", "minor", "major", "minor"],
    "description": "Classic harmonic minor progression"
  }
]
```

No UI edits required — modes are read from `scales.json`.

---

## Tips

### ✅ Safe to add
- New fingerings
- New progressions
- New chord types (sus2, sus4, add9, etc.)
- New scales and their progressions

### ⚠️ Handle with care
- Changing base notes (may break logic)
- Editing the circle of fifths
- Modifying basic chord types (major/minor)

### 🛠️ Test changes
1. Save JSON file
2. Refresh the page
3. Check console for errors
4. Test new features

---

## JSON Validation

Before saving, ensure JSON is valid:
- Use online validators (jsonlint.com)
- Check braces and commas
- Avoid trailing commas

## Backup

Always back up config files before editing:
```bash
cp -r config/ config_backup/
```
