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

## Phase 7: Ear Trainer Feedback Loop & Rhythm Scat (Nano as Metadata Generator)
*Goal: Ear Trainer explains why mistakes happened (diagnostic hints); Rhythm Trainer gets scat phrases for subdivisions. Nano narrates Tonal.js ground truth.*
- [ ] **Step 20**: **Ear diagnostic**: Implement `diagnoseEarError(correctInterval, userGuess)` using Tonal.js Interval.semitones—return correct, guess, errorType (overshot/undershot), distance, isCommonConfusion (e.g. 4P vs tritone).
- [ ] **Step 21**: **Ear hint**: Implement `getEarHint(diagnosis)`—pass diagnosis to Nano; system prompt "Never give the answer. 1-sentence hint on vibe/character of the correct interval." Return hint for display.
- [ ] **Step 22**: **Listen Again UI**: In Ear Trainer (Functional Ear Training): on wrong answer → show "Not quite" + AI hint (toast/bubble) → replay → retry → on success update performance heatmap.
- [ ] **Step 23**: **Rhythm Scat**: For selected rhythm (e.g. Swing), ask Nano for a 3-word vocalization/scat phrase (e.g. "Doo-dah, doo-dah"); display above metronome. For complex syncopated rhythms, generate scat phrase to internalize time.
- [ ] **Step 24**: **askNano guardrail**: Ensure all Nano calls use Zero-Shot Context wrapper—re-inject ground truth (JSON from Tonal.js/state); system prompt "Concise Jazz Coach. Limit 15 words" where applicable.
- **Success Criteria**: Ear Trainer wrong answers show AI hint (no answer); student can retry after hint. Rhythm Trainer shows scat phrase above metronome for selected subdivision. No Nano call assumes prior context.
