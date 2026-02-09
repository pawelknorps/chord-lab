# Project: Cross-Module Learning Integration

## Vision
Transform Chord Lab from a collection of independent music education tools into a unified, intelligent learning platform where modules seamlessly connect, guide students through progressive skill development, and demonstrate how theoretical concepts apply to real music.

## Core Value Proposition

### For Students
- **Clear Learning Paths**: Know exactly what to practice and why
- **Connected Learning**: See how intervals → chords → progressions → real songs
- **Faster Progress**: Guided practice routines targeting specific skills
- **Real-World Application**: Every concept demonstrated in actual jazz standards
- **Holistic Tracking**: Understand overall musical development, not just isolated skills

### For the Platform
- **Increased Engagement**: Students use multiple modules per session
- **Better Retention**: Connected concepts stick better than isolated facts
- **Reduced Confusion**: Consistent UX across all modules
- **Technical Excellence**: Shared components = less code, fewer bugs
- **Competitive Advantage**: No other platform offers this level of integration

## The Problem We're Solving

### Current State Issues

1. **Siloed Learning**
   - Students practice intervals in Ear Training but don't connect them to chord building
   - Progressions learned in ChordLab aren't practiced by ear
   - Jazz standards feel disconnected from theory modules
   - No clear "what should I practice next?"

2. **Technical Debt**
   - 4+ different piano implementations (inconsistent behavior)
   - Multiple fretboard components (duplicated code)
   - Audio engines per module (stuck notes, memory leaks)
   - Inconsistent MIDI handling

3. **UX Inconsistency**
   - Different keyboard shortcuts per module
   - Varying visual styles (some updated, some legacy)
   - No cross-module navigation
   - Isolated progress tracking

4. **Missed Educational Opportunities**
   - No prerequisite guidance
   - Theory without application
   - Practice without context
   - Skills without assessment

## Target Audience

### Primary: Self-Directed Jazz Students
- **Age**: 18-45
- **Level**: Intermediate (know basic theory, want to master jazz)
- **Goal**: Understand jazz harmony functionally, not just mechanically
- **Pain Point**: Overwhelmed by theory, unsure how to practice effectively
- **Motivation**: Want to improvise confidently and understand what they're hearing

### Secondary: Music Teachers
- **Use Case**: Assign specific learning paths to students
- **Need**: Track student progress across multiple skills
- **Value**: Pre-built practice routines save lesson planning time

### Tertiary: Advanced Musicians
- **Use Case**: Targeted practice on weak areas (e.g., negative harmony, polyrhythms)
- **Need**: Deep dives into specific concepts with real-world examples
- **Value**: Advanced integrations (Tonnetz, Negative Harmony) applied to standards

## Core Functionality (The ONE Thing That Must Work)

**A student can select "Learn Jazz Harmony" and be guided through a progressive, connected learning path that:**

1. **Assesses** their current level (quick diagnostic)
2. **Recommends** the next exercise across any module
3. **Teaches** the concept with theory + audio + visuals
4. **Practices** the concept in isolation (Ear Training, Chord Builder)
5. **Applies** the concept to real music (Jazz Standards)
6. **Tracks** mastery and suggests when to move forward

**Example Flow**:
- Start: "Learn ii-V-I progressions"
- Step 1: Intervals (Ear Training) - Ensure they can hear M3, P5, m7
- Step 2: Chord Tones (Ear Training) - Identify chord qualities
- Step 3: Chord Builder - Construct Dm7, G7, Cmaj7
- Step 4: Progressions (Ear Training) - Hear ii-V-I by ear
- Step 5: ChordLab - Build ii-V-I with different voicings
- Step 6: Jazz Standards - Find ii-V-I in "Autumn Leaves"
- Result: Student understands ii-V-I theoretically, aurally, and practically

## Technical Constraints

### Must Preserve
- **Lazy loading**: Modules load on demand (performance)
- **Existing audio context**: Don't break current audio setup
- **MIDI support**: All modules must continue to support MIDI input
- **Mobile responsiveness**: Must work on tablets (piano students use iPads)

### Must Improve
- **Audio cleanup**: No more stuck notes when switching modules
- **Component reuse**: Reduce bundle size by 20%+
- **State management**: Consistent patterns across modules
- **Performance**: No lag when switching between modules

### Technology Stack
- **Frontend**: React 18 + TypeScript (current)
- **Audio**: Tone.js (current)
- **State**: Zustand (current) + Signals (where needed)
- **Routing**: React Router (current)
- **Styling**: CSS Variables (current design system)
- **Build**: Vite (current)

## Scope Boundaries

### ✅ In Scope (v1)

1. **Shared Components**
   - Unified Piano component (replaces 4+ implementations)
   - Unified Fretboard component (replaces 2+ implementations)
   - Centralized Audio Manager (prevents stuck notes)
   - Shared theory utilities

2. **Cross-Module Navigation**
   - "Send to..." buttons (ChordLab → Ear Training, etc.)
   - Deep linking via URL parameters
   - "Recently practiced" cross-module history
   - Breadcrumb navigation showing learning path

3. **Learning Path System**
   - Skill taxonomy (Intervals, Chords, Progressions, etc.)
   - Prerequisite mapping (must learn X before Y)
   - "Next Recommended" engine
   - Progress dashboard showing all skills

4. **Jazz Standards Integration**
   - Highlight theory concepts in real songs
   - "Analyze this section" → opens relevant module
   - "Practice this progression" → creates Ear Training exercise
   - Chord-by-chord analysis view

