---
wave: 3
dependencies: [PLAN-01-unified-piano.md, PLAN-02-audio-manager.md]
files_to_modify:
  - src/modules/ChordLab/ChordLab.tsx
  - src/modules/ChordLab/components/PianoKeyboard.tsx (remove)
  - src/modules/ChordLab/components/Controls.tsx
estimated_time: 3-4 hours
---

# Plan: Migrate ChordLab to Unified Components

## Context

ChordLab is the most-used module and should be migrated first to:
1. Validate that UnifiedPiano and AudioManager work in production
2. Establish migration patterns for other modules
3. Get early feedback on the new components

Current ChordLab implementation:
- Uses custom `PianoKeyboard.tsx` component
- Manages its own Tone.js audio
- Has ~500 lines of piano-related code

## Goal

Migrate ChordLab to use:
- `<UnifiedPiano>` instead of custom piano
- `AudioManager` instead of direct Tone.js calls
- Verify no regressions in functionality
- Reduce code by ~300 lines

## Tasks

### Task 1: Audit Current ChordLab Implementation

<task>
<description>
Understand how ChordLab currently uses the piano and audio.
</description>

<steps>
1. Review `src/modules/ChordLab/ChordLab.tsx`:
   - How is PianoKeyboard used?
   - What props are passed?
   - What events are handled?
2. Review `src/modules/ChordLab/components/PianoKeyboard.tsx`:
   - What features does it have?
   - How does it handle highlighting?
   - How does it play audio?
3. Review audio usage:
   - Where is Tone.js initialized?
   - How are chords played?
   - How is cleanup handled (or not)?
4. Document current behavior:
   - List all piano features used
   - List all audio features used
   - Identify any custom logic
5. Create test checklist:
   - All features that must work after migration
   - Edge cases to test
</steps>

<verification>
- [ ] Current implementation is fully understood
- [ ] All features are documented
- [ ] Test checklist is comprehensive
- [ ] No hidden dependencies discovered
</verification>
</task>

### Task 2: Replace PianoKeyboard with UnifiedPiano

<task>
<description>
Replace the custom PianoKeyboard component with UnifiedPiano.
</description>

<steps>
1. Import UnifiedPiano:
   ```typescript
   import { UnifiedPiano } from '../../components/shared/UnifiedPiano';
   ```
2. Replace PianoKeyboard usage:
   - Map current props to UnifiedPiano props
   - Set mode to 'highlight' (shows chords, clickable)
   - Pass highlightedNotes (current chord notes)
   - Pass onNoteClick handler
3. Update highlighting logic:
   - Convert chord notes to MIDI numbers
   - Pass to highlightedNotes prop
   - Ensure root note is highlighted differently (if needed)
4. Update label display:
   - Set showLabels to 'note-name' or 'interval' based on user preference
   - Ensure labels are readable
5. Test piano rendering:
   - Verify piano displays correctly
   - Verify highlighting works
   - Verify clicking works
6. Remove old PianoKeyboard component:
   - Delete `src/modules/ChordLab/components/PianoKeyboard.tsx`
   - Remove related CSS
   - Remove imports
</steps>

<verification>
- [ ] UnifiedPiano renders in ChordLab
- [ ] Chord highlighting works correctly
- [ ] Clicking keys works
- [ ] Labels display correctly
- [ ] Old component is removed
- [ ] No console errors
</verification>
</task>

### Task 3: Migrate to AudioManager

<task>
<description>
Replace direct Tone.js usage with AudioManager.
</description>

<steps>
1. Import AudioManager hook:
   ```typescript
   import { useAudioManager, useAudioCleanup } from '../../hooks/useAudioManager';
   ```
2. Get AudioManager instance:
   ```typescript
   const audioManager = useAudioManager();
   ```
3. Register module for cleanup:
   ```typescript
   useAudioCleanup('chordlab');
   ```
4. Replace chord playback:
   - Find where chords are currently played
   - Replace with: `audioManager.playChord(notes, duration, velocity)`
   - Ensure timing is correct
5. Replace note playback (if any):
   - Replace with: `audioManager.playNote(note, duration, velocity)`
6. Remove direct Tone.js imports:
   - Remove `import * as Tone from 'tone'`
   - Remove any Tone.js initialization code
   - Remove cleanup code (AudioManager handles it)
7. Test audio playback:
   - Play single chord - works
   - Play progression - works
   - Switch to another module - audio stops
   - Return to ChordLab - audio works again
</steps>

<verification>
- [ ] Audio plays correctly
- [ ] Chords sound the same as before
- [ ] No stuck notes when switching modules
- [ ] Audio stops on unmount
- [ ] No Tone.js code remains in ChordLab
</verification>
</task>

### Task 4: Update Controls and UI

<task>
<description>
Update any controls or UI elements that interact with the piano or audio.
</description>

