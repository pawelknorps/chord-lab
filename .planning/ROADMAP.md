# Roadmap: Semantic AI Mentor

## Phase 1: The Semantic Engine (Context Layer) ✅
*Goal: Provide the AI with rich, annotated music theory data.*
- [x] **Step 1**: Create `AiContextService.ts` to aggregate theory facts (RN, Guide Tones).
- [x] **Step 2**: Implement "Annotated Markdown" formatter for prompt efficiency.
- [x] **Step 3**: Add "Theory Calibration" (Chord Tones + Scale Tones) to the engine to stop hallucinations.
- **Success Criteria**: AI correctly identifies the "Pivot Point" in *Giant Steps* consistently.

## Phase 2: Proactive Triggers (The Sensei Layer) ✅
*Goal: AI takes the initiative to help the student.*
- [x] **Step 4**: Implement "Stay-on-Hotspot" timer to trigger proactive advice.
- [x] **Step 5**: Create "Pivot Detector" in the Lead Sheet to fire AI alerts when harmonic gravity changes.
- [x] **Step 6**: Add "AI Assistant" toast notifications for low-friction proactive tips.
- **Success Criteria**: AI automatically offers a tip when the bridge of a song is reached.

## Phase 3: The Interactive Sidebar (Refinement Layer) ✅
*Goal: Allow the user to drill down and refine AI advice.*
- [x] **Step 7**: Build the `AiChatPanel` (SmartLessonPane) for reactive conversations.
- [x] **Step 8**: Implement "Measure Select" context injection (Alt+Click on LeadSheet).
- [x] **Step 9**: Expand UI commands to include visual overlays.
- **Success Criteria**: User can ask about specific measures and get context-aware answers.

## Phase 4: Polish & Theory Calibration & Nano Hardening ✅
- [x] **Step 10**: Optimize token usage to avoid Nano context overflow (4+4 slice, comment).
- [x] **Step 11**: Add "Theory Validation" prompts to ensure 100% accuracy in interval naming (system prompt rule).
- [x] **Step 12**: Integrated physical Chord/Scale tone verification in prompts.
- [x] **Step 12b**: **Stateless + Atomic prompts**: State slice (current 4 + next 4 bars), theory grounding (Tonal.js), atomic CONTEXT/TASK/CONSTRAINTS/RESPONSE template; few-shot examples in system prompt; CoT for complex progressions.
- [x] **Step 12c**: **Guardrails**: Use `temperature: 0.2`, `topK: 3` for theory; periodic `session.destroy()` and fresh sessions (LocalAgentService reset after N requests).
- [x] **Step 12d**: **Validator**: Tonal.js validates AI-suggested notes; do not display suggestions outside current scale/chord (noteValidator.ts; Practice Studio, Chord Lab, JazzKiller SmartLessonPane).
- **Success Criteria**: AI response time < 2s for complex lookups; theory answers stay on-topic; suggested notes pass Tonal.js validation.

## Phase 5: AI Drill Actions (Practice Studio)
*Goal: When "Get AI lesson" returns `[[DRILL:SPOTLIGHT]]` (or other commands), parse, execute, and strip so the app does what the AI says. See `.planning/milestones/ai-drill-actions/`.*
- [ ] **Step 13**: In PracticeExercisePanel, after receiving AI lesson text, parse `[[DRILL|SET|UI]:ACTION[:PARAM]]` and strip from display.
- [ ] **Step 14**: Execute `[[DRILL:SPOTLIGHT]]` (focus + loop + play) and `[[SET:BPM:X]]` (and KEY/TRANSPOSE where wired).
- [ ] **Step 15**: Shared parser/grammar for SmartLessonPane and Practice Studio (optional but recommended).
- **Success Criteria**: Lesson ending with `[[DRILL:SPOTLIGHT]]` starts the loop and hides the token; `[[SET:BPM:120]]` sets BPM.

## Phase 6: Chord Lab Progression Chatbot ✅
*Goal: Local AI in Chord Lab as a chatbot that answers questions about progressions, suggests continuations/alternatives, and explains.*
- [x] **Step 16**: Build "progression bundle" from Chord Lab state (chords, key, scale, Roman numerals) for prompt context.
- [x] **Step 17**: Add Chord Lab–specific system prompt and optional `ChordLabContextService` (or extend AiContextService) for progression-only context.
- [x] **Step 18**: Chatbot UI in Chord Lab (sidebar or collapsible panel): input + message history, wired to LocalAgentService with progression context.
- [x] **Step 19**: Support Q&A ("Why does this work?", "Scale over G7?"), continuations ("What could follow?"), and alternatives ("Substitute for the G7").
- [ ] **Step 19b (Theory Agent)**: When user asks "why does this work?" for a chord, send Nano a **triplet** (Prev → Current → Next) with Tonal.js ground truth; prompt for voice-leading explanation (e.g. 7th of G7 → 3rd of Cmaj7). Nano provides flavor; Tonal.js provides the truth.
- **Success Criteria**: User can ask about the current progression and get coherent answers and suggestions; no raw `[[...]]` in Chord Lab chat (or define a minimal command set later).

