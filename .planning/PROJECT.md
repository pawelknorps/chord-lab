# Project Vision: Chord Lab - The Incredible Teaching Machine

## Vision Statement
To transform Chord Lab into an **Incredible Teaching Machine** that surpasses iReal Pro by moving from passive playback to active, intelligent coaching. The app will analyze jazz standards in real-time, identify practice hotspots (ii-V-I patterns, turnarounds, etc.), and provide adaptive feedback that turns hours of practice into focused, efficient learning.

## The Three Pillars

### 1. Smart Analysis (The Brain)
**Beyond Static Playback**: Use Tonal.js to perform Roman numeral analysis on any loaded standard, automatically detecting:
- Major and Minor ii-V-I progressions
- Secondary dominants and tritone substitutions
- Turnarounds and common jazz patterns
- Modal interchange and advanced harmonic concepts

**Dynamic Exercise Generation**: The app scans the 1,300+ jazz standards and creates targeted exercises:
- "Practice this ii-V-I in 12 keys"
- "Focus on the bridge of Cherokee (measures 17-24)"
- "Drill all dominant alterations in Autumn Leaves"

### 2. Adaptive Practice (The Coach)
**Focus Loops**: Automatically set Tone.Transport loop points to isolate challenging sections
- Smart BPM progression: Start at 80, auto-increment on success
- Pattern drilling: Chain together all ii-V-Is from the database
- Heatmap visualization: Color-code measures based on student performance

**Guided Routines**:
- **Bassline Mode**: Highlight roots/fifths, mute other tracks
- **Shell Voicing Mode**: Show 3rds and 7ths guide tones
- **Comping Mode**: Visual voicing suggestions with rhythm patterns
- **Scale Practice**: Context-aware scale recommendations (e.g., "G Altered over V7→Cm")

### 3. Intelligent Feedback (The Tutor)
**Performance Tracking**:
- Latency-calibrated rhythm analysis (compensate for web audio delays)
- Performance heatmap stored per song (LocalStorage)
- Progressive difficulty adjustment based on success metrics

**Visual Learning Aids**:
- Ghost playhead showing student timing vs. perfect timing
- Color-coded chord charts (Green = mastered, Red = needs work)
- Real-time scale/arpeggio overlays on fretboard/piano

## Core Value Proposition

| Feature | iReal Pro | Chord Lab 2026 |
|---------|-----------|----------------|
| **Analysis** | None (static charts) | Auto-detects ii-V-I, modulations, patterns |
| **Practice** | Manual loops only | Smart Focus Loops with auto-BPM progression |
| **Feedback** | None | Performance Heatmaps, visual timing analysis |
| **Scale Selection** | Static list | Context-aware suggestions (e.g., "Use Altered here") |
| **Audio** | General MIDI | High-quality stems with adaptive mixing |
| **Teaching** | Passive playback | Active coaching with exercise generation |

## Technical Architecture

### Theory Engine (Tonal.js)
- `@tonaljs/progression`: Roman numeral conversion
- `@tonaljs/key`: Key detection and modulation tracking  
- `@tonaljs/chord`: Chord-scale relationship mapping

### State Management (Zustand)
- `usePracticeStore`: Centralized teaching machine state
  - Current song and detected patterns
  - Active focus loops and BPM settings
  - User latency calibration
  - Performance heatmap data

### Audio Engine (Tone.js)
- Sample-accurate loop points for practice drills
- Dynamic stem mixing (mute piano for comping practice)
- BPM automation with Transport synchronization

## Out of Scope (v1)
- Real-time pitch detection (latency issues on web)
- Full rhythm game mechanics (calibration is complex)
- Social features / leaderboards
- Automatic transcription or AI solo generation

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Tonal.js for Analysis** | Industry standard, modular, minimal overhead |
| **Calibrated Latency** | Accept web audio latency but compensate via measurement |
| **Zustand Practice Store** | Decouples audio logic from React, prevents render thrashing |
| **Progressive Enhancement** | Start with pattern detection, add pitch tracking in v2 |
| **Focus on ii-V-I** | The DNA of jazz - master this, unlock everything else |
