# Roadmap: Cross-Module Learning Integration

## Overview

This roadmap outlines the 6-phase approach to transforming Chord Lab from a collection of independent modules into a unified, intelligent learning platform. Each phase builds on the previous, with clear success criteria and deliverables.

**Timeline**: 12 weeks (2-week sprints per phase)
**Approach**: Incremental delivery with continuous testing and user feedback

---

## Phase 1: Shared Components Foundation
**Duration**: Weeks 1-2  
**Goal**: Establish stable, reusable components that eliminate technical debt and improve consistency

### Objectives
- Create unified piano and fretboard components
- Implement centralized audio management
- Consolidate theory utilities
- Eliminate stuck note bugs

### Requirements
- ✅ CORE-INT-01: Unified Piano Component
- ✅ CORE-INT-02: Unified Fretboard Component
- ✅ CORE-INT-03: Centralized Audio Manager
- ✅ CORE-INT-04: Shared Theory Library
- ✅ CORE-INT-05: Global State Cleanup
- ✅ COMP-01: UnifiedPiano Modes
- ✅ COMP-02: UnifiedPiano Features
- ✅ COMP-04: UnifiedFretboard Modes
- ✅ PERF-03: Audio Latency < 50ms
- ✅ PERF-04: No Memory Leaks
- ✅ TEST-01: Audio Cleanup Tests
- ✅ TEST-03: Component Parity Tests

### Deliverables
1. **`<UnifiedPiano>` Component**
   - Location: `src/components/shared/UnifiedPiano.tsx`
   - Features: Display, input, playback, highlight modes
   - Props: `mode`, `highlightedNotes`, `onNoteClick`, `showLabels`, `showIntervals`
   - Replaces: 4+ existing piano implementations

2. **`<UnifiedFretboard>` Component**
   - Location: `src/components/shared/UnifiedFretboard.tsx`
   - Features: Notes, intervals, scale degrees, chord tones display
   - Props: `mode`, `tuning`, `highlightedNotes`, `interactive`
   - Replaces: 2+ existing fretboard implementations

3. **`AudioManager` Service**
   - Location: `src/core/services/AudioManager.ts`
   - Features: Centralized audio lifecycle, instrument pool, auto-cleanup
   - API: `playNote()`, `playChord()`, `stopAll()`, `cleanup()`
   - Prevents: Stuck notes, memory leaks, overlapping playback

4. **Shared Theory Library**
   - Location: `src/core/theory/`
   - Consolidates: Interval calculations, chord construction, scale generation
   - API: Consistent across all modules

5. **Migration Plan**
   - Document: `MIGRATION.md` - How to migrate each module to new components
   - Order: Start with ChordLab (most used), then Ear Training, then others

### Success Criteria
- [ ] All 4+ piano implementations replaced with `<UnifiedPiano>`
- [ ] All fretboard implementations replaced with `<UnifiedFretboard>`
- [ ] Zero stuck notes when switching modules (tested 100 times)
- [ ] Bundle size reduced by 10%+ (component consolidation)
- [ ] All modules use centralized `AudioManager`
- [ ] Automated tests pass for audio cleanup and component parity

### Risks & Mitigation
- **Risk**: Breaking existing functionality during migration
  - **Mitigation**: Incremental migration, one module at a time, with feature flags
- **Risk**: Performance regression from centralized audio
  - **Mitigation**: Performance benchmarks before/after, optimize as needed

---

## Phase 2: Cross-Module Infrastructure
**Duration**: Weeks 3-4  
**Goal**: Enable seamless navigation and data sharing between modules

### Objectives
- Implement deep linking system
- Create "Send to..." functionality
- Build cross-module data clipboard
- Enable URL-based navigation

### Requirements
- ✅ CORE-INT-06: Deep Linking System
- ✅ NAV-01: Send to Ear Training
- ✅ NAV-02: Send to ChordLab
- ✅ NAV-03: Send to Chord Builder
- ✅ NAV-04: Analyze Jazz Standard
- ✅ CHORD-01: Practice This Progression
- ✅ CHORD-02: Analyze Chord
- ✅ EAR-01: Build This Progression
- ✅ EAR-03: Analyze Chord
- ✅ BUILD-01: Hear in Context
- ✅ BUILD-02: Practice by Ear
- ✅ TEST-02: Cross-Module Navigation Tests