## Phase 7: Ear Trainer Feedback Loop & Rhythm Scat (Nano as Metadata Generator) ✅
*Goal: Ear Trainer explains why mistakes happened (diagnostic hints); Rhythm Trainer gets scat phrases for subdivisions. Nano narrates Tonal.js ground truth.*
- [x] **Step 20**: **Ear diagnostic**: Implement `diagnoseEarError(correctInterval, userGuess)` using semitones (earDiagnosis.ts)—return correct, guess, errorType (overshot/undershot), distance, isCommonConfusion (e.g. 4P vs tritone).
- [x] **Step 21**: **Ear hint**: Implement `getEarHint(diagnosis)`—pass diagnosis to Nano via askNano; system prompt "Never give the answer. 1-sentence hint on vibe/character of the correct interval." Return hint for display.
- [x] **Step 22**: **Listen Again UI**: In Ear Trainer (IntervalsLevel): on wrong answer → show "Not quite" + AI hint (bubble) → "Listen again" (replay) → retry → on success update heatmap; "Skip" loads next challenge.
- [x] **Step 23**: **Rhythm Scat**: getScatForSubdivision + display above metronome in SubdivisionPyramid; fallback to Konnakol when Nano off.
- [x] **Step 24**: **askNano guardrail**: nanoHelpers.askNano used by getEarHint and getScatForSubdivision; context re-injected; one-shot session.
- **Success Criteria**: Ear Trainer wrong answers show AI hint (no answer); student can retry after hint. Rhythm Trainer shows scat phrase above metronome for selected subdivision. No Nano call assumes prior context.

## Phase 8: Universal Microphone Handler (App-Wide) & Harmonic Mirror ✅
*Goal: Single app-wide mic pipeline; prioritize Harmonic Mirror (pitch/note accuracy, "teacher that listens") over rhythm grading. Clapping/beat secondary.*
- [x] **Step 25**: **Central mic service**: Implement app-wide microphone service (e.g. `MicrophoneService` or Zustand slice + `useMicrophone`) that owns `getUserMedia`, stream lifecycle, and "is active" state; expose start/stop and permission handling.
- [x] **Step 26**: **Playing analysis (Pitch-to-Theory Pipe)**: Integrate pitch detection (YIN/MPM e.g. Pitchy or crepe) and Tonal.js validation; expose pitch/MIDI and clarity; Audio Worklet or AnalyserNode for raw PCM.
- [x] **Step 27**: **useAuralMirror hook**: Expose hook that returns "Live Note" with clarity threshold (> 90%) and optional ~100 ms debounce; noise gate (~-40 dB); always show "Live Note" indicator in UI.
- [x] **Step 28**: **Guide Tone Spotlight**: Mode where app plays drums/bass; target = 3rd of current chord (Tonal.Chord.get(currentChord).notes[1]); when student hits 3rd, bar on chart lights up green; wire in JazzKiller/Practice Studio.
- [x] **Step 29**: **Call and Response**: App plays short motif (Tone.js); app listens; student plays back; mic verifies pitches; Nano tip on miss ("You missed the b7 on G7...").
- [x] **Step 30**: **Modes and subscription**: Support "pitch" (Harmonic Mirror) and optional "rhythm" (clapping) modes; consumers subscribe to pitch events and/or beat/tempo.
- [ ] **Step 31**: **Clapping analysis** (secondary): Beat/onset and tempo from mic for modules that need it (e.g. Rhythm Architect).
- [x] **Step 32**: **Migration and integration**: Migrate BiTonal Sandbox to shared mic service; at least one other module uses handler (Guide Tone or Call & Response).
- **Success Criteria**: One mic permission and one stream; Harmonic Mirror in use (Guide Tone or Call & Response); Live Note indicator and noise gate; "Ignore Rhythm" UX; playing yields pitch/notes validated by Tonal.js; optional clapping yields beat/tempo.

## Phase 4b: Full Responsive Audit (Workbench, Standards, All Exercises)
*Goal: Ensure Workbench, Jazz Standards, and every exercise module render well on all screen sizes including mobile. Extends Phase 4 layout work.*
- [ ] **Step 10b**: Audit **Workbench** (Dashboard + ChordLab): verify layout, controls, Piano/Fretboard, Progression Builder at 375px and 320px.
- [ ] **Step 10c**: Audit **Standards** (JazzKiller): song list, lead sheet, practice studio, drill panels, Smart Lesson at 375px and 320px.
- [ ] **Step 10d**: Audit remaining exercises: ChordBuildr, BiTonalSandbox, GripSequencer, Tonnetz, NegativeMirror, BarryHarris, RhythmArchitect, FunctionalEarTraining, CircleChords, MidiLibrary, ProgressionsPage; fix horizontal scroll and overflow.
- **Success Criteria**: No horizontal scroll at 375px and 320px; Workbench and Standards are fully usable on mobile; all modules pass REQ-RESP-01–05.

## Phase 9: Adaptive Ear Training with MIDI-Supported AI
*Goal: All applicable ear training exercises accept MIDI; AI learns mistakes and drives adaptive difficulty (harder when ready, repeat when struggling). See `.planning/milestones/adaptive-ear-midi-ai/`.*
- [ ] **Step 33**: **MIDI input**: Add useMidi to IntervalsLevel and ChordQualitiesLevel; grade played notes as answer (reuse MelodyStepsLevel pattern).
- [ ] **Step 34**: **Performance store**: Create useEarPerformanceStore; record per-level, per-interval/quality success/failure and diagnosis (errorType, distance, isCommonConfusion).
- [ ] **Step 35**: **Repeat on struggle**: When N+ mistakes on same type, repeat similar items before new ones.
- [ ] **Step 36**: **Harder when ready**: When streak ≥ M and success rate > threshold, offer harder variants.
- [ ] **Step 37**: **AI focus-area suggestion**: getFocusAreaSuggestion(profile) via askNano; display in panel/toast.
- [ ] **Step 38**: **Extend levels** (optional): BassLevel, HarmonicContextLevel MIDI where applicable.
- **Success Criteria**: Intervals and ChordQualities accept MIDI; curriculum adapts (repeat when struggling, harder when ready); AI suggests focus areas from error profile.
