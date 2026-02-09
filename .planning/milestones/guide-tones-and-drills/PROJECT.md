# Guide-Tone Visualization & ii-V-I Drill Generator

## Vision Statement

Transform the Teaching Machine from a **pattern detector** into an **interactive practice coach** that teaches students to hear and play the essential notes of jazz harmony. By visualizing guide tones (3rds & 7ths) and creating focused ii-V-I drills, students will develop the core skill of "playing the changes" without getting lost in scales.

## Core Value Proposition

**For intermediate jazz students** who get overwhelmed by scale choices and lose the harmonic thread, this feature provides **visual guidance on the "meat" of the harmony** (guide tones) and **targeted practice drills** extracted from real standards, so they can **internalize voice leading** and **hear chord progressions clearly**.

---

## Feature 1: Guide-Tone Visualization

### The Problem
- Students play scales but don't target chord tones
- They can't hear the harmony moving
- 3rds and 7ths define the quality and resolution of chords, but students don't prioritize them

### The Solution
**Visual guide-tone highlighting** that shows the 3rd and 7th of each chord as the playhead moves through the chart.

### Core Functionality

#### 1.1 Guide-Tone Calculation
- Use **Tonal.js** to extract the 3rd and 7th from every chord symbol
- Handle edge cases:
  - **Dominant 7ths**: 3rd (major) + 7th (minor)
  - **Major 7ths**: 3rd (major) + 7th (major)
  - **Minor 7ths**: 3rd (minor) + 7th (minor)
  - **Half-diminished**: 3rd (minor) + 7th (minor)
  - **Diminished**: 3rd (minor) + 6th (diminished 7th)
  - **Sus chords**: 4th (instead of 3rd) + 7th
- Store guide tones as MIDI note numbers for each chord

#### 1.2 Visual Display Modes

**Mode A: On-Chart Highlighting**
- Display guide tones **below the chord symbol** on the lead sheet
- Use **color coding**:
  - 🟢 **Green** = 3rd (defines major/minor quality)
  - 🔵 **Blue** = 7th (defines tension/resolution)
- Show note names (e.g., "E, B♭" for Cmaj7)
- Animate/pulse the current chord's guide tones

**Mode B: Piano Roll Overlay**
- Add a **mini piano keyboard** at the bottom of the lead sheet
- Highlight the guide tones on the keyboard as the playhead moves
- Show **voice leading** by drawing lines between guide tones of consecutive chords

**Mode C: Fretboard Overlay** (Guitar players)
- Show guide tones on a guitar fretboard diagram
- Highlight the closest positions to play them
- Show voice leading across strings

#### 1.3 Interactive Features

**Toggle Guide-Tone Mode**
- Add a button in the JazzKiller toolbar: **"Guide Tones"** 🎯
- When active:
  - Show guide tones on the chart
  - Optionally dim non-guide-tone scale degrees
  - Add a legend explaining the color coding

**Guide-Tone Playback** (Audio reinforcement)
- Add a "Play Guide Tones Only" button
- Plays just the 3rds and 7ths through the progression
- Students can hear the "skeleton" of the harmony
- Helps train their ear to hear voice leading

**Practice Exercise: "Connect the Dots"**
- Challenge: Play only the guide tones through the entire song
- Visual feedback: Highlight played notes (via MIDI input)
- Success metric: Hit 80%+ of guide tones in time
- Reward: Unlock "Guide-Tone Master" badge for that song

#### 1.4 Educational Content

**Guide-Tone Theory Panel**
- Collapsible sidebar explaining:
  - Why 3rds and 7ths matter
  - How they create voice leading
  - Examples from the current song
- Interactive diagrams showing:
  - Cmaj7 → Dm7 voice leading (B → C, E → F)
  - How guide tones resolve by half-step or stay common

---

## Feature 2: Infinite ii-V-I Drill Generator

### The Problem
- Students practice full songs but don't isolate the core harmonic pattern (ii-V-I)
- They need repetition on ii-V-I in all 12 keys
- Existing Aebersold books are static; students want variety

### The Solution
**Extract all ii-V-I patterns** from the 1,300 jazz standards library and create **dynamic practice drills** that chain them in useful sequences (e.g., Cycle of Fifths).

### Core Functionality

#### 2.1 Pattern Extraction & Database

