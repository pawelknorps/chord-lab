---
phase: 13
name: Standards-Based Exercises (Scales, Guide Tones, Arpeggios)
waves: 4
dependencies: ["Phase 9: Mic Algorithm (stabilized pitch)", "Phase 1: Feedback Engine (scoring concepts)", "JazzKiller + useJazzBand (playback, chart sync)"]
files_modified: [
  "src/modules/JazzKiller/JazzKillerModule.tsx",
  "src/modules/JazzKiller/state/jazzSignals.ts"
]
files_created: [
  "src/modules/JazzKiller/core/StandardsExerciseEngine.ts",
  "src/modules/JazzKiller/core/ExerciseInputAdapter.ts",
  "src/modules/JazzKiller/hooks/useStandardsExercise.ts",
  "src/modules/JazzKiller/components/StandardsExercisesPanel.tsx"
]
---

# Phase 13 Plan: Standards-Based Exercises (JazzKiller Module)

**Focus**: Add a **new module inside JazzKiller** that delivers timed exercises over the standards: the student plays appropriate **scales**, **guide tones**, or **arpeggios** for each chord in sync with JazzKiller playback and the lead-sheet chart. Uses existing mic detection; all exercises work for **both mic and MIDI input**. Same standard picker, same chart, same band—exercises are a view/panel within JazzKiller.

**Success Criteria**:
- Inside JazzKiller, user can pick a standard (same library), choose exercise type (Scales / Guide Tones / Arpeggios), choose input (Mic / MIDI), start playback, and receive real-time evaluation against the correct scale, guide tones, or arpeggio for each chord.
- Single exercise engine consumes either mic pitch (via existing pipeline) or MIDI; same scoring logic for both.
- REQ-SBE-01 through REQ-SBE-05 satisfied.

---

## Context (Existing Assets)

- **Jazz standards**: `useJazzLibrary`, JazzKiller measures/chords; `loadSong`, `currentMeasureIndexSignal`, `currentBeatSignal`, `currentChordSymbolSignal`.
- **Playback**: `useJazzBand`; Transport and BPM; chart-driven chord progression.
- **Theory**: `ChordScaleEngine.getScales(chordSymbol)`, `GuideToneCalculator.calculate(chordSymbol)`, Tonal.js `Chord.get(chord).notes`, AiContextService (guideTones, chordTones, suggestedScale).
- **Input**: Mic pipeline (useHighPerformancePitch, pitch-processor.js, CrepeStabilizer); MIDI (MidiContext, useMidi, lastNote, activeNotes).
- **Scoring pattern**: HighPerformanceScoringBridge + useScoringStore (processNote); we add exercise-specific target logic and optional store/hook.

---

## Wave 1: Unified Input Adapter and StandardsExerciseEngine Core

*Goal: Single "student note(s)" API from either mic or MIDI; engine that derives target set (scale / guide tones / chord tones) and scores incoming notes.*

- <task id="W1-T1">**ExerciseInputAdapter**  
  Create `src/modules/JazzKiller/core/ExerciseInputAdapter.ts` (or a hook that composes existing hooks). Expose a unified interface used by the exercise engine:
  - **Mic path**: Use `useHighPerformancePitch().getLatestPitch()` (or useITMPitchStore) → frequency → Tonal.js `Note.midi(Note.fromFreq(freq))` → current note (and optional confidence). Optionally expose "notes in last N ms" for polyphonic scoring later.
  - **MIDI path**: Use `useMidi()` → `lastNote` (and/or `activeNotes`) → current note(s). Normalize to same shape as mic path (e.g. `{ note: number, source: 'mic'|'midi' }`).
  - API: `getCurrentNote(): number | null` and/or `getNotesInWindow(ms?: number): number[]` so the engine does not branch on input source.</task>

