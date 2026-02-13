# Phase 6 – AI Teacher (06-ai-teacher): Verification

**Phase goal**: AOT lesson pipeline, Lesson Player (SmartLessonPane), Interactive Drills (Spotlight, Blindfold), Local Agent (window.ai) with high-quality jazz pedagogy.

## Success criteria (from PLAN)

- [x] **Step 15**: AOT script exists (`scripts/generate-lessons.js`); writes template lessons; AI via "Ask Local Agent" (Gemini Nano).
- [x] **Step 16**: SmartLessonPane in ChordLab and JazzKiller; fetch `/lessons/{id}.json`; Harmonic Roadmap, Common Traps, Golden Lick.
- [x] **Step 17**: Spotlight Drill (loop last 4 chords), Blindfold Challenge (hide Piano/Fretboard) in Chord Lab.
- [x] **Step 18**: AiAssistantBanner, LocalAgentService, Teacher Logic (buildPracticeContext, generateLessonFromPracticeContext); "Get AI lesson" in Practice Studio; Chord Lab "Ask Local Agent" uses `generateJazzLesson` with progression context.

## Verification checklist

- Chord Lab: Open Smart Lesson, add progression, click "Ask Local Agent" → lesson uses jazz teacher prompt and progression context when Gemini Nano is available.
- JazzKiller: Practice Studio "Get AI lesson" and SmartLessonPane use same Teacher Logic.
- Spotlight Drill and Blindfold work in Chord Lab Smart Lesson.

**Status**: Phase complete; no open tasks. Roadmap Phase 6 (Chord Lab Progression Chatbot) is tracked separately in `06-chordlab-chatbot`.

**Execution**: `/gsd-execute-phase 6` — verification pass completed; all deliverables present (`scripts/generate-lessons.js`, SmartLessonPane in ChordLab + JazzKiller, LocalAgentService, jazzTeacherLogic.generateJazzLesson`).
