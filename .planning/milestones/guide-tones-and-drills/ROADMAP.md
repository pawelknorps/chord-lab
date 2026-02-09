# Roadmap: Guide-Tone Visualization & ii-V-I Drill Generator

## Overview

This roadmap breaks down the implementation into **5 phases**, each building on the previous one. Total estimated time: **3-4 weeks** of focused development.

---

## Phase 1: Guide-Tone Calculation Engine (Week 1, Days 1-2)

### Objective
Build the core logic to extract 3rds and 7ths from any chord symbol using Tonal.js.

### Tasks
- [ ] **1.1** Create `GuideToneCalculator.ts` utility class
  - Input: Chord symbol (e.g., "Dm7", "G7alt", "Cmaj7#11")
  - Output: `{ third: string, seventh: string, thirdMidi: number, seventhMidi: number }`
- [ ] **1.2** Handle all chord types:
  - Major 7th, Minor 7th, Dominant 7th
  - Half-diminished, Diminished
  - Sus chords (4th instead of 3rd)
  - Altered chords (b9, #9, #11, b13)
- [ ] **1.3** Add octave calculation (place guide tones in playable range)
- [ ] **1.4** Write comprehensive test suite (`GuideToneCalculator.test.ts`)
  - Test 20+ chord types
  - Verify MIDI note numbers
  - Edge cases (slash chords, polychords)

### Success Criteria
- ✅ All chord types return correct guide tones
- ✅ Test suite passes 100%
- ✅ Guide tones are in singable/playable range (C3-C5)

### Files Created
- `src/core/theory/GuideToneCalculator.ts`
- `src/core/theory/GuideToneCalculator.test.ts`
- `src/core/theory/GuideToneTypes.ts`

---

## Phase 2: Guide-Tone Storage & Integration (Week 1, Days 3-4)

### Objective
Store guide tones for each song and integrate with the practice store.

### Tasks
- [ ] **2.1** Extend `usePracticeStore` to include guide tones
  - Add `guideTones: Map<number, GuideTone>` (measureIndex → guide tones)
  - Add `showGuideTones: boolean` toggle state
- [ ] **2.2** Calculate guide tones when song is loaded
  - Hook into existing `loadSong()` action
  - Use `GuideToneCalculator` for each chord
  - Store results in the practice store
- [ ] **2.3** Add guide-tone toggle action
  - `toggleGuideTones()` - show/hide guide tones
  - `setGuideToneMode(mode: 'off' | 'chart' | 'piano' | 'fretboard')`
- [ ] **2.4** Log guide tones to console for debugging
  - Example: `"Dm7: Third=F (65), Seventh=C (72)"`

### Success Criteria
- ✅ Guide tones calculated for all chords in "Autumn Leaves"
- ✅ Console shows correct guide tones
- ✅ Toggle state persists during playback

### Files Modified
- `src/core/store/usePracticeStore.ts`
- `src/core/theory/GuideToneCalculator.ts`

---

## Phase 3: Visual Guide-Tone Display (Week 1, Days 5-7)

### Objective
Show guide tones on the lead sheet with color-coded highlighting.

### Tasks
- [ ] **3.1** Create `GuideToneOverlay` component
  - Renders guide tones below chord symbols
  - Color coding: 🟢 Green (3rd), 🔵 Blue (7th)
  - Shows note names (e.g., "F, C")
- [ ] **3.2** Add guide-tone toggle button to JazzKiller toolbar
  - Icon: 🎯 or musical note symbol
  - Tooltip: "Show Guide Tones (3rds & 7ths)"
  - Active state styling
- [ ] **3.3** Integrate overlay into `LeadSheet.tsx`
  - Position guide tones below each chord
  - Animate/pulse current chord's guide tones
  - Responsive sizing for mobile
- [ ] **3.4** Add guide-tone legend
  - Explain color coding
  - Show example: "Cmaj7: E (3rd), B (7th)"
  - Collapsible panel

### Success Criteria
- ✅ Guide tones visible on lead sheet when mode is active
- ✅ Colors match specification (green/blue)
- ✅ Current chord's guide tones pulse/highlight
- ✅ Toggle button works smoothly

### Files Created
- `src/modules/JazzKiller/components/GuideToneOverlay.tsx`
- `src/modules/JazzKiller/components/GuideTonesLegend.tsx`

### Files Modified
- `src/modules/JazzKiller/components/LeadSheet.tsx`
- `src/modules/JazzKiller/JazzKillerModule.tsx`

---

## Phase 4: ii-V-I Pattern Database (Week 2, Days 1-3)

### Objective
Extract all ii-V-I patterns from the 1,300 jazz standards and create a searchable database.

### Tasks
- [ ] **4.1** Create `IIVIPatternDatabase` class
  - Scan all standards using existing `useJazzLibrary` hook
  - Use `ConceptAnalyzer` to detect ii-V-I patterns
  - Store patterns with metadata (song, key, measures, difficulty)
- [ ] **4.2** Implement pattern categorization
  - **Easy**: Basic ii-V-I (no alterations)
  - **Medium**: Altered V or extended chords
  - **Hard**: Complex voicings, substitutions
- [ ] **4.3** Store patterns in IndexedDB
  - Use `idb` library for async storage
  - Index by key (C, F, Bb, etc.)
  - Cache in memory for fast access
- [ ] **4.4** Create pattern query API
  - `getPatternsByKey(key: string): IIVIPattern[]`
  - `getPatternsBySong(songTitle: string): IIVIPattern[]`
  - `getAllPatterns(): IIVIPattern[]`
  - `getRandomPattern(): IIVIPattern`
- [ ] **4.5** Background scanning on app load
  - Show progress indicator: "Scanning 1,300 standards..."
  - Complete in < 5 seconds
  - Store scan timestamp to avoid re-scanning

### Success Criteria
- ✅ All ii-V-I patterns extracted from library
- ✅ Patterns stored in IndexedDB
- ✅ Query API returns correct results
- ✅ Scan completes in < 5 seconds

### Files Created
- `src/core/drills/IIVIPatternDatabase.ts`
- `src/core/drills/IIVIPatternTypes.ts`
- `src/core/drills/useIIVIDrillStore.ts` (Zustand store)

---

## Phase 5: Drill Interface & Cycle of Fifths Mode (Week 2, Days 4-7)

### Objective
Build the interactive drill dashboard with Cycle of Fifths progression.

### Tasks
- [ ] **5.1** Create `DrillDashboard` component
  - Shows current pattern (chords, key, source song)
  - Progress indicator (Pattern 3 of 12)
  - Tempo slider (60-240 BPM)
  - Loop count selector (1x, 2x, 4x, 8x, ∞)
- [ ] **5.2** Implement Cycle of Fifths mode
  - Chain ii-V-I patterns in descending fifths (C → F → Bb → ...)
  - Source patterns from different songs for variety
  - Visual: Cycle of Fifths wheel with current key highlighted
- [ ] **5.3** Add drill controls
  - **Next/Previous** pattern buttons
  - **Shuffle** button to randomize order
  - **Filter by difficulty** (Easy/Medium/Hard)
  - **Restart drill** button
- [ ] **5.4** Integrate with playback
  - Load pattern chords into Tone.Transport
  - Set loop boundaries
  - Auto-start playback when pattern loads
- [ ] **5.5** Add guide-tone visualization to drill mode
  - Show guide tones for each chord in the pattern
  - Highlight voice leading between chords
  - Display recommended scales
- [ ] **5.6** Create drill selection menu
  - **Cycle of Fifths** (all 12 keys)
  - **Single-Key Marathon** (all patterns in one key)
  - **Random Drill** (shuffle patterns)
  - **Song-Specific** (patterns from one song)

### Success Criteria
- ✅ Drill dashboard displays correctly
- ✅ Cycle of Fifths mode chains patterns smoothly
- ✅ Playback works with drill patterns
- ✅ Guide tones visible in drill mode
- ✅ All 4 drill modes functional

### Files Created
- `src/modules/JazzKiller/components/DrillDashboard.tsx`
- `src/modules/JazzKiller/components/DrillControls.tsx`
- `src/modules/JazzKiller/components/CycleOfFifthsWheel.tsx`
- `src/modules/JazzKiller/components/DrillModeSelector.tsx`

### Files Modified
- `src/modules/JazzKiller/JazzKillerModule.tsx`
- `src/core/drills/useIIVIDrillStore.ts`

---

## Phase 6: Practice Tracking & Gamification (Week 3, Days 1-3)

### Objective
Add progress tracking, achievements, and visual feedback to motivate practice.

### Tasks
- [ ] **6.1** Create `PracticeTracker` utility
  - Track patterns practiced (count, duration)
  - Track keys mastered (8+ loops = mastered)
  - Store in localStorage
  - Export/import practice data
- [ ] **6.2** Implement session stats
  - Patterns practiced: 12/144
  - Keys mastered: C, F, Bb
  - Total practice time: 45 minutes
  - Current streak: 5 days
- [ ] **6.3** Add achievements system
  - 🏆 **"Cycle Master"** - Complete all 12 keys
  - 🎯 **"Key Specialist"** - 20+ patterns in one key
  - 🔥 **"Marathon Runner"** - 100 patterns in one session
  - ⚡ **"Speed Demon"** - Complete pattern at 200+ BPM
- [ ] **6.4** Create progress visualizations
  - **Heatmap**: Color-code keys by proficiency
  - **Cycle of Fifths wheel**: Show mastered keys
  - **Timeline**: Practice history (past week/month)
- [ ] **6.5** Add practice stats panel
  - Collapsible sidebar showing stats
  - Achievement badges
  - Progress charts

### Success Criteria
- ✅ Practice data persists across sessions
- ✅ Achievements unlock correctly
- ✅ Visualizations update in real-time
- ✅ Stats panel displays accurately

### Files Created
- `src/core/drills/PracticeTracker.ts`
- `src/core/drills/AchievementSystem.ts`
- `src/modules/JazzKiller/components/PracticeStatsPanel.tsx`
- `src/modules/JazzKiller/components/ProgressHeatmap.tsx`

---

## Phase 7: Polish & Integration (Week 3, Days 4-7)

### Objective
Refine UX, fix bugs, add educational content, and integrate all features seamlessly.

### Tasks
- [ ] **7.1** Add educational content
  - Create `GuideToneTheoryPanel` component
  - Explain why 3rds and 7ths matter
  - Show voice leading examples
  - Interactive diagrams
- [ ] **7.2** Improve visual design
  - Consistent color scheme across all components
  - Smooth animations and transitions
  - Responsive layout for mobile/tablet
  - Accessibility (ARIA labels, keyboard navigation)
- [ ] **7.3** Add keyboard shortcuts
  - **G** - Toggle guide tones
  - **D** - Open drill mode
  - **N** - Next pattern
  - **P** - Previous pattern
  - **Space** - Play/pause
- [ ] **7.4** Performance optimization
  - Lazy load drill database
  - Memoize guide-tone calculations
  - Optimize re-renders
  - Reduce bundle size
- [ ] **7.5** Bug fixes and edge cases
  - Handle songs with no ii-V-I patterns
  - Handle malformed chord symbols
  - Handle very long songs (100+ measures)
  - Handle rapid mode switching
- [ ] **7.6** User testing
  - Test with 5-10 jazz students
  - Collect feedback on UX
  - Iterate on design
  - Fix reported bugs

### Success Criteria
- ✅ All features work smoothly together
- ✅ No major bugs or crashes
- ✅ Educational content is clear and helpful
- ✅ User feedback is positive (4+ stars)

### Files Created
- `src/modules/JazzKiller/components/GuideToneTheoryPanel.tsx`
- `src/modules/JazzKiller/hooks/useKeyboardShortcuts.ts`

### Files Modified
- All components (styling, accessibility, performance)

---

## Verification Checklist

### Feature 1: Guide-Tone Visualization
- [ ] Guide tones calculated correctly for all chord types
- [ ] Visual display shows 3rds (green) and 7ths (blue)
- [ ] Toggle button works in JazzKiller toolbar
- [ ] Current chord's guide tones pulse/highlight
- [ ] Legend explains color coding
- [ ] Works on mobile/tablet

### Feature 2: ii-V-I Drill Generator
- [ ] All patterns extracted from 1,300 standards
- [ ] Pattern database stored in IndexedDB
- [ ] Cycle of Fifths mode chains patterns correctly
- [ ] All 4 drill modes functional
- [ ] Playback works with drill patterns
- [ ] Guide tones visible in drill mode

### Integration
- [ ] Guide tones work in both song and drill modes
- [ ] Practice tracking persists across sessions
- [ ] Achievements unlock correctly
- [ ] All components styled consistently
- [ ] No performance issues or lag

### Documentation
- [ ] README updated with new features
- [ ] User guide created
- [ ] Code comments added
- [ ] API documentation generated

---

## Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| **Phase 1** | 2 days | Guide-Tone Calculation Engine |
| **Phase 2** | 2 days | Guide-Tone Storage & Integration |
| **Phase 3** | 3 days | Visual Guide-Tone Display |
| **Phase 4** | 3 days | ii-V-I Pattern Database |
| **Phase 5** | 4 days | Drill Interface & Cycle of Fifths |
| **Phase 6** | 3 days | Practice Tracking & Gamification |
| **Phase 7** | 4 days | Polish & Integration |
| **Total** | **21 days** | **Complete Feature Set** |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Tonal.js doesn't handle all chord types** | High | Create custom parser for edge cases |
| **IndexedDB quota exceeded** | Medium | Implement data cleanup, limit pattern storage |
| **Performance issues with 1,300 songs** | High | Background scanning, lazy loading, caching |
| **User confusion with drill modes** | Medium | Clear UI labels, onboarding tutorial |
| **Guide tones not visible on mobile** | Low | Responsive design, larger touch targets |

---

## Success Metrics

### Engagement
- **60%** of users activate Guide-Tone Mode
- **40%** of users try a drill mode
- **25%** of users complete a full Cycle of Fifths drill
- **15%** of users practice for 20+ minutes with drills

### Learning Outcomes
- Students identify guide tones with **90%+ accuracy**
- Students play guide-tone lines with **80%+ accuracy**
- **70%** of students report improved harmonic awareness

### Technical
- Guide-tone calculation: **< 100ms** per song
- Pattern database scan: **< 5 seconds**
- Drill mode loads: **< 500ms**
- Zero crashes or major bugs

---

## Next Steps

1. ✅ **Review this roadmap** - Confirm phases and timeline
2. **Plan Phase 1** - Create detailed PLAN.md for guide-tone calculation
3. **Start implementation** - Build `GuideToneCalculator.ts`
4. **Test early and often** - Write tests as you code
5. **Iterate based on feedback** - Adjust roadmap as needed

Ready to start Phase 1? 🚀