**Scan All Standards**
- Use the existing `ConceptAnalyzer` to detect ii-V-I patterns
- Create a **pattern database**:
  ```typescript
  interface IIVIPattern {
    id: string;
    songTitle: string;
    key: string;
    chords: [string, string, string]; // [ii, V, I]
    measures: [number, number, number]; // Bar indices
    type: 'Major' | 'Minor';
    difficulty: 'Easy' | 'Medium' | 'Hard'; // Based on chord alterations
  }
  ```
- Store in **localStorage** or IndexedDB for fast access
- Index by key (C, F, Bb, etc.) for quick filtering

**Pattern Categorization**
- **Basic**: Dm7 - G7 - Cmaj7 (no alterations)
- **Intermediate**: Dm7 - G7alt - Cmaj7 (altered V)
- **Advanced**: Dm7b5 - G7#9b13 - Cm(maj7) (complex voicings)

#### 2.2 Drill Modes

**Mode 1: Cycle of Fifths Drill**
- Chain ii-V-I patterns in descending fifths:
  - C: Dm7 - G7 - Cmaj7
  - F: Gm7 - C7 - Fmaj7
  - Bb: Cm7 - F7 - Bbmaj7
  - ... (all 12 keys)
- Source patterns from **different songs** for variety
- Tempo: Start at 80 BPM, student can adjust
- Visual: Show the cycle of fifths diagram with current key highlighted

**Mode 2: Single-Key Marathon**
- Practice **all ii-V-I variations** in one key
- Example in C Major:
  1. Dm7 - G7 - Cmaj7 (from "Autumn Leaves")
  2. Dm9 - G13 - Cmaj9 (from "All The Things You Are")
  3. Dm7 - G7alt - Cmaj7#11 (from "Giant Steps")
- Helps students hear different flavors of the same progression

**Mode 3: Random Drill**
- Shuffle ii-V-I patterns from random keys
- Trains students to react quickly to key changes
- Great for sight-reading practice

**Mode 4: Song-Specific Drill**
- Extract **all ii-V-I patterns from one song**
- Example: "Autumn Leaves" has 4 ii-V-I patterns
- Loop through them in order, then shuffle
- Helps students master a specific tune

#### 2.3 Visual Drill Interface

**Drill Dashboard**
- Shows current pattern: **"ii-V-I in F Major"**
- Displays chords with guide tones highlighted
- Shows source song: **"From: All The Things You Are, bars 5-7"**
- Progress bar: **"Pattern 3 of 12"**

**Interactive Controls**
- **Tempo slider**: 60-240 BPM
- **Loop count**: 1x, 2x, 4x, 8x, ∞
- **Next/Previous** pattern buttons
- **Shuffle** button to randomize order
- **Filter by difficulty**: Easy/Medium/Hard

**Visual Aids**
- **Piano keyboard** showing guide tones
- **Roman numeral analysis**: ii - V - I
- **Scale recommendations**:
  - ii: Dorian
  - V: Mixolydian or Altered
  - I: Ionian or Lydian
- **Fretboard diagrams** (for guitarists)

#### 2.4 Practice Tracking & Gamification

**Session Stats**
- Patterns practiced: 12/144 (all keys)
- Keys mastered: C, F, Bb (8+ loops each)
- Total practice time: 45 minutes
- Current streak: 5 days

**Achievements**
- 🏆 **"Cycle Master"** - Complete all 12 keys in Cycle of Fifths mode
- 🎯 **"Key Specialist"** - Practice 20+ patterns in one key
- 🔥 **"Marathon Runner"** - 100 patterns in one session
- ⚡ **"Speed Demon"** - Complete a pattern at 200+ BPM

**Progress Visualization**
- **Heatmap**: Show which keys have been practiced (green = mastered, yellow = in progress, gray = not started)
- **Cycle of Fifths wheel**: Color-code each key based on proficiency
- **Timeline**: Show practice history over the past week/month

#### 2.5 Advanced Features

**Voice Leading Visualization**
- Draw **lines connecting guide tones** between consecutive chords
- Show smooth voice leading (half-step or common tone)
- Highlight "problem spots" where voice leading is awkward

**Backing Track Generation**
- Use existing JazzKiller stems to create backing tracks
- Automatically transpose stems to match the drill key
- Mix: Drums (100%) + Bass (70%) + Piano (30%)

