# Cross-Module Integration Architecture

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT STATE: SILOED MODULES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ ChordLab │  │   Ear    │  │   Jazz   │  │  Chord   │  │  Rhythm  │    │
│  │          │  │ Training │  │Standards │  │ Builder  │  │Architect │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Barry   │  │   Grip   │  │ Tonnetz  │  │ Negative │  │  Circle  │    │
│  │  Harris  │  │Sequencer │  │          │  │  Mirror  │  │  Chords  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                                             │
│                          ❌ No connections                                  │
│                          ❌ Duplicated code                                 │
│                          ❌ Inconsistent UX                                 │
│                          ❌ Isolated learning                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                                      ⬇️

┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER (5 Pillars)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔵 SHARED COMPONENTS          🟢 CROSS-MODULE NAV                          │
│  ├─ UnifiedPiano               ├─ "Send to..." buttons                     │
│  ├─ UnifiedFretboard           ├─ Deep linking (URLs)                      │
│  ├─ AudioManager               ├─ Musical clipboard                        │
│  └─ Theory utilities           └─ Recently practiced                       │
│                                                                             │
│  🟣 LEARNING PATHS             🟠 JAZZ INTEGRATION                          │
│  ├─ Skill taxonomy             ├─ Concept highlighting                     │
│  ├─ Prerequisites              ├─ Section analysis                         │
│  ├─ Recommendations            ├─ Progression extraction                   │
│  └─ Progress dashboard         └─ Chord-by-chord analysis                  │
│                                                                             │
│  🩷 EDUCATIONAL                                                             │
│  ├─ Learn panels                                                            │
│  ├─ Guided practice                                                         │
│  ├─ Contextual tips                                                         │
│  └─ Interactive demos                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                                      ⬇️

┌─────────────────────────────────────────────────────────────────────────────┐
│                 CONNECTED LEARNING JOURNEY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  START: "I want to learn jazz harmony"                                     │
│                                                                             │
│  👂 Step 1: INTERVALS (Ear Training)                                       │
│     └─ Learn to hear M3, P5, m7                                            │
│        └─ "Send to Chord Builder" → See intervals on piano                │
│                                                                             │
│  🎹 Step 2: CHORD TONES (Ear Training)                                     │
│     └─ Identify chord qualities by ear                                     │
│        └─ "Build this chord" → Opens Chord Builder                        │
│                                                                             │
│  🔨 Step 3: CHORD BUILDER                                                  │
│     └─ Construct Dm7, G7, Cmaj7                                            │
│        └─ "Hear in context" → Opens ChordLab                              │
│                                                                             │
│  🎵 Step 4: PROGRESSIONS (Ear Training)                                    │
│     └─ Hear ii-V-I by ear                                                  │
│        └─ "Build this progression" → Opens ChordLab                       │
│                                                                             │
│  🎼 Step 5: CHORDLAB                                                       │
│     └─ Build ii-V-I with different voicings                                │
│        └─ "Find in standards" → Opens Jazz Standards                      │
│                                                                             │
│  🎺 Step 6: JAZZ STANDARDS                                                 │
│     └─ See ii-V-I highlighted in "Autumn Leaves"                           │
│        └─ "Analyze section" → Deep dive into harmony                      │
│                                                                             │
│  🎓 RESULT: Deep understanding of ii-V-I                                   │
│     ✅ Theory (construction, function)                                      │
│     ✅ Aural (recognize by ear)                                             │
│     ✅ Practical (apply to real music)                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Integration Flow Examples

### Example 1: "Autumn Leaves" Deep Dive

```
JAZZ STANDARDS
    │
    ├─ Click "Autumn Leaves"
    │   └─ See lead sheet with chord symbols
    │
    ├─ Toggle "Highlight Concepts"
    │   └─ ii-V-I patterns highlighted in blue
    │   └─ Secondary dominants highlighted in orange
    │   └─ Modal interchange highlighted in purple
    │
    ├─ Click highlighted ii-V-I (measures 1-2)
    │   └─ "Analyze Section" modal opens
    │       ├─ Shows: Cm7 → F7 → Bbmaj7
    │       ├─ Roman numerals: ii → V → I in Bb
    │       ├─ Function: Subdominant → Dominant → Tonic
    │       └─ Actions:
    │           ├─ "Practice by ear" → Ear Training with this progression
    │           ├─ "Build in ChordLab" → ChordLab with these chords
    │           ├─ "Analyze chords" → Chord Builder for each chord
    │           └─ "Visualize" → Tonnetz showing voice leading
    │
    └─ Student chooses "Practice by ear"
        └─ Navigates to Ear Training
            └─ Exercise pre-loaded with Cm7-F7-Bbmaj7
            └─ Student practices identifying the progression
            └─ After mastery: "Return to Autumn Leaves" button
```

### Example 2: Chord Builder → Real Music

