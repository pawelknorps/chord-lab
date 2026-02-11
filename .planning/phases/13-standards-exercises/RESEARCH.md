# Phase 13 Research: Standards-Based Exercises (JazzKiller Module)

## What We Need to Know to Plan This Phase

### 1. JazzKiller Layout and Adding the Exercises View

- **Pattern**: JazzKiller uses boolean state + panel components: `showDrillMode` → DrillDashboard, `showGuidedPractice` → GuidedPracticePane, `showChordScaleExplorer` → ChordScalePanel, etc. No top-level tabs; panels open over or beside the main content (lead sheet + standard grid).
- **Recommendation**: Add `showStandardsExercises` (or a single "mode" state: `'play' | 'exercises'`) and a **StandardsExercisesPanel** (or **StandardsExercisesView**) that appears when the user switches into "Exercises" for the selected standard. Reuse the same standard picker (grid) and `selectedStandard`; when a standard is loaded, user can choose "Exercises" to enter exercise mode with that chart/playback.
- **Entry point**: A button or menu item in JazzKiller (e.g. "Exercises" next to "Guided Practice", "Drills", etc.) that sets the mode and shows the exercise panel. Panel content: exercise type (Scales / Guide Tones / Arpeggios), input (Mic / MIDI), current chord + target, playback controls, real-time feedback.

### 2. MIDI Input for the Exercise Engine

- **Existing**: `MidiContext` (`src/context/MidiContext.tsx`) provides `useMidi()` with `lastNote`, `activeNotes`, `selectedInput`. `lastNote` has `{ note, velocity, type: 'noteon'|'noteoff', timestamp }`. `GlobalMidiHandler` forwards MIDI to `triggerAttack`/`triggerRelease` in globalAudio.
- **For exercises**: The exercise engine needs a **stream of note events** (or "current note(s)") to compare against the target set. Options:
  - **A)** Subscribe to `useMidi()` in the exercise panel: on each `lastNote` (or a debounced/beat-aligned snapshot of `activeNotes`), pass note(s) to the StandardsExerciseEngine for scoring.
  - **B)** Create a small **unified input adapter** that exposes `getCurrentNote()` / `getNotesInWindow()`: from mic it uses useITMPitchStore/useHighPerformancePitch → frequency → note; from MIDI it uses useMidi → lastNote/activeNotes. Engine only sees "student note(s)" and doesn’t care about source.
- **Recommendation**: Option B so scoring logic is identical for mic and MIDI; adapter is the only place that branches on input source.

### 3. Mic Input for the Exercise Engine

- **Existing**: `HighPerformanceScoringBridge` already wires mic → `useHighPerformancePitch().getLatestPitch()` → frequency → `Note.midi(Note.fromFreq(...))` → `useScoringStore.processNote(midi, currentChord, measureIndex)`. So: stabilized pitch, current chord from `currentChordSymbolSignal`, measure from `currentMeasureIndexSignal`.
- **Scoring store**: `useScoringStore` has `processNote(midi, chordSymbol, measureIndex)` and compares the note to chord tones (and possibly guide tones) for the existing ITM heatmap/accuracy.
- **For exercises**: Either extend the scoring store with an "exercise mode" (scale / guide-tone / arpeggio targets) or add a dedicated **StandardsExerciseEngine** that receives (currentChord, measureIndex, beat, exerciseType) and (studentNote or notes[]) and returns hit/miss and optional score. Prefer a dedicated engine + store for exercises so ITM scoring remains unchanged and we can have exercise-specific UI (e.g. "target: 3rd and 7th", "target: scale tones").

### 4. Chart and Playback Sync

- **Existing**: `currentMeasureIndexSignal`, `currentBeatSignal`, `currentChordSymbolSignal` (from useJazzEngine/useJazzBand) are already driven by the chart and Transport. The exercise engine only needs to read these and the song’s measures (array of chords per measure) to know the current chord and, if needed, the next chord.
- **Measures**: `loadSong({ title, measures, key, bars })` is called when a standard is selected; `measures` is an array of chord arrays. So the engine can take `measures`, `currentMeasureIndex`, `currentBeat` and derive `currentChord` (and optionally next chord for display).

### 5. Theory Services (No New Logic)

- **ChordScaleEngine.getScales(chordSymbol)** → primary scale notes (and alternatives). Use for scale exercise target set.
- **GuideToneCalculator.calculate(chordSymbol)** → { third, seventh, thirdMidi, seventhMidi }. Use for guide-tone exercise target set.
- **Chord.get(chordSymbol).notes** (Tonal.js) or AiContextService chordTones → chord tones for arpeggio exercise.
- All already exist; no new theory in this phase.

### 6. Summary

- **JazzKiller**: Add an Exercises entry point (button/mode) and a panel that uses the same selected standard, same playback, same chart signals.
- **Input**: Unified adapter (mic path: useHighPerformancePitch → freq → note; MIDI path: useMidi → lastNote/activeNotes) so the engine gets a single "student note(s)" API.
- **Engine**: New StandardsExerciseEngine (or service + store) that takes (measures, measureIndex, beat, exerciseType) → target set; takes (studentNote(s)) → score/hit. Reuse ChordScaleEngine, GuideToneCalculator, Chord.notes for targets.
- **No new theory**: Use only existing ChordScaleEngine, GuideToneCalculator, Tonal.js.
