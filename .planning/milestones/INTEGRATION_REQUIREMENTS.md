# Requirements: Cross-Module Learning Integration

## Core Infrastructure

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **CORE-INT-01** | **Unified Piano Component**: Create single `<UnifiedPiano>` component to replace all 4+ piano implementations with configurable modes (display, input, playback, highlight) | P0 | Pending | - |
| **CORE-INT-02** | **Unified Fretboard Component**: Create single `<UnifiedFretboard>` component to replace multiple fretboard implementations | P0 | Pending | - |
| **CORE-INT-03** | **Centralized Audio Manager**: Implement global `AudioManager` service that prevents stuck notes, manages instrument pool, and handles cleanup on module unmount | P0 | Pending | - |
| **CORE-INT-04** | **Shared Theory Library**: Consolidate theory utilities from all modules into `src/core/theory/` with consistent API | P1 | Pending | - |
| **CORE-INT-05** | **Global State Cleanup**: Ensure all module state is properly cleaned up on unmount to prevent memory leaks | P0 | Pending | CORE-INT-03 |
| **CORE-INT-06** | **Deep Linking System**: Implement URL parameter-based navigation to allow modules to link to specific states in other modules | P1 | Pending | - |

## Shared Components

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **COMP-01** | **UnifiedPiano Modes**: Support display-only, input, playback, and highlight modes | P0 | Pending | CORE-INT-01 |
| **COMP-02** | **UnifiedPiano Features**: Support chord highlighting, note labels, interval display, MIDI input | P0 | Pending | CORE-INT-01 |
| **COMP-03** | **UnifiedPiano Styling**: Consistent animations, hover states, and responsive sizing | P1 | Pending | CORE-INT-01 |
| **COMP-04** | **UnifiedFretboard Modes**: Support notes, intervals, scale degrees, chord tones display modes | P0 | Pending | CORE-INT-02 |
| **COMP-05** | **UnifiedFretboard Features**: Interactive vs display-only, tuning configuration, position highlighting | P1 | Pending | CORE-INT-02 |
| **COMP-06** | **Shared Settings Panel**: Consistent settings UI component used across all modules | P1 | Pending | - |
| **COMP-07** | **Shared Help Overlay**: Unified help system showing keyboard shortcuts and tips | P2 | Pending | - |

## Cross-Module Navigation

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **NAV-01** | **Send to Ear Training**: From ChordLab, send progression to Ear Training for practice | P0 | Pending | CORE-INT-06 |
| **NAV-02** | **Send to ChordLab**: From Ear Training, send progression to ChordLab for experimentation | P0 | Pending | CORE-INT-06 |
| **NAV-03** | **Send to Chord Builder**: From any module, send chord to Chord Builder for analysis | P1 | Pending | CORE-INT-06 |
| **NAV-04** | **Analyze Jazz Standard**: From Jazz Standards, analyze section in Chord Builder, Ear Training, or Tonnetz | P1 | Pending | CORE-INT-06 |
| **NAV-05** | **Recently Practiced**: Show cross-module practice history (e.g., "You practiced this in ChordLab yesterday") | P2 | Pending | - |
| **NAV-06** | **Breadcrumb Navigation**: Show learning path breadcrumbs (e.g., "Intervals → Chords → Progressions → Jazz Standards") | P2 | Pending | LEARN-01 |

## Learning Path System

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **LEARN-01** | **Skill Taxonomy**: Define comprehensive skill categories (Intervals, Chords, Progressions, Rhythm, Fretboard, Theory) | P0 | Pending | - |
| **LEARN-02** | **Prerequisite Mapping**: Map prerequisites for each exercise (e.g., must complete Intervals before Chord Tones) | P0 | Pending | LEARN-01 |
| **LEARN-03** | **Recommendation Engine**: Implement "Next Recommended" system based on current mastery level | P0 | Pending | LEARN-01, LEARN-02 |
| **LEARN-04** | **Progress Dashboard**: Create holistic dashboard showing skill development across all modules | P1 | Pending | LEARN-01, TRACK-01 |
| **LEARN-05** | **Skill Tree Visualization**: Visual representation of skill dependencies and current progress | P2 | Pending | LEARN-01, LEARN-02 |
| **LEARN-06** | **Module Locking**: Lock advanced modules until prerequisites are met (with override option) | P2 | Pending | LEARN-02 |
| **LEARN-07** | **Diagnostic Assessment**: Quick assessment to determine student's current level | P2 | Pending | LEARN-01 |

