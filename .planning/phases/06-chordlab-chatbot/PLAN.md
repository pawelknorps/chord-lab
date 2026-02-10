# Plan: Phase 6 – Chord Lab Progression Chatbot

**Roadmap**: Phase 6 (Steps 16–19)  
**Goal**: Local AI in Chord Lab as a chatbot that answers questions about progressions, suggests continuations/alternatives, and explains.

---

## Frontmatter

- **Waves**: 2 (Context + prompt layer → Chatbot UI + integration).
- **Dependencies**: None (theory core, LocalAgentService, Chord Lab state already exist).
- **Files likely to be modified**:
  - `src/core/services/AiContextService.ts` (optional: add progression-only helper) or new `src/core/services/ChordLabContextService.ts` / `progressionContext.ts`
  - `src/modules/ChordLab/components/SmartLessonPane.tsx` (chat UI, message history, wire to agent)
  - `src/core/services/LocalAgentService.ts` (optional: allow context override or Chord Lab prompt; v1 can avoid this by prepending context)
  - New: `src/modules/ChordLab/utils/progressionBundle.ts` or under `src/core/services/` (build progression markdown for prompt)

---

## Phase scope (from ROADMAP.md)

- **Step 16**: Build "progression bundle" from Chord Lab state (chords, key, scale, Roman numerals) for prompt context.
- **Step 17**: Add Chord Lab–specific system prompt and optional ChordLabContextService (or extend AiContextService) for progression-only context.
- **Step 18**: Chatbot UI in Chord Lab (sidebar or collapsible panel): input + message history, wired to LocalAgentService with progression context.
- **Step 19**: Support Q&A ("Why does this work?", "Scale over G7?"), continuations ("What could follow?"), and alternatives ("Substitute for the G7").

---

## Wave 1: Progression context and prompt layer

### Task 1.1: Progression bundle builder
- Add a small module that builds a compact markdown string for the current Chord Lab progression.
- **Input**: List of chord symbols (strings), key (string), scale (string, e.g. "Major").
- **Output**: Short markdown, e.g.:
  - Line 1: `Key: C, Scale: Major`
  - Line 2: `Chords: Cmaj7 | Dm7 | G7 | Cmaj7`
  - Line 3: `RN: I | ii | V | I` (using RomanNumeralAnalyzer per chord)
  - Optional: one line of concepts (e.g. "ii-V-I") via ConceptAnalyzer.analyze(chords, key).
- **Location**: Either `AiContextService.buildProgressionBundle(chordSymbols, key, scale)` or new file `src/core/services/progressionContext.ts` (or `ChordLabContextService.ts`) that reuses RomanNumeralAnalyzer and ConceptAnalyzer. No measure structure; flat list only.
- **Acceptance**: Given `['Cmaj7','Dm7','G7','Cmaj7']`, key `C`, scale `Major`, output contains key, chord list, and Roman numerals; token-length kept small (< ~200 tokens).

### Task 1.2: Chord Lab prompt construction
- Define how each chatbot request is built: progression bundle + user message. Optionally include last 1–2 Q&A pairs for multi-turn feel.
- **Format**: e.g. `Current progression:\n{bundle}\n\nUser: {message}`. If we support history: `Current progression:\n{bundle}\n\nPrevious:\nQ: ... A: ...\n\nUser: {message}`.
- **Chord Lab persona**: Either rely on existing LocalAgentService system prompt ("jazz mentor") or add a Chord Lab–specific path. **v1**: Prepend "You are helping with a chord progression in Chord Lab. Answer briefly. Current progression:\n{bundle}\n\nUser: {message}" so the model receives clear instructions in the message; no change to LocalAgentService system prompt required.
- **Acceptance**: A single function or inline construction that, given (bundle, userMessage, optional history), returns the string to pass to `localAgent.ask(...)`.

### Task 1.3: Strip any [[...]] from Chord Lab responses (v1)
- If the model returns `[[DRILL:...]]` or similar, strip before displaying. Use the same regex as JazzKiller (e.g. `\[\[\s*(DRILL|SET|UI)\s*:\s*[^\]]+\]\]`) and remove matches from the response text shown in the chat.
- **Acceptance**: No raw `[[...]]` tokens visible in Chord Lab chat bubbles.

---

## Wave 2: Chatbot UI and integration

