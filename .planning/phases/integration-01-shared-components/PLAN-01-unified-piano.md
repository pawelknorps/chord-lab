---
wave: 1
dependencies: []
files_to_modify:
  - src/components/shared/UnifiedPiano.tsx (new)
  - src/components/shared/UnifiedPiano.module.css (new)
  - src/components/shared/types.ts (new)
estimated_time: 4-6 hours
---

# Plan: Create Unified Piano Component

## Context

Currently, there are 4+ different piano implementations across the codebase:
- `src/components/InteractivePiano.tsx` (shared)
- `src/modules/ChordLab/components/PianoKeyboard.tsx`
- `src/modules/ChordBuildr/components/ChordPianoComponent.tsx`
- `src/modules/ChordBuildr/components/PianoBoardComponent.tsx`
- `src/modules/ChordBuildr/components/PianoComponent.tsx`

This leads to:
- Inconsistent behavior and UX
- Duplicated code (~2000+ lines)
- Difficult maintenance
- Larger bundle size

## Goal

Create a single, configurable `<UnifiedPiano>` component that can replace all existing implementations with consistent behavior, styling, and features.

## Tasks

### Task 1: Define Piano Component Types and Interfaces

<task>
<description>
Create type definitions for the UnifiedPiano component, including all modes, props, and event handlers.
</description>

<steps>
1. Create `src/components/shared/types.ts`
2. Define `PianoMode` type: 'display' | 'input' | 'playback' | 'highlight'
3. Define `NoteLabel` type: 'none' | 'note-name' | 'interval' | 'scale-degree' | 'chord-tone'
4. Define `UnifiedPianoProps` interface with:
   - mode: PianoMode
   - highlightedNotes?: number[] (MIDI note numbers)
   - activeNotes?: number[] (currently playing)
   - onNoteClick?: (note: number) => void
   - onNotePress?: (note: number) => void
   - onNoteRelease?: (note: number) => void
   - showLabels?: NoteLabel
   - showIntervals?: boolean
   - rootNote?: number (for interval display)
   - octaveRange?: [number, number] (default [3, 5])
   - disabled?: boolean
   - className?: string
5. Define `PianoKeyProps` interface for individual keys
6. Export all types
</steps>

<verification>
- [ ] Types file exists and compiles without errors
- [ ] All modes and label types are defined
- [ ] Props interface is comprehensive and well-documented
- [ ] TypeScript provides good autocomplete for component usage
</verification>
</task>

### Task 2: Implement Base Piano Component Structure

<task>
<description>
Create the core UnifiedPiano component with keyboard rendering logic.
</description>

<steps>
1. Create `src/components/shared/UnifiedPiano.tsx`
2. Import types from `./types`
3. Create component with props destructuring
4. Implement `generateKeys()` function:
   - Generate array of keys based on octaveRange
   - Include both white and black keys
   - Calculate positions for black keys
   - Return array of key objects with: note, isBlack, position
5. Implement keyboard rendering:
   - Map over keys array
   - Render white keys first, then black keys (for proper layering)
   - Apply appropriate classes based on state
6. Add basic styling structure (to be detailed in CSS)
7. Export component
</steps>

<verification>
- [ ] Component renders a piano keyboard
- [ ] Correct number of keys for octave range
- [ ] Black keys positioned correctly over white keys
- [ ] No console errors or warnings
</verification>
</task>

### Task 3: Implement Piano Modes

<task>
<description>
Add logic for different piano modes: display, input, playback, highlight.
</description>

<steps>
1. Implement mode-specific behavior:
   - **display**: Read-only, no interactions
   - **input**: Clickable keys, calls onNoteClick
   - **playback**: Shows activeNotes, no user interaction
   - **highlight**: Shows highlightedNotes, clickable
2. Add conditional event handlers based on mode:
   - Only attach onClick in 'input' or 'highlight' modes
   - Only show activeNotes in 'playback' mode
3. Implement key state calculation:
   - isActive: note in activeNotes array
   - isHighlighted: note in highlightedNotes array
   - isDisabled: disabled prop or mode === 'display'
4. Apply appropriate CSS classes based on state
5. Add MIDI input support (if mode allows interaction):
   - Listen for MIDI events from MidiContext
   - Trigger onNotePress/onNoteRelease
   - Visual feedback for MIDI input
</steps>

<verification>
- [ ] Display mode shows piano but no interaction
- [ ] Input mode allows clicking keys
- [ ] Playback mode shows active notes correctly
- [ ] Highlight mode shows highlighted notes and allows clicks
- [ ] MIDI input works in interactive modes
</verification>
</task>

### Task 4: Implement Note Labels

<task>
<description>
Add support for different note label types: note names, intervals, scale degrees, chord tones.
</description>

<steps>
1. Create `getNoteLabel()` function:
   - Takes: note (MIDI number), labelType, rootNote
   - Returns: string label or null
