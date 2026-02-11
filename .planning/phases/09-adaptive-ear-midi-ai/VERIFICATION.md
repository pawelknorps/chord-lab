# Phase 9 – Verification

## Success Criteria (from ROADMAP.md)

| Step | Criterion | Status |
|------|-----------|--------|
| 33 | IntervalsLevel and ChordQualitiesLevel accept MIDI input; played notes graded correctly | ✅ |
| 34 | useEarPerformanceStore exists; IntervalsLevel and ChordQualitiesLevel log attempts | ✅ |
| 35 | After 3+ mistakes on same type, next challenge repeats similar items | ✅ |
| 36 | After 3 correct streak + 70% success rate, harder variants appear | ✅ |
| 37 | getFocusAreaSuggestion returns AI suggestion; UI displays it on demand | ✅ |
| 38 | BassLevel or HarmonicContextLevel MIDI (optional) | ⏸️ Deferred |

## Manual Verification

1. **IntervalsLevel MIDI**: Connect MIDI keyboard → play root + interval → see correct/incorrect; play wrong note → see PLAYED or wrong path with hint.
2. **ChordQualitiesLevel MIDI**: Novice Triads or Advanced Sevenths + quiz mode → play chord tones → correct; wrong notes → incorrect.
3. **Performance store**: Do 3 wrong + 2 correct in Intervals → store accumulates; getProfile returns weakIntervals.
4. **Repeat on struggle**: Make 3 wrong on P4 → next challenge is P4, #4/b5, or P5 (similar).
5. **Harder when ready**: 3 correct streak + 70% rate → next challenges include m2, M7, P8.
6. **Focus button**: 5+ attempts → click Focus → see AI suggestion (or fallback if Nano off).

## Phase Goal

**Ear training accepts MIDI; curriculum adapts (repeat when struggling, harder when ready); AI suggests focus areas from error profile.** ✅
