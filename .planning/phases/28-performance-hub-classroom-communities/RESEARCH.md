# Research: Phase 28 - Performance Hub - Classroom & Communities

## Current State Analysis

### 1. Persistent Data
- `useSessionHistoryStore`: Stores accuracy, BPM, and measure stats.
- `useSoloStore`: Stores recorded solos and "musicalized" lick text.
- Currently, these are **local-only** (LocalStorage/IndexedDB).

### 2. Community Assets
- We have the "Lick Converter" (from earlier phases) but it lacks a "Hub".
- We have the "Mastery Tree" which is personal.

### 3. Classroom Requirements
- REQ-CC-01: Teacher Dashboard for monitoring student progress.
- REQ-CC-02: Lick Sharing (Publish/Subscribe).

## Implementation Strategy

### Sync Engine (Supabase)
- We need a `useSyncStore` or direct Supabase integration into existing stores.
- **Privacy**: Solos should be "Private" by default, with a "Share to Class" or "Post to Hub" toggle.

### Teacher Perspectives
- A teacher needs a "Roster" view.
- Selecting a student should render a read-only version of their **Mastery Tree** and **Performance Trends**.

### Social Discovery ( The Lick Hub )
- A feed of shared musicalizations.
- Components to "Audition" the lick (MIDI playback in browser).
- "Add to My Licks": Saves the lick to the user's `useSoloStore` for practice.

### AI Peer Insights
- Use Gemini Nano to generate "What can I learn from this?" comparisons.
- E.g., "Student A played this ii-V sequence with 90% accuracy but different phrasing. Try their approach."

## Open Questions
- **Storage Limits**: How many "Musicalized Solos" can we sync to Supabase before hit limits? (Should use Text-only for notation, R2/RSC for raw audio if needed).
- **Interactive Teachers**: Should students be able to "Request Feedback" from a specific teacher user?