## Progress Tracking

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **TRACK-01** | **Unified Mastery Store**: Extend `useMasteryStore` to track skills across all modules | P0 | Pending | LEARN-01 |
| **TRACK-02** | **Cross-Module XP**: Award XP for exercises in any module, contributing to global level | P1 | Pending | TRACK-01 |
| **TRACK-03** | **Skill-Specific Progress**: Track mastery per skill category (not just global level) | P1 | Pending | TRACK-01, LEARN-01 |
| **TRACK-04** | **Practice History**: Store and display practice history across modules | P2 | Pending | - |
| **TRACK-05** | **Achievement System**: Unlock achievements for cross-module accomplishments | P2 | Pending | TRACK-01 |
| **TRACK-06** | **Weak Area Identification**: Automatically identify and suggest practice for weak skills | P2 | Pending | TRACK-01, LEARN-03 |

## Jazz Standards Integration

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **JAZZ-01** | **Concept Highlighting**: Highlight theory concepts in jazz standards (ii-V-I, secondary dominants, etc.) | P0 | Pending | - |
| **JAZZ-02** | **Section Analysis**: "Analyze this section" button opens relevant module with that content | P0 | Pending | NAV-04 |
| **JAZZ-03** | **Progression Extraction**: Extract progression from standard and send to Ear Training or ChordLab | P1 | Pending | NAV-01, NAV-02 |
| **JAZZ-04** | **Chord-by-Chord Analysis**: Show chord construction, intervals, and function for each chord | P1 | Pending | - |
| **JAZZ-05** | **Concept Search**: Search standards by concept (e.g., "Show me standards with modal interchange") | P2 | Pending | JAZZ-01 |
| **JAZZ-06** | **Practice Mode**: Guided practice for specific sections (play along, then solo) | P2 | Pending | - |

## Educational Enhancements

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **EDU-01** | **Learn Panels**: Add collapsible "Learn" panels to each module with theory explanations | P1 | Pending | - |
| **EDU-02** | **Visual Diagrams**: Include visual diagrams in Learn panels (interval diagrams, chord charts, etc.) | P1 | Pending | EDU-01 |
| **EDU-03** | **Audio Examples**: Include playable audio examples in Learn panels | P1 | Pending | EDU-01 |
| **EDU-04** | **Interactive Demos**: "Try it yourself" interactive demos in Learn panels | P2 | Pending | EDU-01 |
| **EDU-05** | **Guided Practice Routines**: Pre-built practice routines combining multiple modules | P2 | Pending | LEARN-01 |
| **EDU-06** | **Real-World Examples**: Show how concepts appear in actual jazz standards | P1 | Pending | JAZZ-01 |
| **EDU-07** | **Contextual Tips**: Show tips based on student's current action (e.g., "Try inverting this chord") | P2 | Pending | - |

## UI/UX Consistency

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **UX-01** | **Design System Application**: Apply consistent design tokens (colors, typography, spacing) to all modules | P0 | Pending | - |
| **UX-02** | **Keyboard Shortcuts**: Standardize keyboard shortcuts across all modules (Spacebar = Play/Pause, Esc = Close, etc.) | P1 | Pending | - |
| **UX-03** | **Settings Panel Consistency**: Use shared settings panel component in all modules | P1 | Pending | COMP-06 |
| **UX-04** | **Loading States**: Consistent loading animations and skeleton screens | P1 | Pending | - |
| **UX-05** | **Error Handling**: Consistent error messages and recovery flows | P1 | Pending | - |
| **UX-06** | **Help System**: Unified help overlay accessible from all modules | P2 | Pending | COMP-07 |
| **UX-07** | **Responsive Design**: Ensure all modules work well on tablets (iPad) | P1 | Pending | - |
| **UX-08** | **Accessibility**: Keyboard navigation, ARIA labels, screen reader support | P2 | Pending | - |

## ChordLab Integration

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **CHORD-01** | **Practice This Progression**: Send progression to Ear Training for practice | P0 | Pending | NAV-01 |
| **CHORD-02** | **Analyze Chord**: Send individual chord to Chord Builder for analysis | P1 | Pending | NAV-03 |
| **CHORD-03** | **Similar Progressions**: Suggest jazz standards with similar progressions | P2 | Pending | JAZZ-05 |
| **CHORD-04** | **Voicing Suggestions**: Suggest voicings based on completed Barry Harris exercises | P2 | Pending | - |
| **CHORD-05** | **Rhythm Integration**: Add rhythm controls from Rhythm Architect to ChordLab | P2 | Pending | - |

## Ear Training Integration

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **EAR-01** | **Build This Progression**: Send progression to ChordLab for experimentation | P0 | Pending | NAV-02 |
| **EAR-02** | **Find in Standards**: Show jazz standards containing the current progression | P1 | Pending | JAZZ-05 |
| **EAR-03** | **Analyze Chord**: Send chord to Chord Builder for construction analysis | P1 | Pending | NAV-03 |
| **EAR-04** | **Visualize on Tonnetz**: Send progression to Tonnetz for harmonic visualization | P2 | Pending | NAV-04 |
| **EAR-05** | **Fretboard View**: Show current exercise on guitar fretboard | P2 | Pending | COMP-02 |

