# Chord Builder Redesign - Requirements

## v1 Requirements (Must-Have)

### UI-CB-01: Clean Visual Design
**Status**: Active  
**Priority**: P0  
**Description**: Replace broken CSS with clean, consistent styling using design system tokens.  
**Success Criteria**:
- No CSS conflicts or visual glitches
- Consistent spacing, typography, and colors
- Responsive layout (mobile to desktop)
- Smooth animations and transitions

### CORE-CB-01: Interactive Chord Construction
**Status**: Active  
**Priority**: P0  
**Description**: Students can build chords by clicking piano keys or using MIDI input.  
**Success Criteria**:
- Click piano keys to add/remove notes
- MIDI keyboard input adds notes in real-time
- Visual feedback within 100ms
- Support up to 7-note chords (13th chords)

### THEORY-CB-01: Real-Time Chord Detection
**Status**: Active  
**Priority**: P0  
**Description**: Automatically detect and name chords as notes are added.  
**Success Criteria**:
- Accurate detection for triads, 7ths, 9ths, 11ths, 13ths
- Handle slash chords (inversions)
- Display multiple possible names (e.g., C6 = Am7)
- Show "unknown" for non-standard voicings

### VIZ-CB-01: Interval Visualization
**Status**: Active  
**Priority**: P0  
**Description**: Display intervals between notes with color-coding.  
**Success Criteria**:
- Show interval names (M3, P5, m7, etc.)
- Color-code chord tones (Root=red, 3rd=blue, 5th=green, 7th=purple, extensions=yellow)
- Display interval distances in semitones
- Highlight root note prominently

### AUDIO-CB-01: Chord Playback
**Status**: Active  
**Priority**: P1  
**Description**: Play constructed chords with high-quality piano sound.  
**Success Criteria**:
- Instant playback on "Play" button
- Auto-play option when chord completes
- Volume control
- Sustain/release controls

### ANALYSIS-CB-01: Chord Analysis Panel
**Status**: Active  
**Priority**: P1  
**Description**: Educational panel showing chord formula, tensions, and theory.  
**Success Criteria**:
- Display chord formula (1-3-5-7-9-11-13)
- Show available tensions
- List common progressions using this chord
- Explain chord function (tonic, dominant, subdominant)

### VOICING-CB-01: Voicing Comparison
**Status**: Active  
**Priority**: P1  
**Description**: Compare different voicings of the same chord side-by-side.  
**Success Criteria**:
- Show root position, inversions
- Display drop-2, drop-3 voicings
- Show rootless voicings (for jazz)
- Highlight voice leading between voicings

### GUITAR-CB-01: Guitar Visualization
**Status**: Active  
**Priority**: P2  
**Description**: Show chord on guitar fretboard with fingering suggestions.  
**Success Criteria**:
- Display chord on 6-string guitar
- Show multiple fingering options
- Indicate finger positions (1-4)
- Support alternate tunings

### EXPORT-CB-01: Export to ChordLab
**Status**: Active  
**Priority**: P2  
**Description**: Send constructed chord to ChordLab progression builder.  
**Success Criteria**:
- "Add to Progression" button
- Preserves exact voicing
- Updates ChordLab state
- Visual confirmation of export

### PRACTICE-CB-01: Practice Mode
**Status**: Active  
**Priority**: P2  
**Description**: Interactive exercises for chord construction practice.  
**Success Criteria**:
- "Build this chord" challenges
- Interval identification exercises
- Voicing recognition drills
- Progress tracking

## v2 Requirements (Deferred)

### SAVE-CB-01: Save Custom Voicings
**Status**: Deferred  
**Description**: Save favorite voicings to user library.

### SHARE-CB-01: Share Voicings
**Status**: Deferred  
**Description**: Generate shareable links for voicings.

### ADVANCED-CB-01: Polychord Support
**Status**: Deferred  
**Description**: Build and analyze polychords (C/Bb, etc.).

### TENSION-CB-01: Tension Resolver
**Status**: Deferred  
**Description**: Suggest tension resolutions and voice leading.

## Out of Scope

- ❌ Full DAW-style sequencing
- ❌ Advanced guitar fingering algorithms (use existing library)
- ❌ Chord progression generation (use SmartLibrary)
- ❌ Multi-user collaboration
- ❌ Cloud sync

## Requirements Mapping

| Requirement | Phase | Dependencies |
|-------------|-------|--------------|
| UI-CB-01 | 1 | Design system |
| CORE-CB-01 | 1 | UI-CB-01 |
| THEORY-CB-01 | 1 | theoryEngine.ts |
| VIZ-CB-01 | 2 | CORE-CB-01, THEORY-CB-01 |
| AUDIO-CB-01 | 2 | globalAudio |
| ANALYSIS-CB-01 | 2 | THEORY-CB-01 |
| VOICING-CB-01 | 3 | THEORY-CB-01, VIZ-CB-01 |
| GUITAR-CB-01 | 3 | CORE-CB-01 |
| EXPORT-CB-01 | 3 | ChordLab integration |
| PRACTICE-CB-01 | 4 | All above |
