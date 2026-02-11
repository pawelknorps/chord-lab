# Project State: Semantic AI Mentor

## Current Milestone: v1 – Semantic Context, Proactive Advice, Drill Actions & Chord Lab Chatbot
**Status**: In Progress
**Progress**: ~75%

## New Initiative: Universal Microphone Handler
**Status**: Planned (Phase 8)
**Goal**: App-wide mic handler that analyses what the student is **playing** (pitch/notes) or **clapping** (beat/tempo); single stream, multiple consumers. See PROJECT.md § Universal Microphone Handler, REQUIREMENTS REQ-MIC-01–06, ROADMAP Phase 8.

## Phase Progress
- **Phase 1: Semantic Engine**: 100% (AiContextService, Markdown translation, Theory Bundles)
- **Phase 2: Proactive Triggers**: 90% (Pivot detection, Struggle timer, Proactive Hook)
- **Phase 3: Interactive Sidebar**: 70% (Reactive Chat, Range Focus selection)
- **Phase 4: Polish & Theory Calibration & Nano Hardening**: 100% (guardrails temp/topK, atomic prompt, few-shot, CoT, state slice 4+4, noteValidator, session reset)
- **Phase 5: AI Drill Actions (Practice Studio)**: 0% (parse/execute/strip `[[DRILL:SPOTLIGHT]]` etc. in "Get AI lesson") — *skipped for now*
- **Phase 6: Chord Lab Progression Chatbot**: 100% (progression bundle, chatbot UI, Q&A and continuations); Step 19b (Theory Agent triplet) and Phase 7 planned
- **Phase 7: Ear Trainer Feedback Loop & Rhythm Scat**: 100% (earDiagnosis, earHintService, nanoHelpers, IntervalsLevel Listen Again UI, rhythmScatService, SubdivisionPyramid scat display) ✅
- **Phase 8: Universal Microphone Handler**: 0% (central mic service, playing + clapping analysis, BiTonal migration, 1+ module integration) — *planned*

## Recently Completed / Updated
- [x] **Phase 7 – Ear Trainer Feedback Loop & Rhythm Scat**: earDiagnosis.ts (diagnoseEarError); nanoHelpers.ts (askNano); earHintService.ts (getEarHint); IntervalsLevel Listen Again UI (wrong → "Not quite" + AI hint, Listen again, Skip); rhythmScatService.ts (getScatForSubdivision); SubdivisionPyramid scat phrase above metronome. All Nano calls use askNano with context re-injection.
- [x] **New initiative – Universal Microphone Handler**: PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md updated with app-wide mic handler: single stream, playing (pitch/notes) and clapping (beat/tempo) analysis; REQ-MIC-01–06; Phase 8 (Steps 25–29); BiTonal Sandbox migration and at least one other module integration.
- [x] **Plan update – Nano as Contextual Metadata Generator**: PROJECT.md, REQUIREMENTS.md, ROADMAP.md updated with: (1) Nano as Metadata Generator (not chat); Tonal.js = truth, Nano = teacher; (2) Three-module strategy: Progression Builder (Theory Agent triplet), Ear Trainer (Contextual Feedback + Feedback Loop), Rhythm Trainer (Scat Generator); (3) Optimization table; (4) Ear Trainer Feedback Loop (diagnoseEarError, getEarHint, Listen Again UI, aural mnemonics, error profiling); (5) Rhythm Scat Generator; (6) Nano Guardrail (Zero-Shot Context wrapper askNano). Phase 7 added to ROADMAP (Steps 20–24); REQ-TA-01/02, REQ-EAR-01–05, REQ-RHY-01–03, REQ-NANO-08 added.
- [x] **Phase 4 – Polish & Nano Hardening**: Theory guardrails (temp 0.2, topK 3); atomic prompt (CONTEXT/TASK/CONSTRAINTS/RESPONSE) for focused pattern; few-shot + theory validation rule in system prompt; CoT for complex progressions; state slice 4+4 bars; `noteValidator.ts` + integration in Practice Studio, Chord Lab, JazzKiller SmartLessonPane; LocalAgentService session reset after N requests.
- [x] **Phase 6 – Chord Lab Progression Chatbot**: `progressionContext.ts` (bundle, prompt, strip); SmartLessonPane chat section (Progression Assistant) wired to LocalAgentService; scale prop passed from ChordLab.
- [x] **Project refinement**: PROJECT.md, REQUIREMENTS.md, ROADMAP.md updated with Gemini Nano Stateless Logic, Prompt Hardening, etc.
- [x] Implemented `AiContextService.ts` with Semantic Markdown output.
- [x] Updated `jazzTeacherLogic.ts` to consume high-density theory data.
- [x] Created `useAiTeacher.ts` hook for proactive prompts.
- [x] Integrated "Sensei Tip" notifications into JazzKillerModule.
- [x] Added Alt+Click range selection to `LeadSheet.tsx`.
- [x] Built the reactive chat interface in JazzKiller `SmartLessonPane.tsx`.
- [x] Defined Chord Lab AI chatbot and AI drill actions in PROJECT.md, REQUIREMENTS.md, ROADMAP.md.

## Currently Working On
- **Focus**: Make the Chord Lab AI assistant work—verify end-to-end flow (open Smart Lesson → Progression Assistant chat → ask about progression → get answer); improve discoverability if needed; fix any bugs (e.g. chord format, LocalAgentService init); ensure clear UX (loading, errors, Nano banner).
- Phase 5 (AI Drill Actions) deferred; Phase 4, Phase 6, and Phase 7 complete. Step 19b (Theory Agent triplet) remains for Phase 6 refinement when prioritized.

## Blockers
- None.