```
CHORD BUILDER
    │
    ├─ Student builds Dm7b5
    │   └─ Sees: D, F, Ab, C
    │   └─ Intervals: R, m3, b5, m7
    │   └─ Learn panel explains: "Half-diminished chord, often used as ii in minor"
    │
    ├─ Click "Find in standards"
    │   └─ Shows list of standards using Dm7b5:
    │       ├─ "Autumn Leaves" (m. 9-10, ii in Gm)
    │       ├─ "Stella by Starlight" (m. 1-2, ii in Bb minor)
    │       └─ "All the Things You Are" (m. 17-18, ii in Eb minor)
    │
    ├─ Click "Autumn Leaves"
    │   └─ Navigates to Jazz Standards
    │   └─ Automatically scrolls to measure 9
    │   └─ Dm7b5 is highlighted
    │   └─ Can play and hear it in context
    │
    └─ Student understands: "Ah, this is the ii chord in a minor ii-V-i!"
```

### Example 3: Learning Path Guidance

```
DASHBOARD
    │
    ├─ Student logs in
    │   └─ "Next Recommended" widget shows:
    │       ┌────────────────────────────────────────┐
    │       │ 🎯 Next Recommended Exercise           │
    │       ├────────────────────────────────────────┤
    │       │ Chord Tones (Ear Training)             │
    │       │                                        │
    │       │ Why? You've mastered Pure Intervals    │
    │       │ (85% accuracy). Time to apply them     │
    │       │ to chord recognition!                  │
    │       │                                        │
    │       │ [Start Exercise]                       │
    │       └────────────────────────────────────────┘
    │
    ├─ Student clicks "Start Exercise"
    │   └─ Navigates to Ear Training → Chord Tones level
    │   └─ Breadcrumb shows: Intervals → Chord Tones
    │
    ├─ During exercise, student struggles with m7 chords
    │   └─ Contextual tip appears:
    │       "Having trouble? Try focusing on the m7 interval (m3 + P5 + m7)"
    │       [Review Intervals] [Build in Chord Builder]
    │
    ├─ Student clicks "Build in Chord Builder"
    │   └─ Navigates to Chord Builder
    │   └─ Pre-loaded with Cm7
    │   └─ Learn panel shows: "Minor 7th chord = R + m3 + P5 + m7"
    │   └─ Can hear each interval individually
    │
    └─ Student returns to Ear Training with better understanding
        └─ Completes exercise with 90% accuracy
        └─ XP awarded, progress updated
        └─ New recommendation appears: "Progressions (Ear Training)"
```

## Technical Architecture

### Shared Components Layer

```
┌─────────────────────────────────────────────────────────────┐
│                  src/components/shared/                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  UnifiedPiano.tsx                                           │
│  ├─ Props: mode, highlightedNotes, onNoteClick, showLabels │
│  ├─ Modes: display, input, playback, highlight             │
│  └─ Used by: ChordLab, Ear Training, Chord Builder, etc.   │
│                                                             │
│  UnifiedFretboard.tsx                                       │
│  ├─ Props: mode, tuning, highlightedNotes, interactive     │
│  ├─ Modes: notes, intervals, scale degrees, chord tones    │
│  └─ Used by: Ear Training, Grip Sequencer                  │
│                                                             │
│  SendToMenu.tsx                                             │
│  ├─ Props: data (progression/chord), sourceModule          │
│  ├─ Destinations: Ear Training, ChordLab, Chord Builder    │
│  └─ Used by: All modules                                   │
│                                                             │
│  LearnPanel.tsx                                             │
│  ├─ Props: content (markdown), audioExamples, demos        │
│  └─ Used by: All modules                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Core Services Layer

```
┌─────────────────────────────────────────────────────────────┐
│                   src/core/services/                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AudioManager.ts                                            │
│  ├─ playNote(note, duration, velocity)                     │
│  ├─ playChord(notes[], duration, velocity)                 │
│  ├─ stopAll()                                               │
│  ├─ cleanup()                                               │
│  └─ Singleton pattern, used by all modules                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    src/core/theory/                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  index.ts (consolidated utilities)                         │
│  ├─ getInterval(note1, note2)                              │
│  ├─ buildChord(root, quality)                              │
│  ├─ getScale(root, scaleType)                              │
│  ├─ getRomanNumeral(chord, key)                            │
│  └─ Used by all modules                                    │
│                                                             │
│  functionalRules.ts                                         │
│  ├─ getChordFunction(romanNumeral)                         │
│  ├─ getCommonProgressions(key)                             │
│  └─ Used by: Ear Training, Jazz Standards, ChordLab        │
│                                                             │
│  negativeHarmony.ts                                         │
│  ├─ getNegativeChord(chord, axis)                          │
│  └─ Used by: Negative Mirror, Jazz Standards               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   src/core/learning/                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  skillTaxonomy.ts                                           │
│  └─ Defines: Intervals, Chords, Progressions, etc.         │
│                                                             │
│  prerequisites.ts                                           │
│  └─ Maps: exerciseId → [prerequisiteIds]                   │
│                                                             │
│  recommendationEngine.ts                                    │
│  ├─ getNextRecommendation(userProgress)                    │
│  └─ Returns: { exercise, reason, module }                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   src/core/routing/                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  deepLinks.ts                                               │
│  ├─ encodeProgression(progression) → URL params            │
│  ├─ decodeProgression(params) → progression                │
│  ├─ encodeChord(chord) → URL params                        │
│  └─ decodeChord(params) → chord                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### State Management Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    src/core/store/                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  useMasteryStore.ts (extended)                              │
│  ├─ globalLevel: number                                    │
│  ├─ globalXP: number                                       │
│  ├─ skillMastery: { [skillId]: number }  ← NEW            │
│  ├─ exerciseHistory: Exercise[]  ← NEW                     │
│  ├─ addXP(amount, skillId)                                 │
│  ├─ getSkillMastery(skillId)                               │
│  └─ getWeakAreas()  ← NEW                                  │
│                                                             │
│  musicalClipboard.ts (new)                                  │
│  ├─ copyProgression(progression)                           │
│  ├─ pasteProgression() → progression                       │
│  ├─ copyChord(chord)                                       │
│  └─ pasteChord() → chord                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Sending Progression from ChordLab to Ear Training

