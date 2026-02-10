# Requirements: Semantic AI Mentor

## v1: Semantic Context & Proactive Advice

### AI-01: Theory Annotation Service
- **REQ-AI-01-01**: Service must extract functional analysis (II-V-I, V/V, etc.) from `iRealReader` and `Theory` core.
- **REQ-AI-01-02**: Format data into a "Semantic Block" for the prompt (e.g., `Measure 1: Cmaj7 | I | Release`).
- **REQ-AI-01-03**: Include "Active Focus" metadata (current drill type and range).

### NANO: Gemini Nano Stateless Logic & Prompt Hardening
- **REQ-NANO-01**: **State slice**: Every Nano call receives a fresh state slice (e.g. current 4 bars + next 4 bars from Zustand); no reliance on conversation history for correctness.
- **REQ-NANO-02**: **Theory grounding**: Use Tonal.js to compute intervals, key centers, and scale degrees before prompting; inject this "ground truth" into the prompt (e.g. as CONTEXT block).
- **REQ-NANO-03**: **Atomic prompt**: Use a structured template (CONTEXT / TASK / CONSTRAINTS / RESPONSE) so the model follows a fixed chain and stays on-topic.
- **REQ-NANO-04**: **Few-shot**: Include 2–3 "perfect response" examples in system prompt or start of message for jazz-tutor answers (e.g. chord-in-context → short teacher reply).
- **REQ-NANO-05**: **Chain-of-Thought**: For complex progressions, instruct step-by-step (e.g. "First Roman numeral, then target note, then lick"); CoT improves accuracy.
- **REQ-NANO-06**: **Guardrails**: Use `temperature: 0.2` and `topK: 3` for theory calls; call `session.destroy()` periodically and create fresh sessions to avoid context drift.
- **REQ-NANO-07**: **Validator**: If Nano suggests a note (e.g. "Play C#"), validate against Tonal.js scale/chord; do not display suggestions that are not in the current scale/chord.

### AI-02: Proactive Triggers
- **REQ-AI-02-01**: AI should detect "Pivot Points" (Key changes, Modal Interchanges) and trigger a notification.
- **REQ-AI-02-02**: Trigger lesson when the user stays on a "Hotspot" (hard measure) for more than 30 seconds.

### AI-03: Reactive Chat Sidebar
- **REQ-AI-03-01**: Implement a persistent sidebar for follow-up questions.
- **REQ-AI-03-02**: Support "Precision Context" (user selects a bar range, AI analyzes only that).

### AI-04: UI Logic Expansion
- **REQ-AI-04-01**: Support commands: `[[SHOW:SCALE:Dorian]]`, `[[SHOW:AVOID:F]]`, `[[PLAY:LICK]]`.
- **REQ-AI-04-02**: Voice leading visualization triggered by AI explanation.

### CMD: AI Drill Actions (Practice Studio)
*Detailed requirements: `.planning/milestones/ai-drill-actions/REQUIREMENTS.md` (CMD-01–CMD-06).*
- **REQ-CMD-01**: In Practice Studio "Get AI lesson", parse all `[[DRILL|SET|UI]:ACTION[:PARAM]]` tokens and strip them from displayed text.
- **REQ-CMD-02**: Execute `[[DRILL:SPOTLIGHT]]`: focus pattern, enable loop, start playback.
- **REQ-CMD-03**: Execute `[[SET:BPM:X]]` and (where wired) `[[SET:KEY:X]]` / `[[SET:TRANSPOSE:X]]`.
- **REQ-CMD-04**: Single shared grammar/parser for SmartLessonPane and PracticeExercisePanel where applicable.

### CL-AI: Chord Lab Progression Chatbot
- **REQ-CL-AI-01**: **Progression context**: Build a compact "progression bundle" (chord symbols, key, scale, optional Roman numerals) from current Chord Lab state for the AI prompt.
- **REQ-CL-AI-02**: **Chatbot UI**: Provide a conversational panel in Chord Lab (sidebar or inline) where the user can type questions and receive answers from the local model.
- **REQ-CL-AI-03**: **Q&A and explanations**: AI answers questions about the current progression (e.g. "Why does this work?", "What scale over this chord?", "Explain the ii–V here").
- **REQ-CL-AI-04**: **Continuations and alternatives**: AI suggests next chords or alternative progressions (e.g. "What could follow?", "Give me a ii–V in Ab", "Substitute for the G7").
- **REQ-CL-AI-05**: Use existing LocalAgentService (Gemini Nano); reuse theory core (RomanNumeralAnalyzer, ChordScaleEngine, etc.) for context. No cloud LLM in v1.
- **REQ-CL-AI-06**: **Make it work**: Chord Lab AI assistant is discoverable and works end-to-end—user can open Smart Lesson, use Progression Assistant chat, ask about the progression, and get coherent answers; loading and error states are clear; Gemini Nano availability (or fallback) is communicated (e.g. banner).