### Deliverables
1. **Deep Linking System**
   - Location: `src/core/routing/deepLinks.ts`
   - Features: URL parameter encoding/decoding for musical data
   - Format: `/ear-training?progression=ii-V-I&key=C&mode=practice`
   - Supports: Progressions, chords, keys, scales, exercises

2. **Musical Data Clipboard**
   - Location: `src/core/state/musicalClipboard.ts`
   - Features: Store/retrieve progressions, chords, scales across modules
   - API: `copyProgression()`, `pasteProgression()`, `copyChord()`, `pasteChord()`
   - Persistence: Session storage (survives page refresh)

3. **"Send to..." UI Component**
   - Location: `src/components/shared/SendToMenu.tsx`
   - Features: Dropdown menu with module options
   - Integration: Add to ChordLab, Ear Training, Chord Builder, Jazz Standards
   - UX: Icon button → dropdown → select destination → navigate with data

4. **Navigation Hooks**
   - Location: `src/hooks/useModuleNavigation.ts`
   - API: `navigateToEarTraining(data)`, `navigateToChordLab(data)`, etc.
   - Features: Type-safe navigation with musical data

5. **Jazz Standards Analysis Integration**
   - Feature: "Analyze Section" button on lead sheets
   - Options: Analyze in Chord Builder, Practice in Ear Training, Visualize in Tonnetz
   - UX: Select measures → click "Analyze" → choose destination

### Success Criteria
- [ ] Can send progression from ChordLab to Ear Training (preserves key, chords, voicing)
- [ ] Can send progression from Ear Training to ChordLab (pre-populates builder)
- [ ] Can send chord from any module to Chord Builder (shows construction)
- [ ] Can analyze jazz standard section in any relevant module
- [ ] Deep links are shareable and bookmarkable
- [ ] E2E tests pass for all navigation flows

### Risks & Mitigation
- **Risk**: Data loss during navigation
  - **Mitigation**: Comprehensive serialization tests, fallback to clipboard
- **Risk**: Complex URL parameters
  - **Mitigation**: Use base64 encoding, limit data size, show friendly error if too large

---

## Phase 3: Learning Path System
**Duration**: Weeks 5-6  
**Goal**: Guide students through progressive, connected learning

### Objectives
- Define comprehensive skill taxonomy
- Map prerequisites for all exercises
- Implement recommendation engine
- Create progress dashboard

### Requirements
- ✅ LEARN-01: Skill Taxonomy
- ✅ LEARN-02: Prerequisite Mapping
- ✅ LEARN-03: Recommendation Engine
- ✅ LEARN-04: Progress Dashboard
- ✅ TRACK-01: Unified Mastery Store
- ✅ TRACK-02: Cross-Module XP
- ✅ TRACK-03: Skill-Specific Progress
- ✅ TEST-04: Learning Path Tests

### Deliverables
1. **Skill Taxonomy**
   - Location: `src/core/learning/skillTaxonomy.ts`
   - Categories:
     - **Intervals**: Pure intervals, compound intervals
     - **Chords**: Triads, 7th chords, extensions, alterations
     - **Progressions**: Diatonic, secondary dominants, modal interchange
     - **Rhythm**: Subdivision, syncopation, polyrhythm
     - **Fretboard**: Note locations, positions, chord shapes
     - **Theory**: Functional harmony, voice leading, reharmonization
   - Structure: Hierarchical with clear progression paths

2. **Prerequisite Map**
   - Location: `src/core/learning/prerequisites.ts`
   - Format: `{ exerciseId: [prerequisiteIds], minMasteryLevel: number }`
   - Examples:
     - Chord Tones requires: Pure Intervals (mastery 70%+)
     - Progressions requires: Chord Qualities (mastery 70%+)
     - Jazz Standards requires: Progressions (mastery 60%+)
     - Secondary Dominants requires: Progressions (mastery 80%+)

3. **Recommendation Engine**
   - Location: `src/core/learning/recommendationEngine.ts`
   - Algorithm:
     1. Identify completed skills (mastery 80%+)
     2. Find unlocked exercises (prerequisites met)
     3. Prioritize by: skill gaps, learning path coherence, user preferences
     4. Return top 3 recommendations with reasoning
   - API: `getNextRecommendation()`, `getRecommendations(count)`