```
1. ChordLab Component
   ├─ User builds progression: [Dm7, G7, Cmaj7]
   ├─ Clicks "Practice by ear" button
   └─ Calls: navigateToEarTraining({ progression, key })

2. useModuleNavigation Hook
   ├─ Encodes progression to URL params
   ├─ Format: /ear-training?progression=ii-V-I&key=C&chords=Dm7,G7,Cmaj7
   └─ Navigates to URL

3. Ear Training Component
   ├─ Reads URL params on mount
   ├─ Decodes progression
   ├─ Pre-loads exercise with progression
   └─ Shows: "Practice this progression from ChordLab"

4. User completes exercise
   ├─ XP awarded
   ├─ Progress updated
   └─ "Return to ChordLab" button available
```

### Analyzing Jazz Standard Section

```
1. Jazz Standards Component
   ├─ User selects measures 1-4 of "Autumn Leaves"
   ├─ Clicks "Analyze Section"
   └─ Opens analysis modal

2. Analysis Modal
   ├─ Shows chords: Cm7, F7, Bbmaj7, Ebmaj7
   ├─ Shows Roman numerals: ii, V, I, IV in Bb
   ├─ Shows functions: Subdominant, Dominant, Tonic, Subdominant
   └─ Offers actions:
       ├─ "Practice by ear" → Ear Training
       ├─ "Build in ChordLab" → ChordLab
       ├─ "Analyze chords" → Chord Builder
       └─ "Visualize" → Tonnetz

3. User clicks "Analyze chords"
   ├─ Navigates to Chord Builder
   ├─ URL: /chord-builder?chords=Cm7,F7,Bbmaj7,Ebmaj7&source=jazz-standards
   └─ Chord Builder shows each chord with construction details

4. User explores each chord
   ├─ Cm7: C, Eb, G, Bb (R, m3, P5, m7)
   ├─ F7: F, A, C, Eb (R, M3, P5, m7)
   └─ Understands the voice leading between chords
```

## Benefits Summary

### For Students
✅ **Clear Learning Path**: Know exactly what to practice next
✅ **Connected Understanding**: See how intervals → chords → progressions → real music
✅ **Faster Progress**: Guided practice targets specific skills
✅ **Real-World Application**: Every concept demonstrated in jazz standards
✅ **Holistic Tracking**: Understand overall musical development

### For the Platform
✅ **Increased Engagement**: Students use 3+ modules per session (vs 1-2)
✅ **Better Retention**: Connected concepts stick better
✅ **Reduced Confusion**: Consistent UX across all modules
✅ **Technical Excellence**: Shared components = less code, fewer bugs
✅ **Competitive Advantage**: No other platform offers this level of integration

### Technical Improvements
✅ **Bundle Size**: -20% (component consolidation)
✅ **Stuck Notes**: -100% (centralized audio management)
✅ **Page Load**: < 2s (optimization)
✅ **Memory Leaks**: Eliminated (proper cleanup)
✅ **Code Duplication**: Eliminated (shared utilities)

## Next Steps

1. ✅ **Analysis Complete**: Comprehensive integration analysis done
2. ✅ **Planning Complete**: Project vision, requirements, roadmap created
3. 🎯 **Next**: Run `/gsd-plan-phase 1` to create detailed execution plans
4. 🚀 **Then**: Begin Phase 1 - Shared Components Foundation
