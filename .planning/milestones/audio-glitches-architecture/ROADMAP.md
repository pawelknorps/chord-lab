# Audio Glitches & Architecture – Roadmap

## Phase 1: Document & Verify Current Isolation

**Goal**: Confirm worklet is light, MPM/SwiftF0 in workers, and document data flow.

- **REQ-AG-01**: Audit `pitch-processor.js`—no inference in worklet; only copy, downsample, SAB write.
- **REQ-AG-02**: Confirm MpmWorker and SwiftF0Worker own all pitch inference; document in RESEARCH.md.
- **REQ-AG-06**: Write data-flow and SAB ownership (who writes/reads pitch SAB, pcmSab; Main ↔ Worker A; async AI).

**Success**: Architecture doc exists; REQ-AG-01 and REQ-AG-02 verified by review.

---

## Phase 2: Async AI and Main-Thread Guarantees

**Goal**: Ensure Gemini Nano and main thread never block the real-time path.

- **REQ-AG-03**: Audit AI entry points (`generateStandardsExerciseAnalysis`, `generateJazzLesson`, etc.); ensure fire-and-forget or async UI (“Analyzing…”); no await of LLM on Transport/pitch path.
- **REQ-AG-04**: Document main-thread responsibilities and list heavy operations that must stay in workers.

**Success**: No blocking LLM on real-time path; doc updated.

---

## Phase 3: Latency Budget and Verification

**Goal**: Lock in &lt;10 ms budget and verify no glitches under load.

- **REQ-AG-05**: Document latency budget (worklet → worker → SAB read); reference optional SwiftF0 timing (REQ-SF0-S01) for measurement.
- **REQ-AG-07**: Manual (or automated) test: mic + playback + SwiftF0 + “Analyze performance”; no sustained dropouts; update STATE.md/VERIFICATION.md with checklist.

**Success**: Latency budget documented; glitch test passed and recorded.

---

## Phase 4: Strict Thread Audit (Glitch Defense)

**Goal**: Guarantee &lt;10 ms latency even when Gemini Nano is thinking; enforce thread boundaries with measurable criteria.

- **REQ-AG-08**: Use Chrome Performance Monitor; fail if SwiftF0 inference spikes Main Thread &gt;5 ms. Confirm SwiftF0 in Worker A (Analysis), Gemini Nano in Worker B (Pedagogy). Document audit steps and results.

**Success**: Thread ownership verified; main-thread pitch path &lt;5 ms; architecture doc updated.

---

## Phase 5: GC Hunt and Offline Resilience

**Goal**: Eliminate GC-induced stutters in audio loops; support offline use for last-used standards.

- **REQ-AG-09**: Profile memory; ensure Bass and Drum engines generate zero garbage in hot path (reuse objects/arrays). Code review and/or heap snapshot during playback.
- **REQ-AG-10**: Test app in Airplane Mode. Cache last 5 used Standards (JSON + Audio assets) in IndexedDB; document cache strategy (LRU, 5 items).

**Success**: No allocations in Bass/Drum tick path; last 5 standards load from IndexedDB when offline.

---

## Phase 6 (Optional): Guards and Regression Prevention

- Add a short “architecture checklist” in a CONTRIBUTING or .planning doc: “Before adding audio/AI work: ensure no new heavy work on audio thread; no blocking LLM on real-time path.”
- Optional: simple test that asserts worklet file does not contain `detectPitch` or `runInference` (string check).

---

## Mapping: Requirements → Phases

| REQ | Phase |
|-----|-------|
| REQ-AG-01 | 1 |
| REQ-AG-02 | 1 |
| REQ-AG-06 | 1 |
| REQ-AG-03 | 2 |
| REQ-AG-04 | 2 |
| REQ-AG-05 | 3 |
| REQ-AG-07 | 3 |
| REQ-AG-08 | 4 |
| REQ-AG-09 | 5 |
| REQ-AG-10 | 5 |