4. **Progress Dashboard**
   - Location: `src/pages/ProgressDashboard.tsx`
   - Features:
     - Skill category progress (radial charts)
     - Recent practice history (timeline)
     - Next recommended exercises (cards)
     - Weak areas (highlighted)
     - Overall level and XP
   - Navigation: Accessible from main dashboard

5. **Unified Mastery Store**
   - Location: `src/core/store/useMasteryStore.ts` (extend existing)
   - New Features:
     - Track mastery per skill category (not just global)
     - Store exercise completion history
     - Calculate skill-specific XP
     - Identify weak areas
   - Migration: Preserve existing global level/XP

6. **"Next Recommended" Widget**
   - Location: `src/components/widgets/NextRecommended.tsx`
   - Features: Shows 1-3 recommended exercises with reasoning
   - Integration: Add to main dashboard and module sidebars
   - UX: Card with exercise name, module, reason, "Start" button

### Success Criteria
- [ ] Skill taxonomy covers all exercises across all modules
- [ ] Prerequisites prevent students from attempting too-advanced content
- [ ] Recommendation engine suggests logical next steps
- [ ] Progress dashboard shows holistic skill development
- [ ] Students can see which skills are strong/weak
- [ ] Automated tests verify prerequisite logic

### Risks & Mitigation
- **Risk**: Overly restrictive prerequisites frustrate advanced users
  - **Mitigation**: Add "Skip Prerequisites" option in settings, show reasoning for locks
- **Risk**: Recommendation algorithm is too simplistic
  - **Mitigation**: Start simple, iterate based on user feedback, add ML later (v2)

---

## Phase 4: Jazz Standards Integration
**Duration**: Weeks 7-8  
**Goal**: Connect theory to real music through jazz standards

### Objectives
- Highlight theory concepts in standards
- Enable section-by-section analysis
- Extract progressions for practice
- Create searchable concept index

### Requirements
- ✅ JAZZ-01: Concept Highlighting
- ✅ JAZZ-02: Section Analysis
- ✅ JAZZ-03: Progression Extraction
- ✅ JAZZ-04: Chord-by-Chord Analysis
- ✅ EDU-06: Real-World Examples
- ✅ CHORD-03: Similar Progressions
- ✅ EAR-02: Find in Standards

### Deliverables
1. **Concept Annotation System**
   - Location: `src/modules/JazzKiller/annotations/`
   - Format: JSON files per standard with concept tags
   - Example:
     ```json
     {
       "standard": "Autumn Leaves",
       "annotations": [
         { "measures": [1, 2], "concept": "ii-V-I", "key": "Bb" },
         { "measures": [5, 6], "concept": "V/ii", "key": "Bb" },
         { "measures": [9, 10], "concept": "modal-interchange", "chord": "Ebm7" }
       ]
     }
     ```
   - Coverage: Annotate top 20 jazz standards

2. **Concept Highlighting UI**
   - Location: `src/modules/JazzKiller/components/ConceptHighlighter.tsx`
   - Features:
     - Toggle highlighting on/off
     - Filter by concept type (ii-V-I, secondary dominants, etc.)
     - Hover to see explanation
     - Click to analyze in detail
   - Integration: Add to lead sheet display

3. **Section Analysis Modal**
   - Location: `src/modules/JazzKiller/components/SectionAnalysis.tsx`
   - Features:
     - Select measures on lead sheet
     - Click "Analyze" → opens modal
     - Shows: Chord construction, Roman numerals, function, voice leading
     - Actions: "Practice in Ear Training", "Build in ChordLab", "Visualize in Tonnetz"
   - UX: Non-blocking modal, can analyze while playing

4. **Progression Extraction**
   - Location: `src/modules/JazzKiller/utils/progressionExtractor.ts`
   - Features:
     - Extract chord progression from selected measures
     - Normalize to Roman numerals
     - Detect key center (handle modulations)
     - Export to ChordLab or Ear Training format
   - API: `extractProgression(measures, standard)`

5. **Concept Search**
   - Location: `src/modules/JazzKiller/components/ConceptSearch.tsx`
   - Features:
     - Search standards by concept (e.g., "Show me standards with modal interchange")
     - Filter by difficulty level
     - Show matching measures in each standard
   - Integration: Add to Jazz Standards sidebar

