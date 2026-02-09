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

## Feature 3: Roman Numeral Analysis & Practice Hotspots

### The Problem
- Students don't know which sections of a song are "tricky"
- They waste time practicing easy parts
- No visual indication of harmonic complexity

### The Solution
**Automatic Roman numeral analysis** that identifies "practice hotspots" - sections with complex harmony, key changes, or difficult voice leading.

### Core Functionality

#### 3.1 Roman Numeral Analysis Engine
- Use **Tonal.js** to analyze each chord in relation to the song's key
- Generate Roman numerals (I, ii, V7, etc.)
- Detect:
  - **Diatonic chords** (in-key, green highlight)
  - **Secondary dominants** (V/x, yellow highlight)
  - **Modal interchange** (borrowed chords, orange highlight)
  - **Chromatic passing** (out-of-key, red highlight)

#### 3.2 Hotspot Detection Algorithm
- **Complexity score** for each measure (0-10):
  - +2 for secondary dominants
  - +3 for altered chords (#9, b13, etc.)
  - +4 for key changes
  - +5 for tritone substitutions
  - +3 for rapid chord changes (2+ chords per bar)
- **Hotspot threshold**: Measures with score ≥ 7
- Visual: 🔥 Fire icon next to complex measures

#### 3.3 Visual Display
- Show Roman numerals **above chord symbols** on lead sheet
- Color-code by function:
  - **Green**: Tonic function (I, vi)
  - **Blue**: Subdominant (ii, IV)
  - **Red**: Dominant (V, vii°)
  - **Yellow**: Secondary dominants
- Highlight hotspots with red border

#### 3.4 Practice Recommendations
- "Focus on measures 17-20 (Bridge hotspot)"
- "This section has 3 key changes - practice slowly"
- Auto-suggest drill mode for hotspot sections

---

## Feature 4: Custom Bar Range Drill UI

### The Problem
- Students want to practice specific sections (bridge, turnaround, etc.)
- Current drill mode only works with detected patterns
- No way to isolate arbitrary bar ranges

### The Solution
**Interactive bar range selector** that lets students create custom practice loops for any section of a song.

### Core Functionality

#### 4.1 Visual Range Selector
- **Click and drag** on lead sheet to select bar range
- Visual feedback: Selected bars highlighted in blue
- Display: "Practicing bars 17-24 (Bridge)"
- Quick presets:
  - **A Section** (bars 1-8)
  - **B Section** (bars 9-16)
  - **Bridge** (auto-detect based on form)
  - **Turnaround** (last 2 bars)
  - **Full Song**

#### 4.2 Section Auto-Detection
- Parse song form from metadata (AABA, ABAC, etc.)
- Automatically identify:
  - A sections
  - B sections (bridge)
  - Intro/Outro
  - Turnarounds
  - Vamps
- One-click to practice any section

#### 4.3 Drill Controls
- **Loop count**: 1x, 2x, 4x, 8x, ∞
- **Tempo adjustment**: -50% to +50%
- **Count-in**: 0, 1, 2, or 4 bars
- **Metronome**: On/Off, volume slider
- **Save preset**: Name and save custom ranges

#### 4.4 Integration with Hotspots
- "Practice Hotspot" button on detected complex sections
- Auto-create drill for hotspot range
- Suggest starting tempo based on complexity

---

## Feature 5: Student Profile & Progress Tracking

### The Problem
- No way to track progress across multiple songs
- Students forget which songs they've practiced
- No historical data on BPM improvements

### The Solution
**Student profile system** that tracks practice history, BPM progress, and mastery levels across the entire 1,300-song library.

### Core Functionality

#### 5.1 Profile Data Structure
```typescript
interface StudentProfile {
  id: string;
  name: string;
  createdAt: Date;
  stats: {
    totalPracticeTime: number; // minutes
    songsStarted: number;
    songsMastered: number;
    patternsCompleted: number;
    currentStreak: number; // days
  };
  songProgress: Map<string, SongProgress>;
  achievements: Achievement[];
}

interface SongProgress {
  songTitle: string;
  firstPracticed: Date;
  lastPracticed: Date;
  totalTime: number; // minutes
  maxBpm: number;
  currentBpm: number;
  masteryLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastered';
  sectionsCompleted: string[]; // ['A', 'B', 'Bridge']
  hotspotsPracticed: number[];
}
```

#### 5.2 BPM Progress Tracking
- **Auto-track** BPM for each practice session
- **Chart visualization**: BPM over time for each song
- **Goal setting**: "Master 'Autumn Leaves' at 160 BPM"
- **Milestones**:
  - 🎯 First play-through (any BPM)
  - 🚀 Comfortable (100 BPM)
  - ⚡ Performance ready (140 BPM)
  - 🏆 Mastered (160+ BPM)

#### 5.3 Song Library Dashboard
- **Grid view** of all 1,300 standards
- **Color-coded** by mastery level:
  - Gray: Not started
  - Yellow: In progress
  - Green: Mastered
- **Filter/sort** by:
  - Mastery level
  - Last practiced
  - BPM achieved
  - Difficulty
  - Composer
  - Style (Bebop, Modal, etc.)
- **Search** by song title or composer

#### 5.4 Practice History
- **Calendar view**: Days practiced (GitHub-style heatmap)
- **Session log**: Date, song, duration, BPM
- **Weekly report**: Songs practiced, time spent, progress made
- **Export data**: CSV download for external analysis

#### 5.5 Recommendations Engine
- **"Practice Next"** suggestion based on:
  - Songs not practiced recently
  - Songs close to mastery (90% BPM goal)
  - Songs with similar patterns to recently mastered
- **"Challenge Mode"**: Suggest harder songs based on current level
- **"Review Mode"**: Revisit mastered songs to maintain skills

#### 5.6 Multi-Profile Support
- Create multiple profiles (e.g., "Jazz", "Bebop Focus", "Beginner")
- Switch between profiles
- Compare progress across profiles
- Share profiles (export/import JSON)

---

## Enhanced Learning Experience (Updated)

### Integration with All Features

**1. Workflow: Learning a New Song**
1. **Load song** → Roman numerals auto-display
2. **Hotspots detected** → "3 complex sections found"
3. **Click hotspot** → Auto-create drill for that range
4. **Practice drill** → Guide tones highlighted
5. **BPM tracked** → Progress saved to profile
6. **Mastery achieved** → Song turns green in library

**2. Workflow: Targeted Practice**
1. **Open song library** → Filter by "In Progress"
2. **Select song** → See last BPM (120) and goal (160)
3. **Practice hotspot** → Bridge (bars 17-24)
4. **Guide tones on** → Focus on 3rds & 7ths
5. **Complete drill** → BPM increases to 125
6. **Profile updated** → Chart shows progress

**3. Workflow: ii-V-I Mastery**
1. **Start Cycle of Fifths drill** → 12 keys
2. **Guide tones visible** → Learn voice leading
3. **Complete cycle** → Achievement unlocked
4. **Profile shows** → "ii-V-I Master" badge
5. **Recommendation** → "Try Giant Steps (uses Coltrane changes)"

---

## Out of Scope (v2 Features)

- ❌ Real-time pitch detection (microphone input)
- ❌ Automatic BPM progression based on accuracy
- ❌ Adaptive stem mixing (Aebersold modes)
- ❌ Social features (sharing drills, leaderboards)
- ❌ Mobile app version (web only for v1)
- ❌ Cloud sync for profiles (localStorage only for v1)
- ❌ AI-powered practice recommendations (rule-based only)

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Visual-only guide tones** | Simpler than audio playback; focuses on sight-reading |
| **Use existing pattern detection** | Leverage `ConceptAnalyzer` already built |
| **IndexedDB for pattern storage** | Fast access, works offline, no backend needed |
| **Cycle of Fifths as primary drill** | Most pedagogically valuable sequence |
| **No custom drill builder in v1** | Preset modes + bar range selector cover 95% of use cases |
| **Tonal.js for all theory analysis** | Already integrated, reliable, well-documented |
| **localStorage for profiles** | No backend needed, works offline, simple implementation |
| **Roman numerals above chords** | Doesn't clutter the chart, easy to toggle off |
| **Hotspot auto-detection** | Saves students time identifying difficult sections |

---

## Next Steps

1. **Create ROADMAP.md** - Break into phases (now 8 phases with new features)
2. **Plan Phase 1** - Guide-Tone Calculation & Storage
3. **Implement** - Start with `GuideToneCalculator` utility
4. **Test** - Verify guide tones for all chord types
5. **Iterate** - Add visual display, then drill mode, then profiles
