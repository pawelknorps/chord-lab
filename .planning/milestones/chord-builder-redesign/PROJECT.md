# Chord Builder Redesign - Project Vision

## Vision Statement

Transform the Chord Builder from a broken visual component into an **educational powerhouse** that helps music students understand chord construction, voicings, and harmonic relationships through interactive, visual learning.

## Problem Statement

The current Chord Builder has:
- **Broken visuals**: CSS conflicts and inconsistent styling
- **Poor educational value**: Doesn't teach students WHY chords work
- **Limited interactivity**: Passive display rather than active learning
- **No context**: Chords shown in isolation without harmonic relationships

## Core Value Proposition

**"Learn chords by building them"** - An interactive workspace where students:
1. **Construct** chords note-by-note and understand intervals
2. **Visualize** chord tones on both piano and guitar
3. **Compare** different voicings side-by-side
4. **Discover** harmonic relationships and voice leading
5. **Practice** with MIDI input and instant feedback

## Target Audience

- **Music students** (beginner to intermediate)
- **Jazz/theory learners** exploring voicings and extensions
- **Instrumentalists** wanting to understand chord construction
- **Teachers** demonstrating harmonic concepts

## Core Functionality (The ONE Thing)

**Interactive Chord Construction with Real-Time Visual Feedback**

Students must be able to:
- Click/play notes to build a chord
- See the chord name update in real-time
- Visualize intervals and chord tones
- Hear the chord played back
- Compare different voicings

## Key Educational Features

### 1. **Interval Visualization**
- Show intervals between notes (M3, P5, m7, etc.)
- Color-code chord tones (Root, 3rd, 5th, 7th, extensions)
- Display interval distances in semitones

### 2. **Chord Analysis Panel**
- Real-time chord name detection
- Show chord formula (1-3-5-7-9, etc.)
- Display available tensions/extensions
- Suggest common progressions using this chord

### 3. **Voicing Comparison**
- Side-by-side comparison of different voicings
- Drop-2, Drop-3, rootless voicings
- Voice leading suggestions between chords

### 4. **Practice Mode**
- "Build this chord" challenges
- Interval ear training
- Voicing recognition exercises

## Technical Constraints

- Must integrate with existing `ChordLab` ecosystem
- Use existing MIDI infrastructure (`useMidi` hook)
- Leverage `theoryEngine.ts` for chord detection
- Follow Swiss/Minimalist design system (where appropriate)
- Support both Piano and Guitar visualization

## Out of Scope (v1)

- ❌ Full composition/sequencing (that's ChordLab's job)
- ❌ Advanced guitar fingering algorithms
- ❌ Chord progression generation (use SmartLibrary)
- ❌ Audio synthesis beyond basic playback
- ❌ User accounts/cloud storage

## Success Metrics

- Students can identify chord intervals within 3 interactions
- 80% of users understand voicing differences after comparison
- MIDI input chord detection works with 95% accuracy
- Visual feedback appears within 100ms of note input

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Single-chord focus** | Deep learning > breadth; master one chord at a time |
| **Interval-first approach** | Understanding intervals = understanding harmony |
| **Real-time feedback** | Immediate validation accelerates learning |
| **Visual hierarchy** | Chord tones > extensions > alterations |
| **MIDI-first input** | Kinesthetic learning for instrumentalists |
| **Comparison mode** | Side-by-side learning reveals patterns |

## Integration Points

- **ChordLab**: Export built chords to progression builder
- **FunctionalEarTraining**: Use built chords for ear training
- **SmartLibrary**: Save/load custom voicings
- **Global MIDI**: Unified MIDI input handling

## Next Steps

1. Define detailed requirements (REQUIREMENTS.md)
2. Create visual mockups/wireframes
3. Plan implementation phases (ROADMAP.md)
4. Begin with core chord construction UI
