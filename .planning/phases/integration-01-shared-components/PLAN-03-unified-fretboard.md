---
wave: 2
dependencies: [PLAN-01-unified-piano.md]
files_to_modify:
  - src/components/shared/UnifiedFretboard.tsx (new)
  - src/components/shared/UnifiedFretboard.module.css (new)
  - src/components/shared/types.ts (modify)
estimated_time: 4-5 hours
---

# Plan: Create Unified Fretboard Component

## Context

Currently, there are 2+ fretboard implementations:
- Ear Training has fretboard displays for positions and fretboard mapping
- Grip Sequencer has its own fretboard visualization

This leads to:
- Inconsistent fretboard behavior
- Duplicated code
- Different visual styles

## Goal

Create a single, configurable `<UnifiedFretboard>` component that can replace all existing implementations with consistent behavior and styling.

## Tasks

### Task 1: Define Fretboard Types and Interfaces

<task>
<description>
Create type definitions for the UnifiedFretboard component.
</description>

<steps>
1. Add to `src/components/shared/types.ts`:
2. Define `FretboardMode` type: 'notes' | 'intervals' | 'scale-degrees' | 'chord-tones'
3. Define `FretboardTuning` type: 'standard' | 'drop-d' | 'open-g' | custom
4. Define `UnifiedFretboardProps` interface:
   - mode: FretboardMode
   - tuning?: FretboardTuning | string[] (custom tuning)
   - highlightedNotes?: number[] (MIDI note numbers)
   - activeNotes?: number[] (currently playing)
   - onNoteClick?: (note: number, string: number, fret: number) => void
   - showFretNumbers?: boolean
   - showStringNames?: boolean
   - fretRange?: [number, number] (default [0, 12])
   - rootNote?: number (for interval/scale degree display)
   - interactive?: boolean
   - className?: string
5. Define `FretPosition` type: { string: number, fret: number, note: number }
6. Export all types
</steps>

<verification>
- [ ] Types are defined and compile without errors
- [ ] All modes and tunings are covered
- [ ] Props interface is comprehensive
- [ ] TypeScript provides good autocomplete
</verification>
</task>

### Task 2: Implement Base Fretboard Structure

<task>
<description>
Create the core UnifiedFretboard component with fretboard rendering logic.
</description>

<steps>
1. Create `src/components/shared/UnifiedFretboard.tsx`
2. Import types from `./types`
3. Define standard tunings:
   - Standard: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
   - Drop D: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4']
   - Open G: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4']
4. Implement `calculateNoteAtFret()`:
   - Takes string tuning and fret number
   - Returns MIDI note number
5. Implement `generateFretboard()`:
   - Create 2D array of fret positions
   - For each string and fret, calculate note
   - Return array of FretPosition objects
6. Render fretboard structure:
   - Strings (horizontal lines)
   - Frets (vertical lines)
   - Fret markers (dots at 3, 5, 7, 9, 12)
   - Nut (thick line at fret 0)
7. Export component
</steps>

<verification>
- [ ] Fretboard renders correctly
- [ ] Correct number of strings and frets
- [ ] Fret markers at correct positions
- [ ] Notes calculated correctly for each position
- [ ] No console errors
</verification>
</task>

### Task 3: Implement Fretboard Modes

<task>
<description>
Add logic for different display modes: notes, intervals, scale degrees, chord tones.
</description>