6. **Chord-by-Chord Analysis Panel**
   - Location: `src/modules/JazzKiller/components/ChordAnalysis.tsx`
   - Features:
     - Click any chord → shows analysis panel
     - Displays: Notes, intervals, function, voice leading to next chord
     - Actions: "Build in Chord Builder", "Practice in Ear Training"
   - UX: Collapsible side panel, updates as playback progresses

### Success Criteria
- [ ] Top 20 jazz standards fully annotated with concepts
- [ ] Concept highlighting works and is visually clear
- [ ] Can analyze any section and navigate to relevant module
- [ ] Can extract progression and send to ChordLab or Ear Training
- [ ] Concept search returns accurate results
- [ ] Chord-by-chord analysis is informative and actionable

### Risks & Mitigation
- **Risk**: Annotation is time-consuming and error-prone
  - **Mitigation**: Start with top 10 standards, use semi-automated analysis, community contributions later
- **Risk**: Concept highlighting clutters the UI
  - **Mitigation**: Make it toggleable, use subtle visual cues, progressive disclosure

---

## Phase 5: Educational Enhancements
**Duration**: Weeks 9-10  
**Goal**: Add contextual learning and guided practice

### Objectives
- Add "Learn" panels to all modules
- Create guided practice routines
- Implement contextual tips
- Build interactive demos

### Requirements
- ✅ EDU-01: Learn Panels
- ✅ EDU-02: Visual Diagrams
- ✅ EDU-03: Audio Examples
- ✅ EDU-04: Interactive Demos
- ✅ EDU-05: Guided Practice Routines
- ✅ EDU-07: Contextual Tips
- ✅ NAV-05: Recently Practiced
- ✅ LEARN-05: Skill Tree Visualization