- <task id="W1-T2">**StandardsExerciseEngine (target set)**  
  Create `src/modules/JazzKiller/core/StandardsExerciseEngine.ts`. Given `(chordSymbol: string, exerciseType: 'scale'|'guideTones'|'arpeggio')`:
  - **scale**: Call `ChordScaleEngine.getScales(chordSymbol)`; return `primary.notes` (pitch-class strings or MIDI in a fixed octave for comparison).
  - **guideTones**: Call `GuideToneCalculator.calculate(chordSymbol)`; return 3rd and 7th (note names or MIDI).
  - **arpeggio**: Use Tonal.js `Chord.get(chordSymbol).notes` (or AiContextService chordTones); return chord tones (note names or MIDI).
  - Normalize all to a comparable form (e.g. pitch-class set or MIDI set in one octave) so scoring is consistent. Expose `getTargetSet(chordSymbol, exerciseType): number[]` (MIDI in one octave) or equivalent.</task>

- <task id="W1-T3">**StandardsExerciseEngine (scoring)**  
  In the same engine (or same module), add scoring: given `(studentNote: number, targetSet: number[], exerciseType, measureIndex?, beat?)`:
  - **scale**: Student note (pitch-class) in target set → hit; optional: score only on downbeats (beat === 0).
  - **guideTones**: Student note matches 3rd or 7th (pitch-class) → hit; prefer downbeat scoring (reuse REQ-FB-02 concept).
  - **arpeggio**: Student note (pitch-class) in chord tones → hit.
  - Return `{ hit: boolean, targetLabel?: string }` and optionally accumulate accuracy per measure/session for UI.</task>

---

## Wave 2: Scale, Guide-Tone, and Arpeggio Modes

*Goal: Wire ChordScaleEngine, GuideToneCalculator, and chord tones to the engine; ensure sync with current chord from chart.*

- <task id="W2-T1">**Scale exercise flow**  
  When exercise type is "scale", engine uses `ChordScaleEngine.getScales(currentChordSymbol).primary.notes` as target. On each student note (from adapter), check pitch-class membership in that scale; record hit/miss and optional accuracy. Current chord comes from `currentChordSymbolSignal` (same as JazzKiller chart).</task>

- <task id="W2-T2">**Guide-tone exercise flow**  
  When exercise type is "guideTones", engine uses `GuideToneCalculator.calculate(currentChordSymbol)` → 3rd and 7th as target set. Score hit when student note matches 3rd or 7th (pitch-class); optionally weight downbeats (beat 0) higher. Reuse concept from REQ-FB-02 (Target Note mastery) without changing useScoringStore.</task>

- <task id="W2-T3">**Arpeggio exercise flow**  
  When exercise type is "arpeggio", engine uses chord tones (Tonal.js `Chord.get(currentChordSymbol).notes`) as target. Score hit when student note (pitch-class) is in chord tones. Sync with `currentMeasureIndexSignal` and `currentChordSymbolSignal` so target updates with the chart.</task>

---

## Wave 3: JazzKiller Exercises UI (Panel and Integration)

*Goal: Exercises view/panel inside JazzKiller; same standard picker, same playback; real-time feedback.*

- <task id="W3-T1">**StandardsExercisesPanel component**  
  Create `src/modules/JazzKiller/components/StandardsExercisesPanel.tsx`. Content:
  - Exercise type selector: Scales | Guide Tones | Arpeggios (buttons or tabs).
  - Input selector: Mic | MIDI (if MIDI available via useMidi inputs length); default Mic.
  - Display current chord (from `currentChordSymbolSignal`) and target: scale name (e.g. "D Dorian"), guide tones (e.g. "3rd: F, 7th: C"), or chord tones list.
  - Start/stop playback: reuse same Transport (useJazzBand togglePlayback or equivalent); panel does not own playback, just reflects isPlaying and current measure/beat.
  - Real-time feedback: correct/incorrect indicator and optional accuracy % (e.g. hits / opportunities this measure or session). Optional: small heatmap or per-chord hit display.</task>

