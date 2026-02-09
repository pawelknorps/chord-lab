# Chord Builder Redesign - Roadmap

## Overview

Transform the Chord Builder into an educational tool for learning chord construction, voicings, and harmonic relationships.

**Timeline**: 4 phases  
**Target**: Educational excellence + visual polish

---

## Phase 1: Foundation & Core UI (Week 1)

**Goal**: Clean slate - remove broken CSS, build solid foundation

### Tasks
- [ ] **CLEANUP-01**: Remove all conflicting CSS from ChordBuildr module
- [ ] **DESIGN-01**: Create new component structure using design system
- [ ] **LAYOUT-01**: Build responsive grid layout for chord workspace
- [ ] **PIANO-01**: Refactor PianoComponent with clean styling
- [ ] **INPUT-01**: Implement click-to-add-note interaction

### Requirements Addressed
- UI-CB-01: Clean Visual Design
- CORE-CB-01: Interactive Chord Construction (partial)

### Success Criteria
- No visual glitches or CSS conflicts
- Piano keyboard renders cleanly
- Click interaction adds/removes notes
- Responsive on mobile and desktop

---

## Phase 2: Chord Intelligence (Week 2)

**Goal**: Make it smart - detect chords, show intervals, play audio

### Tasks
- [ ] **DETECT-01**: Integrate theoryEngine for chord detection
- [ ] **INTERVALS-01**: Calculate and display intervals between notes
- [ ] **COLORS-01**: Implement color-coding for chord tones
- [ ] **ANALYSIS-01**: Build chord analysis panel (formula, tensions)
- [ ] **AUDIO-01**: Add chord playback with Tone.js
- [ ] **MIDI-01**: Integrate MIDI input for note entry

### Requirements Addressed
- THEORY-CB-01: Real-Time Chord Detection
- VIZ-CB-01: Interval Visualization
- AUDIO-CB-01: Chord Playback
- ANALYSIS-CB-01: Chord Analysis Panel

### Success Criteria
- Chord name updates in real-time as notes are added
- Intervals displayed with correct names and colors
- Chord plays back with piano sound
- MIDI keyboard input works seamlessly

---

## Phase 3: Advanced Features (Week 3)

**Goal**: Add depth - voicing comparison, guitar viz, export

### Tasks
- [ ] **VOICING-01**: Build voicing comparison panel
- [ ] **VOICE-LEAD-01**: Show voice leading between voicings
- [ ] **GUITAR-01**: Integrate guitar fretboard visualization
- [ ] **EXPORT-01**: Add "Export to ChordLab" functionality
- [ ] **PRESETS-01**: Add common voicing presets (drop-2, rootless, etc.)

### Requirements Addressed
- VOICING-CB-01: Voicing Comparison
- GUITAR-CB-01: Guitar Visualization
- EXPORT-CB-01: Export to ChordLab

### Success Criteria
- Side-by-side voicing comparison works
- Guitar fretboard shows chord accurately
- Export to ChordLab preserves voicing
- Preset voicings load correctly

---

## Phase 4: Educational Tools (Week 4)

**Goal**: Make it teach - practice mode, exercises, feedback

### Tasks
- [ ] **PRACTICE-01**: Build "Build This Chord" challenge mode
- [ ] **INTERVALS-TRAIN-01**: Add interval identification exercises
- [ ] **VOICING-TRAIN-01**: Add voicing recognition drills
- [ ] **FEEDBACK-01**: Implement visual feedback for correct/incorrect
- [ ] **PROGRESS-01**: Track practice progress (optional)
- [ ] **HINTS-01**: Add contextual hints and tooltips

### Requirements Addressed
- PRACTICE-CB-01: Practice Mode

### Success Criteria
- Practice challenges are engaging and educational
- Feedback is immediate and clear
- Students can track their progress
- Hints help without giving away answers

---

## State Tracking

- **Current Phase**: Phase 0 (Planning)
- **Overall Progress**: 0%
- **Next Milestone**: Phase 1 - Foundation & Core UI

---

## Dependencies

### External
- `theoryEngine.ts` - chord detection and analysis
- `globalAudio.ts` - audio playback
- `useMidi` hook - MIDI input
- Design system CSS variables

### Internal
- Clean component architecture
- Proper state management (Context or local state)
- Reusable UI components

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| CSS conflicts with existing modules | Scope all styles to `.chord-builder` namespace |
| Chord detection accuracy | Use proven theoryEngine, add manual override |
| Performance with complex chords | Debounce calculations, memoize components |
| MIDI input conflicts | Use global MIDI context, proper cleanup |
| Guitar fingering complexity | Use existing library, limit to common positions |

---

## Success Metrics

- **Educational**: Students understand intervals after 5 minutes
- **Usability**: 90% task completion rate for chord building
- **Performance**: <100ms response time for all interactions
- **Quality**: Zero visual bugs, consistent styling
- **Integration**: Seamless export to ChordLab