<steps>
1. Review `src/modules/ChordLab/components/Controls.tsx`:
   - Update any piano-related controls
   - Update any audio-related controls
2. Ensure playback controls work:
   - Play button
   - Stop button
   - Tempo control
   - Volume control
3. Update voicing controls:
   - Ensure voicing changes update highlightedNotes
   - Test all voicing options
4. Update key/scale selectors:
   - Ensure changes update piano highlighting
   - Test all keys and scales
5. Test MIDI export:
   - Ensure MIDI export still works
   - Verify exported MIDI is correct
</steps>

<verification>
- [ ] All controls work correctly
- [ ] Playback controls function properly
- [ ] Voicing changes work
- [ ] Key/scale changes work
- [ ] MIDI export works
</verification>
</task>

### Task 5: Test and Verify

<task>
<description>
Comprehensive testing to ensure no regressions.
</description>

<steps>
1. Functional testing:
   - [ ] Build progression - works
   - [ ] Play progression - sounds correct
   - [ ] Change key - updates correctly
   - [ ] Change scale - updates correctly
   - [ ] Change voicing - sounds correct
   - [ ] Export MIDI - file is correct
   - [ ] Load preset - works
   - [ ] Save progression - works
2. Audio testing:
   - [ ] Play single chord - works
   - [ ] Play progression - works
   - [ ] Stop playback - stops immediately
   - [ ] Switch to Ear Training - ChordLab audio stops
   - [ ] Return to ChordLab - audio works
   - [ ] Rapid clicking - no glitches
3. Piano testing:
   - [ ] Highlighting shows correct notes
   - [ ] Clicking keys adds to progression
   - [ ] Labels display correctly
   - [ ] Hover states work
   - [ ] Responsive on tablet
4. Performance testing:
   - [ ] No lag when switching chords
   - [ ] No memory leaks (check DevTools)
   - [ ] Bundle size reduced (check build output)
5. Edge cases:
   - [ ] Empty progression
   - [ ] Full progression (8 chords)
   - [ ] Complex chords (extensions, alterations)
   - [ ] All voicing types
   - [ ] All keys
</steps>

<verification>
- [ ] All functional tests pass
- [ ] All audio tests pass
- [ ] All piano tests pass
- [ ] Performance is good
- [ ] Edge cases handled
- [ ] No regressions found
</verification>
</task>

### Task 6: Code Cleanup and Documentation

<task>
<description>
Clean up code and document the migration.
</description>

<steps>
1. Remove unused code:
   - Delete old PianoKeyboard component
   - Remove unused imports
   - Remove unused CSS
   - Remove unused utility functions
2. Update comments:
   - Add comments explaining UnifiedPiano usage
   - Add comments explaining AudioManager usage
   - Update any outdated comments
3. Run linter:
   - Fix any linting errors
   - Remove unused variables
   - Ensure consistent formatting
4. Update documentation:
   - Add migration notes to CHANGELOG
   - Update README if needed
   - Document any breaking changes
5. Measure improvements:
   - Count lines of code removed
   - Measure bundle size reduction
   - Document performance improvements
</steps>

<verification>
- [ ] Old code is removed
- [ ] No unused imports
- [ ] Linter passes
- [ ] Documentation is updated
- [ ] Improvements are measured and documented
</verification>
</task>

## Success Criteria

- [ ] ChordLab uses UnifiedPiano
- [ ] ChordLab uses AudioManager
- [ ] All features work as before
- [ ] No stuck notes when switching modules
- [ ] Code reduced by ~300 lines
- [ ] Bundle size reduced
- [ ] No regressions
- [ ] Tests pass

## Files Modified

- `src/modules/ChordLab/ChordLab.tsx` - Use UnifiedPiano and AudioManager
- `src/modules/ChordLab/components/Controls.tsx` - Update controls
- Deleted: `src/modules/ChordLab/components/PianoKeyboard.tsx`

## Testing Checklist

### Before Migration
- [ ] Take screenshots of current UI
- [ ] Record current bundle size
- [ ] Test all features and document behavior
- [ ] Create test cases for edge cases

### After Migration
- [ ] Compare screenshots - UI looks the same
- [ ] Compare bundle size - reduced
- [ ] Run all test cases - pass
- [ ] Test stuck notes - none
- [ ] Test performance - same or better

## Rollback Plan

If migration causes issues:
1. Revert commits
2. Keep UnifiedPiano and AudioManager (they're generic)
3. Investigate issues
4. Fix and retry migration

## Next Steps

After ChordLab migration:
1. Migrate Ear Training (PLAN-05)
2. Migrate Chord Builder (PLAN-06)
3. Migrate other modules
4. Remove all old piano components

## Notes

- ChordLab is critical - test thoroughly
- Users will notice any regressions
- Take time to get it right
- Document any issues for other migrations
- This migration establishes the pattern for others