## Chord Builder Integration

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **BUILD-01** | **Hear in Context**: Send chord to ChordLab to hear in progression | P1 | Pending | NAV-02 |
| **BUILD-02** | **Practice by Ear**: Send chord to Ear Training for aural practice | P1 | Pending | NAV-01 |
| **BUILD-03** | **Find in Standards**: Show jazz standards using this chord | P2 | Pending | JAZZ-05 |
| **BUILD-04** | **Interval Prerequisite**: Suggest Intervals (Ear Training) if student struggles | P2 | Pending | LEARN-03 |

## Rhythm Architect Integration

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **RHYTHM-01** | **Apply to Standards**: Show polyrhythms/syncopations in jazz standards | P2 | Pending | JAZZ-06 |
| **RHYTHM-02** | **ChordLab Rhythm**: Integrate rhythm controls into ChordLab | P2 | Pending | CHORD-05 |
| **RHYTHM-03** | **Rhythm in Ear Training**: Add rhythmic variation to Ear Training exercises | P2 | Pending | - |

## Performance & Technical

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **PERF-01** | **Bundle Size Reduction**: Reduce bundle size by 20%+ through component sharing | P1 | Pending | CORE-INT-01, CORE-INT-02 |
| **PERF-02** | **Page Load Time**: Ensure page load time < 2s for any module | P1 | Pending | - |
| **PERF-03** | **Audio Latency**: Maintain audio latency < 50ms | P0 | Pending | CORE-INT-03 |
| **PERF-04** | **Memory Management**: No memory leaks when switching modules | P0 | Pending | CORE-INT-05 |
| **PERF-05** | **Code Splitting**: Maintain lazy loading for all modules | P1 | Pending | - |

## Testing & Quality

| ID | Requirement | Priority | Status | Dependencies |
|----|-------------|----------|--------|--------------|
| **TEST-01** | **Audio Cleanup Tests**: Automated tests for audio cleanup on module switch | P0 | Pending | CORE-INT-03 |
| **TEST-02** | **Cross-Module Navigation Tests**: E2E tests for "Send to..." functionality | P1 | Pending | NAV-01, NAV-02, NAV-03 |
| **TEST-03** | **Component Parity Tests**: Ensure UnifiedPiano/Fretboard work in all modules | P0 | Pending | CORE-INT-01, CORE-INT-02 |
| **TEST-04** | **Learning Path Tests**: Verify prerequisite logic and recommendations | P1 | Pending | LEARN-02, LEARN-03 |
| **TEST-05** | **Performance Benchmarks**: Automated performance testing for bundle size and load time | P1 | Pending | PERF-01, PERF-02 |

---

## Requirement Summary

### By Priority
- **P0 (Critical)**: 16 requirements - Must be completed for v1
- **P1 (High)**: 31 requirements - Should be completed for v1
- **P2 (Medium)**: 24 requirements - Nice to have for v1, can defer to v2

### By Category
- **Core Infrastructure**: 6 requirements
- **Shared Components**: 7 requirements
- **Cross-Module Navigation**: 6 requirements
- **Learning Path System**: 7 requirements
- **Progress Tracking**: 6 requirements
- **Jazz Standards Integration**: 6 requirements
- **Educational Enhancements**: 7 requirements
- **UI/UX Consistency**: 8 requirements
- **Module-Specific Integrations**: 14 requirements
- **Performance & Technical**: 5 requirements
- **Testing & Quality**: 5 requirements

**Total**: 71 requirements

### Dependency Graph (High-Level)

```
CORE-INT-01, CORE-INT-02, CORE-INT-03 (Foundation)
    ↓
COMP-01 through COMP-07 (Shared Components)
    ↓
LEARN-01 (Skill Taxonomy)
    ↓
LEARN-02 (Prerequisites) + TRACK-01 (Unified Tracking)
    ↓
LEARN-03 (Recommendations) + NAV-01 through NAV-06 (Navigation)
    ↓
JAZZ-01 through JAZZ-06 (Standards Integration)
    ↓
EDU-01 through EDU-07 (Educational Enhancements)
    ↓
UX-01 through UX-08 (Consistency Polish)
```

### v1 Minimum Viable Requirements (MVP)

To launch v1, we MUST complete:
1. All P0 requirements (16)
2. Core navigation (NAV-01, NAV-02, NAV-03)
3. Basic learning path (LEARN-01, LEARN-02, LEARN-03)
4. Jazz Standards highlighting (JAZZ-01, JAZZ-02)
5. UI consistency (UX-01, UX-02, UX-04)

**MVP Total**: ~30 requirements

This provides:
- Stable, consistent foundation (no stuck notes, unified components)
- Basic cross-module navigation ("Send to..." functionality)
- Guided learning paths (prerequisites and recommendations)
- Jazz Standards integration (theory in real music)
- Consistent UX (design system, keyboard shortcuts)
