# Project State: Semantic AI Mentor

## Current Milestone: v1 – Semantic Context, Proactive Advice, Drill Actions & Chord Lab Chatbot
**Status**: In Progress
**Progress**: ~75%

## New Initiative: Universal Microphone Handler & Harmonic Mirror
**Status**: Complete (Phase 8) ✅
**Goal**: App-wide mic handler; **Harmonic Mirror** first (pitch/note accuracy, "teacher that listens")—Guide Tone Spotlight, Call and Response, useAuralMirror, noise gate, Live Note indicator; rhythm grading deferred. See PROJECT.md § Universal Microphone Handler & Harmonic Mirror, REQUIREMENTS REQ-MIC-01–15, ROADMAP Phase 8.

## New Initiative: Adaptive Ear Training with MIDI-Supported AI
**Status**: Complete (Phase 9) ✅
**Goal**: Improve all ear training exercises with MIDI-supported AI—learn what the student is doing wrong, propose focus areas, give harder questions when ready, repeat similar when struggling. See PROJECT.md § Adaptive Ear Training with MIDI-Supported AI, REQUIREMENTS REQ-ADAPT-EAR-01–05, milestone `.planning/milestones/adaptive-ear-midi-ai/`.

## Phase Progress
- **Phase 1: Semantic Engine**: 100% (AiContextService, Markdown translation, Theory Bundles)
- **Phase 2: Proactive Triggers**: 90% (Pivot detection, Struggle timer, Proactive Hook)
- **Phase 3: Interactive Sidebar**: 70% (Reactive Chat, Range Focus selection)
- **Phase 4: Polish & Theory Calibration & Nano Hardening**: 100% (guardrails temp/topK, atomic prompt, few-shot, CoT, state slice 4+4, noteValidator, session reset)
- **Phase 5: AI Drill Actions (Practice Studio)**: 0% (parse/execute/strip `[[DRILL:SPOTLIGHT]]` etc. in "Get AI lesson") — *skipped for now*
- **Phase 6: Chord Lab Progression Chatbot**: 100% (progression bundle, chatbot UI, Q&A and continuations); Step 19b (Theory Agent triplet) and Phase 7 planned
- **Phase 7: Ear Trainer Feedback Loop & Rhythm Scat**: 100% (earDiagnosis, earHintService, nanoHelpers, IntervalsLevel Listen Again UI, rhythmScatService, SubdivisionPyramid scat display) ✅
- **Phase 8: Universal Microphone Handler & Harmonic Mirror**: 100% (MicrophoneService, useMicrophone, pitchDetection, useAuralMirror, LiveNoteIndicator, Guide Tone Spotlight, CallAndResponseDrill, BiTonal migration; clapping Step 31 deferred) ✅
- **Phase 9: Adaptive Ear Training with MIDI-Supported AI**: 100% (IntervalsLevel + ChordQualitiesLevel MIDI, useEarPerformanceStore, adaptiveCurriculum, earFocusService, FocusAreaPanel; Step 38 deferred) ✅

## Recently Completed / Updated
- [x] **Phase 4b – Full Responsive Audit**: Shell constraints (Dashboard main min-w-0, ChordLab root containment); Workbench ChordLabDashboard min-w-0 max-w-full; Standards JazzKiller min-w-0, LeadSheet overflow-auto; all exercises (ChordBuildr, BiTonalSandbox, Tonnetz, NegativeMirror, BarryHarris, GripSequencer, RhythmArchitect, FunctionalEarTraining, CircleChords, MidiLibrary, ProgressionsPage) given min-w-0 and containment. PositionsLevel fretboard overflow-x-auto; MidiLibrary min-w-[200px]. AUDIT.md completed. Commits: cf7d0f5, ed205a1, 9b6f99e, d9ab1fe.
- [x] **Phase 9 – Adaptive Ear Training with MIDI-Supported AI**: IntervalsLevel MIDI input (useMidi, debounce, PLAYED feedback); ChordQualitiesLevel MIDI for Novice Triads + Advanced Sevenths; useEarPerformanceStore (recordAttempt, getProfile); adaptiveCurriculum (shouldRepeatSimilar, shouldIncreaseDifficulty, getNextChallenge); earFocusService (getFocusAreaSuggestion); FocusAreaPanel in FET header. Step 38 (BassLevel/HarmonicContextLevel MIDI) deferred.
- [x] **Plan – Adaptive Ear Training with MIDI-Supported AI**: New milestone `.planning/milestones/adaptive-ear-midi-ai/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md). PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md updated with initiative: MIDI input in Intervals/ChordQualities; performance store and error profiling; adaptive curriculum (repeat on struggle, harder when ready); AI focus-area suggestions via Nano. Phase 9 (Steps 33–38) added to ROADMAP. REQ-ADAPT-EAR-01–05 added.
- [x] **Phase 8 – Universal Microphone Handler & Harmonic Mirror**: MicrophoneService, useMicrophone, pitchDetection (ml5 + RMS noise gate), useAuralMirror, LiveNoteIndicator; Guide Tone Spotlight (store, GuideToneSpotlightEffect, green bar in LeadSheet, Mic toggle in JazzKiller); CallAndResponseDrill (Practice Panel, Nano tip on miss); BiTonal Sandbox migration (SingingArchitect accepts stream prop); modes/subscription doc; Step 31 clapping deferred.
- [x] **Plan – Harmonic Mirror (Mic as "Teacher That Listens")**: PROJECT.md, REQUIREMENTS.md, ROADMAP.md updated: mic framed as Harmonic Mirror (frequency accuracy, not rhythm judge); Ignore Rhythm rule; Pitch-to-Theory Pipe (Worklet → YIN/MPM → Tonal.js); useAuralMirror hook; Guide Tone Spotlight (3rd of chord, bar lights green); Call and Response (lick playback + Nano tip on miss); Smart Implementation Table (Target Practice, Drone, Lick Validation, Energy Tracker); technical sanity (noise gate -40 dB, Live Note indicator, clarity > 90%, debounce); REQ-MIC-07–15; Phase 8 Steps 26–32 expanded.
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

## Responsive Layout (Phase 4b)
**Status**: Complete ✅  
**Goal**: Ensure Workbench, Standards (JazzKiller), and all exercises render well on every screen size including mobile. REQ-RESP-01–05. Phase 4b (Steps 10b–10d) executed; SUMMARY.md, VERIFICATION.md, AUDIT.md updated.

## Currently Working On
- **Focus**: Make the Chord Lab AI assistant work—verify end-to-end flow (open Smart Lesson → Progression Assistant chat → ask about progression → get answer); improve discoverability if needed; fix any bugs (e.g. chord format, LocalAgentService init); ensure clear UX (loading, errors, Nano banner).
- Phase 5 (AI Drill Actions) deferred; Phase 4, Phase 6, and Phase 7 complete. Step 19b (Theory Agent triplet) remains for Phase 6 refinement when prioritized.
- **Phase 9 (Adaptive Ear Training)**: Complete. IntervalsLevel and ChordQualitiesLevel accept MIDI; useEarPerformanceStore; adaptive curriculum (repeat on struggle, harder when ready); earFocusService + FocusAreaPanel.

## Blockers
- None.
