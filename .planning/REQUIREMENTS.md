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

## v2: Future Considerations (Deferred)
- **REQ-AI-05**: Persistent User Weakness Map (Track which scales the user fails at).
- **REQ-AI-06**: Audio-to-AI (Analyze user's incoming MIDI in real-time for mistakes).

## Out of Scope
- Real-time video/audio analysis.
- Generic non-music conversations.