### Deliverables
1. **Learn Panel Component**
   - Location: `src/components/shared/LearnPanel.tsx`
   - Features:
     - Collapsible panel (doesn't obstruct main content)
     - Markdown support for rich text
     - Embedded audio examples (playable)
     - Visual diagrams (SVG or images)
     - Interactive demos (mini exercises)
   - Integration: Add to all modules

2. **Learn Content Library**
   - Location: `src/content/learn/`
   - Structure: Markdown files per concept
   - Examples:
     - `intervals.md`: What are intervals, how to hear them
     - `ii-V-I.md`: Functional harmony, voice leading, examples
     - `secondary-dominants.md`: Theory, application, practice tips
     - `negative-harmony.md`: Axis of symmetry, substitutions
   - Format: YAML frontmatter + Markdown content

3. **Guided Practice Routines**
   - Location: `src/pages/GuidedPractice.tsx`
   - Features:
     - Pre-built routines (e.g., "Jazz Fundamentals", "Voicing Mastery")
     - Step-by-step progression across modules
     - Timer and progress tracking
     - Automatic navigation between steps
   - Examples:
     - **Jazz Fundamentals (30 min)**:
       1. Intervals warmup (5 min)
       2. ii-V-I progressions (10 min)
       3. Analyze "Autumn Leaves" (10 min)
       4. Build your own ii-V-I (5 min)
     - **Voicing Mastery (45 min)**:
       1. Chord Tones (10 min)
       2. Drop 2 voicings (15 min)
       3. Analyze voicings (10 min)
       4. Apply to standard (10 min)

4. **Contextual Tips System**
   - Location: `src/core/tips/contextualTips.ts`
   - Features:
     - Show tips based on user action (e.g., "Try inverting this chord")
     - Triggered by: Repeated mistakes, time spent, specific patterns
     - Dismissible, non-intrusive
   - Examples:
     - ChordLab: "Try using drop 2 voicing for smoother voice leading"
     - Ear Training: "Focus on the bass note to identify the function"
     - Chord Builder: "Add the 7th to make this chord more colorful"

5. **Interactive Demos**
   - Location: `src/components/shared/InteractiveDemo.tsx`
   - Features:
     - Mini exercises within Learn panels
     - Immediate feedback
     - "Try it yourself" prompts
   - Examples:
     - Intervals: "Click two notes to hear the interval"
     - Chord Construction: "Build a Cmaj7 by clicking the notes"
     - Voice Leading: "Move this chord to the next with minimal motion"

6. **Skill Tree Visualization**
   - Location: `src/pages/SkillTree.tsx`
   - Features:
     - Visual graph of skill dependencies
     - Color-coded by mastery level (locked, in-progress, mastered)
     - Click node → see exercises for that skill
     - Shows recommended path
   - UX: Interactive SVG graph, zoomable, filterable

7. **Recently Practiced Widget**
   - Location: `src/components/widgets/RecentlyPracticed.tsx`
   - Features:
     - Shows last 5 practice sessions across modules
     - Click to resume
     - Shows progress since last session
   - Integration: Add to main dashboard

### Success Criteria
- [ ] All modules have Learn panels with relevant content
- [ ] At least 3 guided practice routines available
- [ ] Contextual tips appear at appropriate times
- [ ] Interactive demos work and are helpful
- [ ] Skill tree visualization is clear and useful
- [ ] Recently practiced widget shows accurate history

### Risks & Mitigation
- **Risk**: Content creation is time-consuming
  - **Mitigation**: Start with top 10 concepts, iterate based on usage data
- **Risk**: Tips are annoying or unhelpful
  - **Mitigation**: Make dismissible, track dismissal rate, adjust triggers

---

## Phase 6: UI/UX Consistency & Polish
**Duration**: Weeks 11-12  
**Goal**: Ensure cohesive, professional experience across all modules

### Objectives
- Apply design system to all modules
- Standardize keyboard shortcuts
- Implement consistent settings panels
- Add unified help system
- Ensure responsive design

### Requirements
- ✅ UX-01: Design System Application
- ✅ UX-02: Keyboard Shortcuts
- ✅ UX-03: Settings Panel Consistency
- ✅ UX-04: Loading States
- ✅ UX-05: Error Handling
- ✅ UX-06: Help System
- ✅ UX-07: Responsive Design
- ✅ COMP-03: UnifiedPiano Styling
- ✅ COMP-06: Shared Settings Panel
- ✅ COMP-07: Shared Help Overlay
- ✅ PERF-01: Bundle Size Reduction
- ✅ PERF-02: Page Load Time
- ✅ TEST-05: Performance Benchmarks

### Deliverables
1. **Design System Audit & Application**
   - Task: Audit all modules for design inconsistencies
   - Fix: Apply CSS variables, typography, spacing to all modules
   - Document: `DESIGN_SYSTEM.md` with guidelines
   - Coverage: All 12 modules

2. **Keyboard Shortcuts Standardization**
   - Location: `src/core/keyboard/shortcuts.ts`
   - Standard Shortcuts:
     - `Spacebar`: Play/Pause (everywhere)
     - `Esc`: Close/Cancel (everywhere)
     - `?`: Show help overlay
     - `Ctrl/Cmd + K`: Quick navigation
     - `Ctrl/Cmd + S`: Save/Export
   - Implementation: Global keyboard handler with module-specific overrides
   - Documentation: Help overlay shows shortcuts per module

3. **Shared Settings Panel**
   - Location: `src/components/shared/SettingsPanel.tsx`
   - Features:
     - Consistent layout and styling
     - Common settings: Audio (volume, reverb), MIDI (input device), Display (theme)
     - Module-specific settings (passed as children)
   - Integration: Replace custom settings panels in all modules

4. **Unified Help Overlay**
   - Location: `src/components/shared/HelpOverlay.tsx`
   - Features:
     - Keyboard shortcuts (module-specific)
     - Quick tips (module-specific)
     - Link to full documentation
     - Searchable
   - Trigger: `?` key or help icon
   - UX: Modal overlay, dismissible, remembers "don't show again"

5. **Loading States**
   - Location: `src/components/shared/LoadingState.tsx`
   - Features:
     - Skeleton screens for module loading
     - Spinner for actions (play, export, etc.)
     - Progress bars for long operations
   - Consistency: Same animation and timing across all modules

6. **Error Handling**
   - Location: `src/components/shared/ErrorBoundary.tsx` (extend existing)
   - Features:
     - Consistent error messages
     - Recovery actions (retry, reset, go back)
     - Error reporting (optional, user consent)
   - Coverage: All modules wrapped in error boundary

7. **Responsive Design Audit**
   - Task: Test all modules on tablet (iPad) and mobile
   - Fix: Ensure piano/fretboard are usable on touch screens
   - Breakpoints: Desktop (1280px+), Tablet (768px-1279px), Mobile (< 768px)
   - Priority: Desktop and Tablet (mobile is nice-to-have)

8. **Performance Optimization**
   - Bundle Size:
     - Analyze with `webpack-bundle-analyzer`
     - Remove duplicate dependencies
     - Lazy load heavy libraries
     - Target: 20%+ reduction
   - Page Load:
     - Optimize images (WebP, lazy loading)
     - Code splitting (already done, verify)
     - Preload critical resources
     - Target: < 2s for any module
   - Benchmarks:
     - Automated tests for bundle size and load time
     - Performance budgets in CI/CD

9. **Accessibility**
   - Keyboard Navigation:
     - All interactive elements focusable
     - Logical tab order
     - Focus indicators visible
   - Screen Readers:
     - ARIA labels on all controls
     - Semantic HTML
     - Alt text on images
   - Color Contrast:
     - WCAG AA compliance
     - Test with contrast checker

10. **Final Polish**
    - Animations: Smooth transitions between modules
    - Micro-interactions: Hover states, button feedback
    - Empty States: Helpful messages when no data
    - Onboarding: First-time user tutorial (optional)

### Success Criteria
- [ ] All modules use consistent design system
- [ ] Keyboard shortcuts work consistently across modules
- [ ] Settings panels are uniform and intuitive
- [ ] Help overlay is accessible and helpful
- [ ] Loading and error states are consistent
- [ ] Responsive design works on tablets
- [ ] Bundle size reduced by 20%+
- [ ] Page load time < 2s for all modules
- [ ] Accessibility audit passes (WCAG AA)

### Risks & Mitigation
- **Risk**: Design changes break existing layouts
  - **Mitigation**: Incremental updates, visual regression testing
- **Risk**: Performance optimization introduces bugs
  - **Mitigation**: Comprehensive testing, feature flags, rollback plan

---

## Success Metrics (Overall)

### User Engagement
- **Baseline**: 1.5 modules per session, 15 min avg session
- **Target**: 3+ modules per session, 25+ min avg session
- **Measurement**: Analytics tracking module visits and session duration

### Learning Outcomes
- **Baseline**: 40% completion rate for exercises
- **Target**: 60%+ completion rate with learning paths
- **Measurement**: Track exercise completion and mastery levels

### Technical Performance
- **Baseline**: 5 stuck note bugs per week, 2.5s avg load time
- **Target**: 0 stuck note bugs, < 2s avg load time
- **Measurement**: Error tracking, performance monitoring

### User Satisfaction
- **Baseline**: Unknown (no current survey)
- **Target**: 4.5/5 satisfaction score
- **Measurement**: In-app survey after 10 practice sessions

---

## Rollout Strategy

### Beta Testing (Week 10-11)
- Invite 20 beta testers (mix of beginners and advanced)
- Collect feedback on:
  - Learning path clarity
  - Cross-module navigation
  - UI consistency
  - Bug reports
- Iterate based on feedback

### Soft Launch (Week 12)
- Release to 50% of users (A/B test)
- Monitor metrics:
  - Engagement (modules per session)
  - Errors (stuck notes, crashes)
  - Performance (load time, bundle size)
- Adjust based on data

### Full Launch (Week 13)
- Release to 100% of users
- Announce new features:
  - Blog post
  - In-app notification
  - Tutorial video
- Monitor and support

---

## Post-Launch (v2 Planning)

### Deferred Features (P2 Requirements)
- Skill tree visualization (LEARN-05)
- Module locking (LEARN-06)
- Diagnostic assessment (LEARN-07)
- Recently practiced widget (NAV-05)
- Guided practice routines (EDU-05)
- Concept search (JAZZ-05)
- Rhythm integration (RHYTHM-01, RHYTHM-02, RHYTHM-03)
- Advanced analytics (TRACK-06)

### Future Enhancements
- AI-generated exercises (adaptive difficulty)
- Social features (share progressions, leaderboards)
- Teacher dashboard (assign paths, track students)
- Mobile apps (native iOS/Android)
- Video lessons (embedded tutorials)
- More jazz standards (expand library)

---

## Conclusion

This roadmap provides a clear, incremental path to transforming Chord Lab into a unified learning platform. Each phase builds on the previous, with measurable success criteria and risk mitigation strategies. By the end of Phase 6, students will have a cohesive, guided learning experience that connects theory to practice to real music.

**Next Step**: Review and approve this roadmap, then run `/gsd-plan-phase 1` to create detailed execution plans for Phase 1.
