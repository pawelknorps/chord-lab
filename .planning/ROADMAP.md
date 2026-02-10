# Roadmap: Semantic AI Mentor

## Phase 1: The Semantic Engine (Context Layer)
*Goal: Provide the AI with rich, annotated music theory data.*
- **Step 1**: Create `AiContextService.ts` to aggregate theory facts + app state.
- **Step 2**: Implement "Annotated Markdown" formatter for prompt efficiency.
- **Step 3**: Re-wire `SmartLessonPane` to use the new Context Service.
- **Success Criteria**: AI correctly identifies the "Pivot Point" in *Giant Steps* or *Autumn Leaves* consistently.

## Phase 2: Proactive Triggers (The Sensei Layer)
*Goal: AI takes the initiative to help the student.*
- **Step 4**: Implement "Stay-on-Hotspot" timer to trigger proactive advice.
- **Step 5**: Create "Pivot Detector" in the Lead Sheet to fire AI alerts when harmonic gravity changes.
- **Step 6**: Add "AI Assistant" toast notifications for low-friction proactive tips.
- **Success Criteria**: AI automatically offers a tip when the bridge of a song is reached.

## Phase 3: The Interactive Sidebar (Refinement Layer)
*Goal: Allow the user to drill down and refine AI advice.*
- **Step 7**: Build the `AiChatPanel` for multi-turn conversations about specific measures.
- **Step 8**: Implement "Measure Select" context injection (ask about bars 8-12).
- **Step 9**: Expand UI commands to include visual overlays (Scales/Avoid notes).
- **Success Criteria**: User can ask "Why is this chord Bb7?" and get a context-aware answer.

## Phase 4: Polish & Performance
- **Step 10**: Optimize token usage to avoid Nano context overflow.
- **Step 11**: Add "AI Activity" health monitor (is the model thinking? is it stuck?).
- **Success Criteria**: AI response time < 2s for complex lookups.
