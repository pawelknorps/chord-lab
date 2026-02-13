# Innovative Exercises Revamp – Project Vision

## Vision Statement

Revamp the **Innovative Exercises** module so it is **connected to student progress** and delivers **AI-crafted exercises** tailored to each student based on their performance across the entire app. Exercises are **mic-ready**, use **musical audio examples** from the existing library (licks, stems, standards), and leverage all built resources (ChordScaleEngine, GuideToneCalculator, session history, mastery tree, standards heatmaps).

## Problem Statement

- The current Innovative Exercises module (Phase 17) offers six fixed exercises (Ghost Note, Intonation Heatmap, Voice-Leading Maze, Swing Pocket, Call and Response, Ghost Rhythm) with **no link to student progress** or weak spots.
- Students get the same content regardless of whether they struggle with guide tones on ballads, intonation on the 7th, or swing feel—**no personalization**.
- The app already captures rich data: session history (PerformanceSegment), song progress, mastery tree, standards exercise heatmaps, ear-training performance, and AI critique. That data is **not used to drive what exercises appear** or how they are parameterized.
- Teachers and students want **“for you” drills** that feel like a tutor who has seen every practice session and picks the next exercise accordingly.

## Core Value Proposition

**“The right exercise at the right time, from your own performance data.”**

1. **Progress-connected**: Innovative Exercises consume student progress from every part of the app—JazzKiller standards (heatmaps, accuracy, weak measures), ITM session history, Mastery Tree (unlocked skills, XP), song progress (BPM, hotspots), Functional Ear Training and Rhythm Architect results where available.
2. **AI-crafted**: An AI layer (Gemini Nano / existing jazzTeacherLogic pattern) uses aggregated performance data to decide **which** exercise type to suggest, **which** parameters (key, chord subset, tempo, difficulty), and **which** musical content (e.g. a lick from the library that targets the student’s weak ii–V bar).
3. **Mic-ready**: All delivered exercises run on the existing mic pipeline (SwiftF0, useITMPitchStore, useHighPerformancePitch) and optional MIDI; no new input stack.
4. **Musical audio from library**: Exercises use the app’s existing library—licks (ghost-note fill targets, call-and-response breaks), backing stems, ChordScaleEngine/GuideToneCalculator for scales and guide tones, standards for context—so feedback and examples sound like the rest of the product.

## Target Audience

- **Students** who want practice that adapts to their real weaknesses (e.g. “you often miss the 7th on G7 in bar 8”) instead of a fixed menu.
- **Teachers** who want the Innovative Exercises module to reflect what they see in the dashboard: weak areas drive the suggested drills.
- **Product** alignment: one coherent “practice” surface that connects Mastery Tree, JazzKiller, ITM, and Innovative Exercises via data and AI.

## Core Functionality (The ONE Thing)

**A single revamped Innovative Exercises experience where the student sees a “For You” (or “Recommended”) section driven by AI and progress data, and each recommended exercise is mic-ready and uses musical content (keys, chords, licks, backing) from the app’s existing resources.**

Users must be able to:

- Open Innovative Exercises and see **personalized recommendations** (e.g. “Focus on guide tones in bar 8 of Autumn Leaves” or “Swing pocket: you tend to push; try Lay Back”).
- Start a recommended (or manually chosen) exercise and **play into the mic** with real-time feedback, using **library-backed** audio (licks, scales, guide tones, backing) where applicable.
- Have **new sessions and progress** (e.g. Standards heatmap, ITM score) **influence** future recommendations without leaving the module.

## High-Level Requirements

### I. Progress & Data Integration

| Area | Data Source | Use in Revamp |
|------|-------------|----------------|
| **Session history** | useSessionHistoryStore, PerformanceSegment, itmSyncService | Weak measures, low-accuracy segments, standard/song identity → suggest exercises on those chords/keys. |
| **Mastery Tree** | useMasteryStore, useMasteryTreeStore | Unlocked skills, XP, gaps → suggest exercises that reinforce or fill gaps. |
| **Song progress** | useProfileStore, song_progress (Supabase) | Hotspots, max BPM, mastered vs not → difficulty and focus area. |
| **Standards exercises** | Standards heatmaps (Scales / Guide Tones / Arpeggios), generateStandardsExerciseAnalysis | Per-measure accuracy → AI suggests e.g. “Voice-Leading Maze in Dm7–G7” or “Ghost Note in this lick.” |
| **ITM scoring** | useScoringStore, heatmap, measureTicks | Same as session history: weak bars/chords drive targets. |
| **Ear / Rhythm** | useEarPerformanceStore, Rhythm Architect state (if exposed) | Optional: weak intervals or rhythm areas → suggest Intonation Heatmap or Swing Pocket / Call and Response. |

### II. AI Exercise Crafting

