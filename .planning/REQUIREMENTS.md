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

## v2: Future Considerations (Deferred)
- **REQ-AI-05**: Persistent User Weakness Map (Track which scales the user fails at).
- **REQ-AI-06**: Audio-to-AI (Analyze user's incoming MIDI in real-time for mistakes).

## Out of Scope
- Real-time video/audio analysis.
- Generic non-music conversations.