### Task 2.1: Message state and UI in Chord Lab
- Add state for chat: `messages: Array<{ role: 'user' | 'assistant'; content: string }>`.
- Add UI: a **chat section** inside Chord Lab SmartLessonPane (or a collapsible "Progression Assistant" panel). Minimum: scrollable message list + text input + send button.
- **Placement**: Prefer extending SmartLessonPane with a "Chat" block below the existing lesson content (or a tab "Lesson" | "Chat"). If SmartLessonPane is too crowded, add a separate collapsible panel that opens from Chord Lab (e.g. "Ask about this progression" button).
- **Acceptance**: User can open the chat area, type a message, and see it appended to the list; after agent reply, assistant message is appended.

### Task 2.2: Wire chat to LocalAgentService with progression context
- On send: (1) Build progression bundle from current Chord Lab state (progression → chord symbols, selectedKey, selectedScale). (2) Build prompt (bundle + user message; optionally last 1–2 exchanges). (3) Call `localAgent.ask(prompt)`. (4) Strip `[[...]]` from response. (5) Append user message and assistant response to `messages`.
- **State source**: Progression and key/scale must be passed into the component that hosts the chat (e.g. SmartLessonPane already receives `progressionChords` and `key`; ensure we also have scale or derive it).
- **Empty progression**: If progression is empty, show a short message in the chat area (e.g. "Add some chords to get suggestions") and still allow general questions; bundle can be "Key: C, Scale: Major. Chords: (none)."
- **Acceptance**: User asks "What could follow?" and receives a short, coherent answer; current progression is reflected in the context (e.g. after changing chords, next question uses updated progression).

### Task 2.3: Copy and accessibility
- **Copy**: Button or hint "Ask about this progression, request continuations or substitutes, or get explanations."
- **Loading**: Show a loading state (e.g. "Thinking..." or spinner) while `localAgent.ask()` is in progress.
- **Errors**: If agent is unavailable or throws, append an assistant message with a friendly error (e.g. "Agent unavailable. Try again or add chords for context.").
- **Acceptance**: User sees clear affordance to chat; loading and errors are handled without breaking the UI.

---

## Verification

### Per-task
- **1.1**: Unit test or manual check: `buildProgressionBundle(['Cmaj7','Dm7','G7'], 'C', 'Major')` returns string containing key, chords, and RN.
- **1.2**: Manual check: constructed prompt includes bundle and user message; when sent to agent, response is about the progression.
- **1.3**: Manual check: if agent returns text containing `[[DRILL:SPOTLIGHT]]`, it is stripped and not shown.
- **2.1**: Manual check: Chat section visible; user can type and see messages; assistant replies appear in list.
- **2.2**: Manual check: Change progression, ask "What could follow?"; answer reflects current chords. Empty progression still allows a generic question.
- **2.3**: Manual check: Loading state and error message appear when appropriate.

### Phase success criteria (from ROADMAP.md)
- User can ask about the current progression and get coherent answers and suggestions.
- No raw `[[...]]` in Chord Lab chat (or define a minimal command set later).
- Q&A ("Why does this work?", "Scale over G7?"), continuations ("What could follow?"), and alternatives ("Substitute for the G7") are supported via natural language in the chat.

---

## Plan check (phase goal and requirements)

- **Phase goal**: "Local AI in Chord Lab as a chatbot that answers questions about progressions, suggests continuations/alternatives, and explains." → Covered by Wave 1 (progression bundle + prompt) and Wave 2 (chat UI + LocalAgentService wiring); success criteria require Q&A, continuations, alternatives.
- **REQ-CL-AI-01** (progression bundle): Task 1.1.
- **REQ-CL-AI-02** (chatbot UI): Tasks 2.1, 2.2.
- **REQ-CL-AI-03**, **REQ-CL-AI-04** (Q&A, continuations, alternatives): Prompt construction and phase success criteria.
- **REQ-CL-AI-05** (LocalAgentService, theory core, no cloud): RESEARCH and plan use existing LocalAgentService and theory; no cloud.

---

## Optional follow-ups (out of scope for this phase)

- Dedicated Chord Lab session with progression mentor system prompt (replace prepend-context approach).
- Persistent conversation history across page refresh.
- Chord Lab–specific `[[SHOW:CHORD:...]]` or `[[INSERT:CHORD:...]]` commands that insert a suggested chord into the progression.