2. Implement label logic for each type:
   - **note-name**: Convert MIDI to note name (C, C#, D, etc.)
   - **interval**: Calculate interval from rootNote (P1, M2, M3, etc.)
   - **scale-degree**: Calculate scale degree (1, 2, 3, etc.)
   - **chord-tone**: Show chord tone (R, 3, 5, 7, etc.)
3. Render labels on keys:
   - Position labels centered on keys
   - Use smaller font for black keys
   - Ensure labels are readable (contrast)
4. Add tooltip on hover showing full note info:
   - Note name + MIDI number
   - Interval from root (if applicable)
   - Frequency in Hz
</steps>

<verification>
- [ ] Note names display correctly
- [ ] Intervals calculated correctly from root note
- [ ] Scale degrees show correctly
- [ ] Chord tones display correctly
- [ ] Labels are readable on both white and black keys
- [ ] Tooltips show comprehensive note information
</verification>
</task>

### Task 5: Implement Styling and Animations

<task>
<description>
Create comprehensive CSS for the piano with smooth animations and responsive design.
</description>

<steps>
1. Create `src/components/shared/UnifiedPiano.module.css`
2. Style the piano container:
   - Flexbox layout for keys
   - Responsive width (100% of container)
   - Proper aspect ratio
3. Style white keys:
   - White background with subtle gradient
   - Border for separation
   - Hover state (slight darkening)
   - Active state (pressed down effect)
   - Highlighted state (accent color glow)
4. Style black keys:
   - Black background with gradient
   - Positioned absolutely over white keys
   - Smaller height (60% of white keys)
   - Proper z-index layering
   - Hover/active/highlighted states
5. Add animations:
   - Smooth transition for all state changes (150ms)
   - Key press animation (scale down slightly)
   - Glow effect for highlighted keys
   - Pulse animation for active (playing) keys
6. Add responsive breakpoints:
   - Desktop: Full size
   - Tablet: Slightly smaller, still usable
   - Mobile: Scrollable horizontally (optional)
7. Ensure accessibility:
   - Focus indicators for keyboard navigation
   - Sufficient color contrast
   - Touch-friendly sizes on mobile
</steps>

<verification>
- [ ] Piano looks professional and polished
- [ ] Animations are smooth and not jarring
- [ ] Hover states provide clear feedback
- [ ] Active/highlighted states are visually distinct
- [ ] Component is responsive on different screen sizes
- [ ] Keyboard navigation works with visible focus
- [ ] Touch interactions work on tablets
</verification>
</task>

### Task 6: Add Audio Integration

<task>
<description>
Integrate with AudioManager (to be created) for sound playback in input mode.
</description>

<steps>
1. Import AudioManager (will be created in next plan)
2. Add optional `playSound` prop (boolean, default false)
3. When key is clicked/pressed (and playSound is true):
   - Call AudioManager.playNote(note, duration, velocity)
4. When key is released:
   - Call AudioManager.stopNote(note)
5. Add visual feedback synchronized with audio:
   - Key stays "active" while note is playing
   - Release animation when note stops
6. Handle edge cases:
   - Multiple simultaneous notes
   - Rapid clicking
   - MIDI input with sustain pedal
</steps>

<verification>
- [ ] Keys play sound when clicked (if playSound enabled)
- [ ] Sound stops when key is released
- [ ] Multiple notes can play simultaneously
- [ ] No stuck notes or audio glitches
- [ ] Visual state matches audio state
</verification>
</task>

### Task 7: Create Component Documentation and Examples

<task>
<description>
Document the component with usage examples and Storybook stories (optional).
</description>

<steps>
1. Add comprehensive JSDoc comments to component
2. Document all props with descriptions and examples
3. Create usage examples in comments:
   - Basic display piano
   - Interactive input piano
   - Playback visualization
   - Chord highlighting
4. (Optional) Create Storybook stories:
   - Story for each mode
   - Story for each label type
   - Interactive controls for testing
5. Add README.md in shared components folder explaining:
   - Purpose of UnifiedPiano
   - Migration guide from old components
   - Common use cases
</steps>

<verification>
- [ ] Component has comprehensive JSDoc comments
- [ ] All props are documented
- [ ] Usage examples are clear and helpful
- [ ] README provides migration guidance
- [ ] (Optional) Storybook stories work and are useful
</verification>
</task>

## Success Criteria

- [ ] UnifiedPiano component is fully functional
- [ ] All 4 modes work correctly (display, input, playback, highlight)
- [ ] All label types work correctly (note-name, interval, scale-degree, chord-tone)
- [ ] Styling is polished and professional
- [ ] Animations are smooth
- [ ] Component is responsive
- [ ] MIDI input works
- [ ] Audio integration works (with AudioManager)
- [ ] Component is well-documented
- [ ] TypeScript types are comprehensive
- [ ] No console errors or warnings

## Files Created

- `src/components/shared/types.ts` - Type definitions
- `src/components/shared/UnifiedPiano.tsx` - Main component
- `src/components/shared/UnifiedPiano.module.css` - Styles
- `src/components/shared/README.md` - Documentation

## Next Steps

After completing this plan:
1. Create AudioManager (PLAN-02)
2. Create UnifiedFretboard (PLAN-03)
3. Migrate ChordLab to use UnifiedPiano (PLAN-04)
4. Migrate other modules (PLAN-05+)

## Notes

- This component should be as generic and reusable as possible
- Avoid module-specific logic - keep it pure and composable
- Performance is critical - optimize rendering for 88 keys
- Consider using React.memo for individual keys to prevent unnecessary re-renders
- Ensure the component works with both mouse and touch input
- Test thoroughly with different octave ranges (1 octave, 2 octaves, full 88-key piano)