### THEORY-AGENT: Progression Builder (Voice Leading Triplet)
- **REQ-TA-01**: **Triplet context**: When explaining a chord in context, send Nano a triplet (Previous → Current → Next) with ground truth from Tonal.js (e.g. 7th of G7 → 3rd of Cmaj7).
- **REQ-TA-02**: **Voice-leading prompt**: Use prompt pattern: "Given the sequence Dm7→G7→Cmaj7 in C Major, explain the movement of the 7th of G7 (F) to the 3rd of Cmaj7 (E)." Nano returns flavor text only; Tonal.js provides the notes.

### EAR-AI: Ear Trainer Contextual Feedback & Feedback Loop
- **REQ-EAR-01**: **Diagnose error**: When the student misidentifies an interval/chord, compute "Aural Distance" (correct vs guess: semitones, overshot/undershot, common confusions e.g. 4P vs tritone). Implement `diagnoseEarError(correctInterval, userGuess)` using Tonal.js Interval.semitones.
- **REQ-EAR-02**: **Hint generator**: Pass diagnosis to Nano via `getEarHint(diagnosis)`; Nano returns a **1-sentence hint** on the "vibe" or "character" of the correct interval; **never** give the answer. System prompt: "You are a jazz ear-training coach. Never give the answer. Provide a 1-sentence hint focused on the 'vibe' or 'character' of the interval."
- **REQ-EAR-03**: **Listen Again UI**: Flow: Play → Guess → "Not quite" + AI Hint (toast/bubble) → Retry (replay) → Success → Update performance heatmap.
- **REQ-EAR-04**: **Aural mnemonics**: Nano may suggest mnemonics (e.g. "The Simpsons theme" for Tritone) based on the specific mistake.
- **REQ-EAR-05**: **Error profiling** (v2): If the student consistently overshoots/undershoots, AI can summarize: e.g. "I noticed you're hearing everything a bit sharp today. Let's focus on the 'gravity' of the Perfect 4th."

### RHYTHM-AI: Rhythm Scat Generator
- **REQ-RHY-01**: **Scat for subdivision**: For a selected rhythm (e.g. "Swing"), ask Nano for a 3-word vocalization or "scat" phrase that matches the subdivision (e.g. "Doo-dah, doo-dah").
- **REQ-RHY-02**: **Display above metronome**: Show the scat phrase above the metronome so students internalize the "pocket" through language.
- **REQ-RHY-03**: **Complex rhythm → scat**: For complex syncopated rhythms, use Nano to generate a vocalized scat phrase ("Doo-be-dah") to help internalize time.

### NANO-GUARD: Zero-Shot Context Wrapper
- **REQ-NANO-08**: **askNano wrapper**: All Nano calls must re-inject ground truth. Implement or use a wrapper: `askNano(context, question)` with systemPrompt "You are a concise Jazz Coach. Limit answers to 15 words." Context must be JSON.stringify(context) from Tonal.js/state; never assume the model remembers the previous chord.

### MIC: Universal Microphone Handler (App-Wide)
- **REQ-MIC-01**: **Single app-wide mic service**: One central service (e.g. `MicrophoneService` or store + hook) that owns `getUserMedia`, stream lifecycle, and analysis; all modules consume this service rather than opening their own mic.
- **REQ-MIC-02**: **Permission and lifecycle**: Request mic permission once per session; expose start/stop and "is active" state; release stream when no consumer needs it (or on explicit user stop).
- **REQ-MIC-03**: **Playing analysis**: From mic input, support pitch/note onset detection (e.g. MIDI note or frequency + confidence) so modules can compare "what the student played" to a target (e.g. Ear Trainer, Chord Lab play-back). Reuse or generalize existing pitch path (e.g. BiTonal Sandbox / ml5) into the central service.
- **REQ-MIC-04**: **Clapping analysis**: From mic input, support beat/onset detection and tempo estimation (e.g. BPM, subdivision) so modules can use "clapped tempo" or rhythm (e.g. Rhythm Architect, metronome alignment).
- **REQ-MIC-05**: **Modes**: Service supports at least two logical modes (or combined): "pitch" (playing) and "rhythm" (clapping); consumers subscribe to the outputs they need (pitch events, beat events, tempo).
- **REQ-MIC-06**: **Integration**: At least one module beyond BiTonal Sandbox uses the universal handler (e.g. Rhythm Architect for clap-tempo, or Ear Trainer for sing-back). BiTonal Sandbox to migrate to the shared service where feasible.

## v2: Future Considerations (Deferred)
- **REQ-AI-05**: Persistent User Weakness Map (Track which scales the user fails at).
- **REQ-AI-06**: Audio-to-AI (Analyze user's incoming MIDI in real-time for mistakes).

## Out of Scope
- Real-time video/audio analysis (beyond mic for playing/clapping).
- Generic non-music conversations.
- **MIC v1**: Full chord recognition from mic, multi-instrument classification, recording/playback of mic audio, offline processing.