**Export to Practice List**
- Save favorite patterns to a custom practice list
- Share lists with other students
- Import community-created drill sequences

---

## Enhanced Learning Experience

### Integration with Existing Features

**1. Combine with Pattern Detection**
- When a ii-V-I is detected in a song, show:
  - Guide tones for each chord
  - Link to "Practice this pattern in all 12 keys"
  - Related patterns from other songs

**2. Combine with Practice Exercise Panel**
- Add a new drill type: **"Guide-Tone Drill"**
- Exercise: Play only guide tones through the pattern
- Visual feedback: Highlight correct notes as student plays (MIDI input)

**3. Combine with Analysis Toolbar**
- Add filter: **"Show only ii-V-I patterns"**
- Highlight guide tones within those patterns
- One-click to start a drill from any detected pattern

### Progressive Learning Path

**Level 1: Awareness** (Beginner)
- **Goal**: Recognize guide tones visually
- **Exercise**: Watch guide tones highlight as the song plays
- **Success**: Can identify 3rds and 7ths by sight

**Level 2: Listening** (Intermediate)
- **Goal**: Hear guide tones in the harmony
- **Exercise**: "Guide Tones Only" playback mode
- **Success**: Can sing/hum the guide tone line

**Level 3: Playing** (Advanced)
- **Goal**: Play guide tones smoothly
- **Exercise**: "Connect the Dots" - play only guide tones
- **Success**: Hit 80%+ of guide tones in time

**Level 4: Improvising** (Expert)
- **Goal**: Use guide tones as anchor points for improvisation
- **Exercise**: Play guide tones on downbeats, improvise around them
- **Success**: Create melodic lines that outline the harmony

---

## Technical Implementation

### Phase 1: Guide-Tone Calculation
- Extend `ConceptAnalyzer` to extract guide tones
- Create `GuideToneCalculator` utility
- Store guide tones in practice store

### Phase 2: Visual Display
- Create `GuideToneOverlay` component for lead sheet
- Add toggle button to JazzKiller toolbar
- Implement color-coded note display

### Phase 3: Pattern Database
- Scan all 1,300 standards on app load (background task)
- Store patterns in IndexedDB
- Create `IIVIDrillStore` with Zustand

### Phase 4: Drill Interface
- Create `DrillDashboard` component
- Implement Cycle of Fifths mode
- Add tempo/loop controls

### Phase 5: Integration & Polish
- Connect guide tones to drill mode
- Add practice tracking
- Implement achievements

---

## Success Metrics

### User Engagement
- **50%** of users activate Guide-Tone Mode at least once
- **30%** of users complete a full Cycle of Fifths drill
- **20%** of users practice ii-V-I drills for 10+ minutes per session

### Learning Outcomes
- Students can **identify guide tones** in 90% of chords
- Students can **play guide-tone lines** with 80%+ accuracy
- Students report **improved harmonic awareness** in surveys

### Technical Performance
- Guide-tone calculation: **< 100ms** per song
- Pattern database scan: **< 5 seconds** for 1,300 songs
- Drill mode loads: **< 500ms**

---

## Out of Scope (v2 Features)

- ❌ Real-time pitch detection (microphone input)
- ❌ Automatic BPM progression based on accuracy
- ❌ Adaptive stem mixing (Aebersold modes)
- ❌ Custom drill creation UI (use presets for v1)
- ❌ Social features (sharing drills, leaderboards)
- ❌ Mobile app version (web only for v1)

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Visual-only guide tones** | Simpler than audio playback; focuses on sight-reading |
| **Use existing pattern detection** | Leverage `ConceptAnalyzer` already built |
| **IndexedDB for pattern storage** | Fast access, works offline, no backend needed |
| **Cycle of Fifths as primary drill** | Most pedagogically valuable sequence |
| **No custom drill builder in v1** | Preset modes cover 80% of use cases |
| **Tonal.js for guide-tone extraction** | Already integrated, reliable, well-documented |

---

## Next Steps

1. **Create ROADMAP.md** - Break into 5 phases
2. **Plan Phase 1** - Guide-Tone Calculation & Storage
3. **Implement** - Start with `GuideToneCalculator` utility
4. **Test** - Verify guide tones for all chord types
5. **Iterate** - Add visual display, then drill mode
