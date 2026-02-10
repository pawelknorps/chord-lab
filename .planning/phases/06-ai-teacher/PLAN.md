# Plan: Phase 6 – The Incredible Teaching Machine (AI Agent)

**Roadmap**: Phase 6 (Steps 15–18)  
**Goal**: AOT lesson pipeline, Lesson Player (SmartLessonPane), Interactive Drills (Spotlight, Blindfold), Local Agent (window.ai) with high-quality jazz pedagogy.

## Phase Scope (from ROADMAP.md)

- **Step 15**: AOT Script — `scripts/generate-lessons.js` to process standards and generate lesson JSONs.
- **Step 16**: Lesson Player — SmartLessonPane to visualize harmonic roadmap.
- **Step 17**: Interactive Drills — Spotlight Drill, Blindfold Challenge.
- **Step 18**: Local Agent — window.ai integration for real-time advice.

## Current Status (pre–Phase 6 progress)

| Step | Status | Notes |
|------|--------|--------|
| 15 | Done | AOT script: reads JazzKiller standards, writes template lessons to `public/lessons/{slug}.json`. AI analysis is Gemini Nano in-browser only ("Ask Local Agent"). See AOT.md. |
| 16 | Done | SmartLessonPane in ChordLab and JazzKiller; fetch `/lessons/{id}.json`; Harmonic Roadmap, Common Traps, Golden Lick. |
| 17 | Done | ChordLab SmartLessonPane: Spotlight Drill (loop last 4 chords), Blindfold (hide Piano/Fretboard). |
| 18 | Done | AiAssistantBanner, LocalAgentService, window.ai in SmartLessonPane; Teacher Logic (buildPracticeContext, generateLessonFromPracticeContext) in JazzKiller; "Get AI lesson" in Practice Studio. |

## Progress (AI Teacher phase)

- **Unify AI teacher quality**: Chord Lab SmartLessonPane "Ask Local Agent" now uses shared Teacher Logic (`generateJazzLesson`) when progression + key are provided, so Chord Lab gets the same 3-bullet jazz pedagogy as JazzKiller.
- **AOT (Step 15)**: Script implemented — standards from JazzKiller JSON, writes template lessons only. AI is Gemini Nano in Chrome via "Ask Local Agent"; no cloud API keys. Run: `npm run generate:lessons` (or `--limit N`); dry-run: `npm run generate:lessons:dry`.

## Verification

- Chord Lab: Open Smart Lesson, fill progression, click "Ask Local Agent" → lesson uses jazz teacher prompt and progression context when available.
- JazzKiller: Practice Studio "Get AI lesson" and SmartLessonPane (when extended) use same Teacher Logic.
- Spotlight Drill and Blindfold work in Chord Lab.