- <task id="W3-T2">**useStandardsExercise hook**  
  Create `src/modules/JazzKiller/hooks/useStandardsExercise.ts` that:
  - Takes exercise type, input source (mic | midi), and current song (measures, currentMeasureIndex, currentBeat, currentChordSymbol from signals).
  - Uses ExerciseInputAdapter for student notes and StandardsExerciseEngine for target set + scoring.
  - Returns: current target set (for display), last hit/miss, running accuracy (optional), and a method to reset session stats.
  - Subscribes to Transport/measure/beat so scoring runs in time with the chart.</task>

- <task id="W3-T3">**JazzKiller integration**  
  In `JazzKillerModule.tsx`: Add state `showStandardsExercises` (or mode `'play' | 'exercises'`). Add an entry point (e.g. "Exercises" button or menu item next to Guided Practice / Drills) that sets the state and shows `StandardsExercisesPanel`. When panel is open, the selected standard and playback are unchanged (same `selectedStandard`, same useJazzBand); panel only shows exercise-specific UI and consumes same `currentMeasureIndexSignal`, `currentBeatSignal`, `currentChordSymbolSignal`. Ensure panel can mount/unmount without stopping playback if user switches view.</task>

---

## Wave 4: Tests and Verification

*Goal: Unit tests for engine and adapter; verification checklist.*

- <task id="W4-T1">**Unit tests: StandardsExerciseEngine**  
  Add tests (e.g. `StandardsExerciseEngine.test.ts`) for:
  - `getTargetSet(chord, 'scale')`: known chord (e.g. Dm7) returns expected scale pitch-classes (e.g. D Dorian).
  - `getTargetSet(chord, 'guideTones')`: returns 3rd and 7th for Dm7 (F and C).
  - `getTargetSet(chord, 'arpeggio')`: returns chord tones for Dm7.
  - Scoring: student note in set → hit; not in set → miss.</task>

- <task id="W4-T2">**Unit tests: ExerciseInputAdapter (optional)**  
  If the adapter is testable in isolation (e.g. inject mock pitch/MIDI), add tests that mock mic and MIDI inputs and assert `getCurrentNote()` or `getNotesInWindow()` returns expected values. Otherwise, cover via integration or manual verification.</task>

- <task id="W4-T3">**Verification checklist**  
  - Scale: Load a standard in JazzKiller, open Exercises, select Scale, play scale tones in time with the chart (mic or MIDI); UI shows correct/incorrect and updates per chord.
  - Guide tones: Same; play 3rd/7th on downbeats; scoring reflects target-note hits.
  - Arpeggio: Same; play chord tones; scoring reflects chord-tone hits.
  - Unified input: Same flows work with Mic and with MIDI (when MIDI device selected).
  - Update STATE.md and phase SUMMARY.md when complete.</task>

---

## Implementation Notes

- **No new theory**: Use only ChordScaleEngine, GuideToneCalculator, Tonal.js Chord.notes (or AiContextService chordTones). No new chord/scale logic.
- **Reuse playback**: Exercises panel does not start/stop Transport itself; it uses the same useJazzBand/Transport as the main JazzKiller view. User starts playback from main controls or from panel if we mirror the same toggle.
- **Optional persistence**: Director/FSRS integration for "what to practice next" is out of scope for this phase; document as future enhancement if needed.

---

## Verification

- [ ] ExerciseInputAdapter exposes getCurrentNote() (and optionally getNotesInWindow); mic path uses useHighPerformancePitch → freq → note; MIDI path uses useMidi → lastNote/activeNotes.
- [ ] StandardsExerciseEngine getTargetSet(chord, type) returns correct scale notes, guide tones (3rd/7th), or chord tones; scoring returns hit/miss for student note vs target set.
- [ ] Scale, guide-tone, and arpeggio flows use currentChordSymbolSignal and sync with chart; accuracy or hit feedback updates in real time.
- [ ] StandardsExercisesPanel shows exercise type, input selector, current chord, target, and feedback; integrated into JazzKiller via showStandardsExercises (or mode) and entry button.
- [ ] Unit tests for StandardsExerciseEngine (target set + scoring); verification checklist passed for mic and MIDI.