<steps>
1. Implement mode-specific label generation:
   - **notes**: Show note names (E, F, F#, G, etc.)
   - **intervals**: Show intervals from root (R, m2, M2, m3, M3, etc.)
   - **scale-degrees**: Show scale degrees (1, 2, 3, 4, 5, etc.)
   - **chord-tones**: Show chord tones (R, 3, 5, 7, 9, etc.)
2. Create `getLabel()` function:
   - Takes: note, mode, rootNote
   - Returns: string label
3. Render labels on fretboard:
   - Show label for each highlighted note
   - Position labels centered on fret
   - Use contrasting color for visibility
4. Add highlighting logic:
   - Highlight notes in highlightedNotes array
   - Different color for root note
   - Different color for active (playing) notes
5. Implement interactive mode:
   - Make frets clickable if interactive === true
   - Call onNoteClick with note, string, fret
   - Visual feedback on hover
</steps>

<verification>
- [ ] All modes display correct labels
- [ ] Intervals calculated correctly
- [ ] Scale degrees show correctly
- [ ] Chord tones display correctly
- [ ] Highlighting works
- [ ] Interactive mode allows clicking
</verification>
</task>

### Task 4: Implement Styling and Responsive Design

<task>
<description>
Create comprehensive CSS for the fretboard with responsive design.
</description>

<steps>
1. Create `src/components/shared/UnifiedFretboard.module.css`
2. Style fretboard container:
   - Aspect ratio for realistic proportions
   - Responsive width
   - Proper spacing
3. Style strings:
   - Horizontal lines
   - Thicker for lower strings (realistic)
   - Proper spacing
4. Style frets:
   - Vertical lines
   - Decreasing spacing (realistic perspective)
   - Nut is thicker
5. Style fret markers:
   - Dots at 3, 5, 7, 9
   - Double dots at 12
   - Subtle color
6. Style note positions:
   - Circles for notes
   - Highlighted state (accent color)
   - Active state (pulsing animation)
   - Root note (different color)
   - Hover state (if interactive)
7. Add responsive breakpoints:
   - Desktop: Full size
   - Tablet: Slightly smaller
   - Mobile: Scrollable horizontally
8. Ensure accessibility:
   - Focus indicators
   - Touch-friendly sizes
</steps>

<verification>
- [ ] Fretboard looks realistic
- [ ] Proportions are correct
- [ ] Highlighting is clear
- [ ] Responsive on different screens
- [ ] Touch-friendly on tablets
- [ ] Accessible with keyboard
</verification>
</task>

### Task 5: Add Audio Integration

<task>
<description>
Integrate with AudioManager for sound playback when notes are clicked.
</description>

<steps>
1. Import AudioManager
2. Add optional `playSound` prop (boolean)
3. When fret is clicked (and playSound is true):
   - Call AudioManager.playNote(note, duration, velocity)
4. Add visual feedback synchronized with audio:
   - Note stays "active" while playing
   - Release animation when note stops
5. Handle edge cases:
   - Multiple simultaneous notes
   - Rapid clicking
</steps>

<verification>
- [ ] Clicking frets plays sound (if enabled)
- [ ] Visual feedback matches audio
- [ ] Multiple notes can play
- [ ] No audio glitches
</verification>
</task>

### Task 6: Create Documentation and Examples

<task>
<description>
Document the component with usage examples.
</description>

<steps>
1. Add JSDoc comments to component
2. Document all props
3. Create usage examples:
   - Basic fretboard display
   - Interactive fretboard
   - Chord visualization
   - Scale visualization
4. Add to shared components README
</steps>

<verification>
- [ ] Component is well-documented
- [ ] Examples are clear
- [ ] README is updated
</verification>
</task>

## Success Criteria

- [ ] UnifiedFretboard component is fully functional
- [ ] All modes work correctly
- [ ] All tunings work correctly
- [ ] Styling is polished
- [ ] Component is responsive
- [ ] Audio integration works
- [ ] Component is well-documented
- [ ] No console errors

## Files Created

- `src/components/shared/UnifiedFretboard.tsx`
- `src/components/shared/UnifiedFretboard.module.css`
- Updated `src/components/shared/types.ts`

## Next Steps

1. Migrate Ear Training to use UnifiedFretboard
2. Migrate Grip Sequencer to use UnifiedFretboard
3. Test across all use cases

## Notes

- Keep component generic and reusable
- Performance is important - optimize rendering
- Consider using React.memo for individual fret positions
- Ensure realistic fret spacing (decreases toward body)
- Support both 6-string and 7-string guitars (future)