5. **UI/UX Consistency**
   - Unified design system applied to all modules
   - Consistent keyboard shortcuts
   - Standardized settings panels
   - Unified help/tutorial system

### ❌ Out of Scope (v1)

1. **New Modules**: No new learning modules (focus on connecting existing)
2. **Social Features**: No sharing, no leaderboards, no multiplayer (yet)
3. **Mobile App**: Web-only (responsive, but not native)
4. **Video Lessons**: Text/audio/interactive only (no video content)
5. **AI/ML Features**: No AI-generated exercises or adaptive difficulty (yet)
6. **Notation Editing**: No full score editing (lead sheets only)
7. **Recording**: No audio recording/playback of student performance
8. **Gamification 2.0**: Keep existing XP system, don't overhaul

### 🔮 Future Considerations (v2+)

- **Adaptive Difficulty**: ML-based exercise generation
- **Social Learning**: Share progressions, compete on leaderboards
- **Teacher Dashboard**: Assign paths, track multiple students
- **Mobile Apps**: Native iOS/Android
- **Advanced Analytics**: Detailed practice insights
- **Content Expansion**: More jazz standards, more exercises
- **Video Integration**: Embedded lessons from jazz educators

## Key Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| **Unified Components First** | Biggest immediate impact on UX consistency and bundle size | Could do learning paths first, but inconsistent UX would hurt adoption |
| **Zustand for Global State** | Already in use, simple, performant | Redux (overkill), Context (performance issues), Signals (inconsistent with current patterns) |
| **URL-Based Deep Linking** | Shareable, bookmarkable, works with browser back button | Custom routing (complex), Modal-based (not shareable) |
| **Prerequisite-Based Locking** | Prevents frustration from attempting too-advanced content | Open everything (overwhelming), Recommendation-only (students ignore) |
| **Jazz Standards as "North Star"** | Real music is the ultimate goal; theory serves application | Theory-first approach (less motivating) |
| **Incremental Rollout** | Reduce risk, get feedback early | Big-bang release (risky) |
| **Keep Existing Audio Context** | Don't break what works; just add cleanup | Rewrite audio engine (too risky, too much work) |
| **Design System from Ear Training** | Already modern, clean, proven | Create new design (unnecessary work), Keep inconsistency (poor UX) |

## Success Criteria

### User Experience
- [ ] Student can complete a full learning path (Intervals → Jazz Standards) without confusion
- [ ] "Send to..." functionality works seamlessly between any two modules
- [ ] No stuck notes when switching modules (100% of the time)
- [ ] Consistent piano/fretboard behavior across all modules
- [ ] Progress dashboard shows holistic skill development

### Technical
- [ ] Bundle size reduced by 20%+ (component consolidation)
- [ ] Zero audio bugs related to module switching
- [ ] All modules use `<UnifiedPiano>` and `<UnifiedFretboard>`
- [ ] Shared theory utilities used everywhere (no duplication)
- [ ] Page load time < 2s for any module

### Educational
- [ ] Students can articulate how intervals relate to chords relate to progressions
- [ ] 80%+ of students follow recommended learning paths
- [ ] Students practice 3+ modules per session (vs 1-2 currently)
- [ ] Retention improves (measured via returning user rate)

### Business
- [ ] Session duration increases by 30%+ (more engaged)
- [ ] Return rate increases by 20%+ (better learning outcomes)
- [ ] User satisfaction score > 4.5/5 (measured via in-app survey)

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Breaking existing functionality** | High | Medium | Incremental refactoring, comprehensive testing, feature flags |
| **Overwhelming students with options** | Medium | High | Progressive disclosure, beginner mode, clear defaults |
| **Performance degradation** | High | Low | Lazy loading, code splitting, performance monitoring |
| **Scope creep** | Medium | High | Strict adherence to v1 scope, defer v2 features |
| **Audio engine complexity** | High | Medium | Centralized manager, thorough testing, fallback mechanisms |
| **User resistance to change** | Low | Medium | Optional features, gradual rollout, clear benefits communication |

## Measuring Success

### Quantitative Metrics
- **Engagement**: Avg session duration, modules per session, return rate
- **Learning**: Skill progression speed, exercise completion rate, mastery level
- **Technical**: Bundle size, page load time, error rate, audio bug count
- **Business**: User growth, retention rate, satisfaction score

### Qualitative Metrics
- **User Interviews**: "Do you understand how modules connect?"
- **Feedback Surveys**: "Is the learning path helpful?"
- **Usability Testing**: Observe students using integrated features
- **Teacher Feedback**: "Would you recommend this to students?"

### Success Thresholds
- **Minimum Viable**: Students can complete one full learning path without confusion
- **Target**: 50%+ of students use cross-module features weekly
- **Stretch**: Students report Chord Lab as "best music education platform" in surveys

## Timeline

- **Phase 1 (Weeks 1-2)**: Shared components foundation
- **Phase 2 (Weeks 3-4)**: Cross-module infrastructure
- **Phase 3 (Weeks 5-6)**: Learning path system
- **Phase 4 (Weeks 7-8)**: Educational enhancements
- **Phase 5 (Weeks 9-10)**: UI/UX consistency
- **Phase 6 (Weeks 11-12)**: Polish & testing

**Total**: 12 weeks to v1 launch

## Next Steps

1. Review and approve this project vision
2. Run `/gsd-plan-phase 1` to create detailed execution plans
3. Begin Phase 1: Shared Components Foundation
