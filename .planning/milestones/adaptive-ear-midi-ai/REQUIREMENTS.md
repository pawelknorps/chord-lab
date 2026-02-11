# Requirements: Adaptive Ear Training with MIDI-Supported AI

## v1 Requirements

### MIDI: Universal MIDI Input in Ear Training
- **REQ-MIDI-EAR-01**: **IntervalsLevel MIDI**: Accept MIDI input as answer; when user plays a note, compare `(playedMidi - rootMidi) % 12` to correct interval semitones; grade and show feedback (MATCH / PLAYED: X).
- **REQ-MIDI-EAR-02**: **ChordQualitiesLevel MIDI**: Accept MIDI input (3+ notes) and derive chord quality; compare to correct quality; grade and show feedback.
- **REQ-MIDI-EAR-03**: **Other levels**: Extend MIDI input to BassLevel, HarmonicContextLevel (where applicable); document which levels support MIDI vs click-only.
- **REQ-MIDI-EAR-04**: **Fallback**: If no MIDI device, levels continue to work with click/selection as today.

### PERFORMANCE: Performance Heatmap & Error Profiling
- **REQ-PERF-01**: **Ear performance store**: Store per-level, per-interval (or per-quality) success/failure counts and error diagnoses (errorType, distance, isCommonConfusion from earDiagnosis).
- **REQ-PERF-02**: **Aggregate profile**: Compute session and rolling aggregates: weak intervals (low success rate), common confusions (e.g. P4 vs tritone), overshoot/undershoot tendency.
- **REQ-PERF-03**: **Persistence (optional)**: Persist performance data to localStorage for session continuity; clear on explicit "Reset progress" if offered.

### ADAPTIVE: Curriculum Adaptation Logic
- **REQ-ADAPT-01**: **Repeat on struggle**: When user makes N or more mistakes (e.g. 3) in a row or session on same type (e.g. interval), *repeat* similar items before introducing new ones.
- **REQ-ADAPT-02**: **Harder when ready**: When user achieves streak of M (e.g. 3) correct and success rate > threshold, offer harder variants (e.g. wider interval set, rarer chord qualities, less common distractors).
- **REQ-ADAPT-03**: **Configurable thresholds**: Thresholds (N, M, success rate) are tunable (e.g. in store or config) for future refinement.
- **REQ-ADAPT-04**: **Focus-area filter**: Allow filtering/suggesting challenges from weak areas (e.g. "Focus on P4 vs Tritone") based on performance profile; can be AI-suggested or rule-based.

### AI: Focus-Area Suggestions (Nano)
- **REQ-AI-FOCUS-01**: **Focus-area prompt**: Pass aggregate error profile (weak intervals, common confusions, overshoot/undershoot) to Nano via askNano; prompt: "Based on this profile, suggest 1–2 focus areas for the student. One sentence max."
- **REQ-AI-FOCUS-02**: **Display**: Show AI focus suggestion in a small panel, toast, or HUD when available (e.g. after session or on demand).
- **REQ-AI-FOCUS-03**: **Never block**: If Nano is unavailable, skip focus suggestion; do not block the exercise flow.

### INTEGRATION: Reuse Phase 7
- **REQ-INT-01**: **earDiagnosis**: Continue using diagnoseEarError for per-attempt diagnosis; extend aggregation for profiling.
- **REQ-INT-02**: **getEarHint**: Continue using getEarHint for wrong-answer hints; no change required.
- **REQ-INT-03**: **askNano**: All new Nano calls use askNano with context re-injection; no long-lived sessions.

## v2 / Deferred
- Real-time mic input for ear training (separate from Harmonic Mirror).
- Cloud-backed progress sync.
- ML-based difficulty prediction.
- Full interval/quality coverage in adaptive logic (e.g. Modulation, Secondary Dominants).

## Out of Scope
- Changing Phase 7 earDiagnosis or getEarHint behavior.
- New MIDI stack or protocol; reuse existing MidiContext.
