# Adaptive Ear Training with MIDI-Supported AI – Project Vision

## Vision Statement

Upgrade **all ear training exercises** to a **MIDI-supported, AI-adaptive teaching machine** that learns what the student is doing wrong, proposes areas to focus on, increases difficulty when the student is ready, and repeats similar challenges when the student makes many mistakes.

## Problem Statement

- Most ear training levels (Intervals, ChordQualities, MelodySteps, etc.) rely on **click-to-select** answers; only MelodyStepsLevel and ChordLab’s EarTrainingModule support MIDI input today.
- Phase 7 added **diagnostic hints** (diagnoseEarError, getEarHint) and Listen Again UI, but there is no **error profiling** or **adaptive difficulty**.
- REQ-EAR-05 (Error profiling) and REQ-AI-06 (Audio-to-AI / MIDI analysis) were deferred to v2.
- Students plateau because exercises are fixed: no feedback loop that *adjusts* the curriculum based on performance.

## Core Value Proposition

**“The ear trainer learns you.”**

1. **MIDI everywhere**: All ear training exercises accept MIDI input (keyboard/piano) in addition to (or instead of) click selection—so students can *play* their answer.
2. **AI learns mistakes**: Capture and aggregate what the student gets wrong (intervals, qualities, common confusions). Pass this to Nano for diagnostic summaries and area suggestions.
3. **Adaptive difficulty**: When the student is ready (streak, success rate above threshold), offer harder questions. When they make many mistakes, repeat similar challenges before moving on.
4. **Propose focus areas**: AI can say, e.g. “Focus on Perfect 4th vs Tritone—that’s your weak spot” and the app can auto-filter or prioritize those intervals.

## Target Audience

- **Jazz / music students** who own a keyboard and prefer playing answers by ear instead of clicking.
- **Self-learners** who need the app to adapt to their pace instead of a fixed curriculum.

## Core Functionality (The ONE Thing)

**Every ear training level accepts MIDI input and the system tracks performance patterns to drive adaptive difficulty (harder when ready, repeat when struggling) and AI-proposed focus areas.**

Students must be able to:

- Play answers on a MIDI keyboard in Intervals, ChordQualities, MelodySteps, and other applicable levels.
- See the system *learn* their weak spots (e.g. overshooting by a semitone, confusing P4/tritone) and get AI suggestions.
- Experience questions that get harder after success streaks and repeat similar items when they make many mistakes.

## High-Level Requirements

- **MIDI input across FET levels**: Integrate `useMidi` (or equivalent) into IntervalsLevel, ChordQualitiesLevel, BassLevel, HarmonicContextLevel, and other levels where playing an answer makes sense (not all; e.g. JazzStandards may stay click-only).
- **Performance heatmap/store**: Extend or create a store (e.g. `useEarPerformanceStore`) that records per-interval, per-quality, per-level success/failure and error types (overshot, undershot, common confusions from earDiagnosis).
- **Adaptive curriculum logic**: When success rate > X and streak > Y → increase difficulty or scope. When mistake count > Z → repeat similar items. Use performance store for decisions.
- **AI focus-area suggestions**: Pass aggregate error profile to Nano; Nano returns 1–2 sentence suggestion (e.g. “Focus on P4 vs Tritone”). Display in a small “Focus area” panel or toast.
- **Reuse earDiagnosis + getEarHint**: Build on Phase 7 (earDiagnosis.ts, earHintService.ts) for per-attempt diagnosis; add aggregate layer for profiling.

## Technical Constraints

- Reuse `MidiContext` / `useMidi`; no new MIDI stack.
- Reuse `earDiagnosis.ts` and `earHintService.ts` for per-attempt hints.
- Use Zustand or similar for performance store; persist optionally (localStorage) for session continuity.
- Nano calls follow askNano pattern (stateless, context injected); no cloud LLM.

## Out of Scope (v1)

- Real-time audio (mic) analysis for ear training—focus on MIDI first; mic remains in Harmonic Mirror.
- Multi-user sync or cloud-backed progress.
- Full ML model training; use rule-based adaptive logic + Nano for suggestions.

## Success Metrics

- IntervalsLevel and ChordQualitiesLevel accept MIDI input and grade played notes correctly.
- After 5+ wrong answers in a session, the app repeats similar intervals/qualities before introducing new ones.
- After 3+ correct streak, the app offers harder variants (e.g. wider interval set, rarer qualities).
- AI can summarize “Focus on P4 vs Tritone” (or equivalent) when the student consistently confuses those intervals.

## Key Decisions

| Decision | Rationale |
|----------|------------|
| MIDI first, mic later | MIDI is precise; mic adds latency and noise. Ear training benefits from clean input. |
| Rule-based adaptive logic | Avoid ML complexity; simple thresholds (streak, success rate, mistake count) suffice for v1. |
| Reuse earDiagnosis for profiling | diagnoseEarError already returns errorType, distance, isCommonConfusion; aggregate these for AI and curriculum. |
| Nano for focus-area summary | Nano narrates the aggregate profile; Tonal.js and performance store provide the truth. |

## Integration Points

- **FunctionalEarTraining**: IntervalsLevel, ChordQualitiesLevel, MelodyStepsLevel (already MIDI), BassLevel, others.
- **MidiContext**: `useMidi` for lastNote and activeNotes.
- **Phase 7**: earDiagnosis.ts, earHintService.ts, nanoHelpers.askNano.
- **New**: useEarPerformanceStore (or extend useFunctionalEarTrainingStore), adaptive curriculum logic, AI focus-area service.

## Next Steps

1. Define detailed requirements (REQUIREMENTS.md).
2. Plan implementation phases (ROADMAP.md).
3. Implement Phase 1: MIDI input in IntervalsLevel and ChordQualitiesLevel; basic performance logging.
