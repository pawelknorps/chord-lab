# Phase 13: Standards-Based Exercises (Scales, Guide Tones, Arpeggios)

## Goal

Use the **already implemented** microphone detection and jazz standards to deliver **timed exercises** in sync with playback and the lead-sheet chart. The student plays appropriate **scales**, **guide tones**, or **arpeggios** for each chord as the standard plays. All exercises work for **both mic input and MIDI input**.

## Context (Existing Assets)

- **Jazz standards**: `standards.json`, `useJazzLibrary`, JazzKiller measures/chords; `loadSong`, `currentMeasureIndexSignal`, `currentBeatSignal`.
- **Playback**: `useJazzBand` / `useJazzPlayback`; Transport and BPM; chart-driven chord progression.
- **Theory**: `ChordScaleEngine.getScales(chordSymbol)`, `GuideToneCalculator.calculate(chordSymbol)`, `AiContextService.generateBundle` (guideTones, chordTones, suggestedScale).
- **Input**: Mic pipeline (useITMPitchStore, pitch-processor.js, CrepeStabilizer); existing scoring (e.g. HighPerformanceScoringBridge, REQ-FB-02 “Target Note mastery”).
- **MIDI**: Identify where MIDI input is consumed (e.g. globalAudio, UnifiedPiano) so the same “note stream” can feed the exercise engine.

## Strategy

1. **Exercise engine (unified)**  
   Single service that:
   - Knows **current chord** (from chart + measure/beat).
   - Knows **exercise type**: Scales | Guide Tones | Arpeggios.
   - For each type, derives **target set** (scale notes, 3rd/7th, or chord tones) using existing theory.
   - Consumes **input stream**: either (a) mic → stabilized pitch → note name, or (b) MIDI note-on/off.
   - Scores **in time** (e.g. downbeats, or per beat) and exposes accuracy / correct vs incorrect.

2. **Scale exercise**  
   Per chord: target = `ChordScaleEngine.getScales(chord).primary.notes` (or chosen scale). Student must play notes from that scale in time with the chart; scoring can be “note in scale” or “hit scale tones on beat”.

3. **Guide-tone exercise**  
   Per chord: target = 3rd and 7th from `GuideToneCalculator.calculate(chord)`. Reuse/extend REQ-FB-02 logic: bonus/score for hitting 3rd/7th on downbeats (or designated beats).

4. **Arpeggio exercise**  
   Per chord: target = chord tones (e.g. `Chord.get(chord).notes` or AiContextService chordTones). Evaluate student input against these notes in real time, in sync with playback.

5. **Unified input (REQ-SBE-04)**  
   - **Mic**: useITMPitchStore (or usePitchTracker) → frequency → `frequencyToNote` → note name (and optional MIDI). Feed same “current note” API as MIDI path.
   - **MIDI**: Subscribe to MIDI input (Web MIDI or internal keyboard); normalize to “current note” or “recent notes” per beat/measure.
   - **Exercise engine**: Consumes a single “student note(s)” interface (e.g. `getCurrentNote()` / `getNotesInWindow(beat)`); implementation differs for mic vs MIDI, but scoring logic is shared.

6. **UI**  
   - Exercise mode selector: Scales | Guide Tones | Arpeggios.
   - Standard selector (reuse JazzKiller standard picker / useJazzLibrary).
   - Input selector: Mic | MIDI (if MIDI available).
   - Start/stop playback; show current chord, target (scale name, guide tones, or chord tones), and real-time feedback (correct/incorrect, accuracy, optional heatmap).

## Implementation Outline

| Task | Description |
|------|-------------|
| **Unified input adapter** | Abstraction that exposes “current note(s)” from either mic pipeline or MIDI; used by exercise engine. |
| **StandardsExerciseEngine** | Service that, given (song measures, current measure/beat, exercise type), returns target set (scale notes, guide tones, or chord tones) and scores incoming notes. |
| **Scale exercise** | Wire ChordScaleEngine to engine; real-time “in scale” or “target beat” scoring. |
| **Guide-tone exercise** | Wire GuideToneCalculator to engine; reuse/extend downbeat target-note scoring. |
| **Arpeggio exercise** | Wire chord tones (Tonal or AiContextService) to engine; real-time chord-tone scoring. |
| **Exercise UI** | New view or panel in JazzKiller (or dedicated route): choose exercise type + standard + input; show target and feedback during playback. |
| **Tests** | Unit tests for StandardsExerciseEngine (target sets for sample chords); integration test that engine receives mock “student notes” and produces expected scores. |

## Dependencies

- Phase 9 (Mic Algorithm) for stable pitch.
- Phase 1 (Feedback Engine) for scoring concepts (REQ-FB-02).
- JazzKiller + useJazzBand for playback and chart sync.
- ChordScaleEngine, GuideToneCalculator, AiContextService (existing).

## Verification

- **Scale**: Load a standard, select “Scale” exercise, play scale tones in time with the chart (mic or MIDI); UI shows correct/incorrect and updates per chord.
- **Guide tones**: Same; play 3rd/7th on downbeats; scoring reflects target-note hits.
- **Arpeggio**: Same; play chord tones; scoring reflects chord-tone hits.
- **Unified input**: Same flows work with mic and with MIDI (if MIDI is implemented).
- **Automated**: Unit tests for target-set derivation and scoring logic; optional E2E for one exercise type.

## Out of Scope (this phase)

- CREPE-WASM swap (Phase 9 enhancement).
- New theory (chord/scale) logic—use existing only.
- Full Director/FSRS integration for “what to practice next” (optional later).
