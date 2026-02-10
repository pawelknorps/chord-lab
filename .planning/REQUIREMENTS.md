# Requirements: Semantic AI Mentor

## v1: Semantic Context & Proactive Advice

### AI-01: Theory Annotation Service
- **REQ-AI-01-01**: Service must extract functional analysis (II-V-I, V/V, etc.) from `iRealReader` and `Theory` core.
- **REQ-AI-01-02**: Format data into a "Semantic Block" for the prompt (e.g., `Measure 1: Cmaj7 | I | Release`).
- **REQ-AI-01-03**: Include "Active Focus" metadata (current drill type and range).

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

## v2: Future Considerations (Deferred)
- **REQ-AI-05**: Persistent User Weakness Map (Track which scales the user fails at).
- **REQ-AI-06**: Audio-to-AI (Analyze user's incoming MIDI in real-time for mistakes).

## Out of Scope
- Real-time video/audio analysis.
- Generic non-music conversations.