- **Input to AI**: Aggregated summary of the above (e.g. weak measures per standard, last N sessions’ scores, mastery nodes, preferred key/tempo).
- **Output**: Recommended exercise type (Ghost Note, Intonation Heatmap, Voice-Leading Maze, Swing Pocket, Call and Response, Ghost Rhythm) + parameters: key, chord(s), tempo, specific lick or progression slice, difficulty hint.
- **Implementation**: Reuse Gemini Nano + jazzTeacherLogic pattern; new or extended function e.g. `generateInnovativeExerciseRecommendations(progressSummary)` returning structured recommendations (exerciseId, params, reason).

### III. Mic-Ready Delivery

- All six existing exercise types remain **runnable** with current mic (and optional MIDI) pipeline.
- Recommendations **parameterize** existing exercises (e.g. Voice-Leading Maze with Dm7–G7–Cmaj7 in F; Ghost Note with a specific lick from the library that has a ghost on the 7th).
- No new exercise “runner” stack: reuse InnovativeExercisesModule, existing panels/hooks, useITMPitchStore, useHighPerformancePitch, frequencyToNote, GuideToneCalculator, ChordScaleEngine.

### IV. Musical Audio from Library

- **Licks**: Use existing lick library (e.g. ghost-note licks, call-and-response breaks) so AI can pick “this lick for this student” based on chord/weak measure.
- **Scales / guide tones**: ChordScaleEngine, GuideToneCalculator for key and chord → scale degrees and guide tones (Intonation Heatmap, Voice-Leading Maze).
- **Backing**: Where applicable, use existing backing/stems or Tone.js patterns (e.g. ii–V–I backing in Voice-Leading Maze) parameterized by AI-chosen key/chords.
- **Standards**: Optional link to a standard (e.g. “Autumn Leaves bar 8”) so exercise feels connected to repertoire.

## Technical Constraints

- **No duplicate pipelines**: Reuse pitch (SwiftF0, useITMPitchStore), theory (GuideToneCalculator, ChordScaleEngine), rhythm (onset, transport), and audio (globalAudio, playback).
- **AI**: Reuse Gemini Nano + createGeminiSession / jazzTeacherLogic pattern; keep prompts and response format structured so UI can map to exerciseId + params.
- **Data**: Read-only consumption of session history, profile, mastery, standards heatmaps; no change to how those stores are written (they stay updated by existing flows).
- **UI**: Extend Innovative Exercises module: add “For You” / “Recommended” section and wire recommended params into existing panels.

## Out of Scope (v1)

- Full procedural generation of new exercise *types* (only parameterization of existing six).
- Real-time “AI listens and changes exercise mid-session” (recommendations are pre-session or between sessions).
- Separate teacher-only “assign exercise” flow (can be v2).

## Success Metrics

- Student opens Innovative Exercises and sees at least one **personalized recommendation** when progress data exists (session history or standards heatmap or mastery).
- Recommended exercise **launches with AI-chosen parameters** (e.g. key, chord set, lick) and is **mic-ready** (play → feedback).
- **Musical audio** (licks, backing, scales) used in recommended exercises comes from the **existing library** (no placeholder or generic content only).
- New practice (e.g. completing a Standards exercise or ITM run) **influences** next recommendations (e.g. after improving bar 8, next recommendation can shift to another weak area).

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Revamp, not replace** | Keep existing six exercises and UI; add progress + AI layer on top so current investment is preserved. |
| **Structured AI output** | Recommendations must be machine-readable (exerciseId + params) so the module can launch the right panel with the right key/chord/lick. |
| **Library-first audio** | All musical content from existing library (licks, ChordScaleEngine, GuideToneCalculator, backing) so experience is consistent and maintainable. |
| **Read-only progress** | Innovative Exercises only reads from session history, profile, mastery, heatmaps; other modules keep owning writes. |
| **Mic-first** | Same as Phase 17: mic-ready by default, MIDI optional via existing adapters. |

## Integration Points

- **Progress**: useSessionHistoryStore, useMasteryStore, useMasteryTreeStore, useProfileStore, useScoringStore; Standards heatmap data (e.g. from useStandardsExerciseHeatmapStore or equivalent); itmSyncService for cloud history.
- **AI**: jazzTeacherLogic (extend with `generateInnovativeExerciseRecommendations` or equivalent); Gemini Nano session; structured prompt/response.
- **Theory & audio**: ChordScaleEngine, GuideToneCalculator, globalAudio, lick library, Tone.js backing, standards metadata.
- **UI**: InnovativeExercisesModule (add “For You” section); existing panels (GhostNoteMatchPanel, VoiceLeadingMazePanel, etc.) accept params (key, chords, lickId, etc.).
- **Pitch / rhythm**: useITMPitchStore, useHighPerformancePitch, frequencyToNote, onset/timing as in Phase 17.

## Next Steps

1. Detail requirements with REQ-IDs (REQUIREMENTS.md).
2. Plan implementation waves (ROADMAP.md).
3. Initialize STATE.md and align with main ITM ROADMAP (e.g. new phase or milestone ref).
