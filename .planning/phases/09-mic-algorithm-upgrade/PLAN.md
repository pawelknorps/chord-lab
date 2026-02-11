---
phase: 9
name: Mic Algorithm Upgrade (Stabilization & CREPE-Ready)
waves: 4
dependencies: ["Phase 1: Feedback Engine (High-Performance Ear)"]
files_modified: [
  "public/worklets/pitch-processor.js",
  "src/hooks/usePitchTracker.ts",
  "src/core/audio/PitchMemory.ts",
  "src/modules/ITM/state/useITMPitchStore.ts",
  "src/core/audio/pitchDetection.ts"
]
files_created: [
  "src/core/audio/CrepeStabilizer.ts",
  "src/core/audio/pitchStabilization.ts",
  "src/core/audio/instrumentPresets.ts",
  "src/core/audio/frequencyToNote.ts"
]
---

# Phase 9 Plan: Mic Algorithm Upgrade (Stabilization & CREPE-Ready)

Focus: Eliminate "neural jitter," octave jumps, and UI flicker in real-time pitch detection by adding state-space post-processing (median filter, confidence gate, hysteresis) inside the Audio Worklet and in the consumer hook. Architecture remains CREPE-WASM-ready; optional instrument presets and smart quantization for teaching.

**Success Criteria**:
- Raw pitch from MPM (or future CREPE-WASM) is stabilized before it reaches the UI: no octave jumps, no note flicker.
- Stabilization runs in the high-priority thread (worklet or hook with SAB read); zero main-thread pitch math where possible.
- usePitchTracker and ITM pitch store consume stabilized frequency + confidence; optional note name + cents deviation via Tonal.js.
- Optional: Jazz instrument presets (frequency clamping) and "perfect intonation" feedback (±10 cents).

---

## Problem Statement

Real-time pitch detection messiness comes from:
1. **Octave jumps**: Harmonic confusion (e.g. 2nd harmonic reported as fundamental).
2. **Flicker**: Micro-fluctuations in the estimator (MPM peaks or CREPE activation) causing note name to jump between adjacent semitones.
3. **Low-confidence frames**: Noisy or silent segments producing garbage values.

The 2026 approach: **Differentiable Post-Processing**—keep the existing detector (MPM today, CREPE-WASM when available) and add a probabilistic smoothing layer: confidence gate → running median → hysteresis.

---

## Wave 1: CrepeStabilizer & In-Worklet Stabilization

*Goal: Stabilization logic lives in one place; worklet writes stabilized pitch + confidence to SAB so all consumers get smooth values.*

- <task id="W1-T1">**CrepeStabilizer (shared logic)**  
  Create `src/core/audio/CrepeStabilizer.ts` (or `pitchStabilization.ts`) with a class or pure functions:
  - **Confidence gate**: If `confidence < 0.85`, return `lastStablePitch` (hold last good value).
  - **Running median** (window size 5): Push `rawPitch` into `pitchHistory`, keep last 5, compute median; reject outliers/octave spikes without blurring transitions.
  - **Hysteresis**: Only update `lastStablePitch` if `|centDiff| > 20` (or 15), where `centDiff = 1200 * log2(medianPitch / lastStablePitch)`. Prevents vibrato/micro-movements from flipping the displayed note.
  - API: `process(rawPitch: number, confidence: number) => { stablePitch, updated }` and/or stateful class `CrepeStabilizer` with `process(rawPitch, confidence) => number`.</task>

- <task id="W1-T2">**Integrate stabilizer into pitch-processor.js**  
  Inside `PitchProcessor.process()`, after `detectPitch(buffer)` returns `[pitch, confidence]`:
  - Run the stabilizer (reuse same algorithm; worklet must use a JS-implemented median/hysteresis—no TS import, so either inline the logic in the worklet or build a separate `pitch-processor-stabilizer.js` snippet that the worklet loads/evals; prefer inlining for simplicity).
  - Write **stabilized** `pitch` and `confidence` to `this.sharedView[0]` and `this.sharedView[1]`.
  - Ensure worklet keeps its own stabilizer state (history array, lastStablePitch) so each process() call advances the filter.</task>

- <task id="W1-T3">**Optional: Center-of-gravity (weighted argmax) in detector**  
  In `detectPitch()` (or CREPE path later), instead of taking the single highest peak, compute a weighted average of the top few bins:  
  `Pitch = sum(Probability_i * Frequency_i) / sum(Probability_i)`  
  This reduces octave jumps by favoring the "center of mass" of the activation. For MPM, consider parabolic interpolation around the peak plus a small neighborhood; for CREPE, use the 360-bin activation matrix. Document in RESEARCH.md.</task>

---

## Wave 2: usePitchTracker & Consumers Use Stabilized SAB

*Goal: Main-thread consumers only read SAB; no duplicate stabilization in React. Optionally add a second layer in the hook if worklet cannot run stabilizer (fallback).*

- <task id="W2-T1">**usePitchTracker**  
  Keep polling SAB in `requestAnimationFrame`. Read `view[0]` (frequency) and `view[1]` (confidence). If stabilizer is fully in the worklet, no extra logic; just expose `pitchRef.current = { frequency: view[0], confidence: view[1] }`. If we keep a "hook-side stabilizer" as fallback (e.g. when worklet doesn’t write stabilized values), apply `CrepeStabilizer` in the hook before writing to `pitchRef.current`. Prefer single source of truth in worklet.</task>

- <task id="W2-T2">**useITMPitchStore.getLatestPitch()**  
  Ensure it reads from the same SAB (stabilized values). No change to API; implementation continues to return `{ frequency: sharedBuffer[0], clarity: sharedBuffer[1] }` so all ITM scoring and UI use stabilized pitch.</task>

- <task id="W2-T3">**Microphone constraints for teaching**  
  In `usePitchTracker` and/or ITM store initialization, use `getUserMedia` with:
  `echoCancellation: false, noiseSuppression: false, autoGainControl: false` for jazz instrument practice (per user spec), so the detector sees raw instrument signal. Document tradeoff (noise vs purity) in PLAN or RESEARCH.</task>

---

## Wave 3: Smart Frequency-to-Note Quantization & Perfect Intonation

*Goal: Teaching machine outputs note names and cents deviation; optional "perfect intonation" visual and future Gemini hint for tuning.*

- <task id="W3-T1">**frequencyToNote utility**  
  Create `src/core/audio/frequencyToNote.ts`: given `frequency: number`, use Tonal.js (e.g. `Note.freq()` or equivalent) to get:
  - `noteName` (e.g. "F#4")
  - `pitchClass` (e.g. "F#")
  - `centsDeviation` from equal temperament (e.g. +12 cents sharp).
  Return `{ noteName, pitchClass, centsDeviation, frequency }`.</task>

- <task id="W3-T2">**Perfect intonation feedback**  
  If `|centsDeviation| <= 10`, consider "perfect intonation" for UI (e.g. green indicator or badge). Expose this in the hook or store so components can show "Perfect Intonation" when student is within ±10 cents of target.</task>

- <task id="W3-T3">**Optional: Gemini hint for consistent sharp/flat**  
  If pitch is consistently sharp (e.g. average +15 cents over last N seconds), store a flag or message that Gemini Nano can use: e.g. "Your tuning is sharp today—adjust your mouthpiece/bridge." Defer to a later phase if not in scope; document in REQUIREMENTS.</task>

---

## Wave 4: Jazz Instrument Presets & Verification

*Goal: Optional frequency clamping per instrument to reject impossible values; tests and docs.*

- <task id="W4-T1">**Instrument presets**  
  Create `src/core/audio/instrumentPresets.ts`: define presets with `minHz` and `maxHz`, e.g.:
  - Double Bass: 30–400
  - Trumpet: 160–1100
  - Saxophone: 100–900
  - Guitar: 80–1000
  - Voice: 80–1200  
  Expose `clampFrequency(frequency: number, presetId: string): number`. In worklet or hook, after stabilization, clamp to the selected preset (user chooses instrument in settings or we default to "auto").</task>

- <task id="W4-T2">**Wire presets into worklet or hook**  
  Pass preset id (or min/max) via `processorOptions` to the worklet so it can clamp before writing to SAB; or clamp in the hook after reading. Prefer worklet so impossible values never reach the UI.</task>

- <task id="W4-T3">**Tests**  
  Add unit tests for: CrepeStabilizer (confidence gate, median, hysteresis); frequencyToNote (known frequencies → expected note + cents); instrumentPresets (clamp).</task>

- <task id="W4-T4">**Docs & verification checklist**  
  Update STATE.md and phase SUMMARY.md. Verification: UI no longer flickers on sustained notes; octave jumps are suppressed; confidence &lt; 0.85 holds last pitch; ±10 cents shows perfect intonation when applicable.</task>

---

## Implementation Notes

### Stabilization (recap)

1. **Confidence gate**: `if (confidence < 0.85) return lastStablePitch`.
2. **Running median**: window 5, sort, take middle; rejects spikes.
3. **Hysteresis**: update `lastStablePitch` only if `|centDiff| > 20` (or 15).

### Why 2026-fast

- **Zero main-thread work**: Stabilization in Audio Worklet; React only reads SAB (or one read per rAF).
- **SharedArrayBuffer**: Single writer (worklet), single reader (main); no postMessage.
- **WASM SIMD** (future): When CREPE-WASM is used, median over 5 floats can be SIMD-accelerated; document in RESEARCH.

### Viterbi (optional future)

A full Viterbi decoder over CREPE’s 360-bin activation matrix would enforce "physical" pitch paths (no 3-octave jump in 10 ms). For this phase, hysteresis + median is sufficient; document Viterbi as Phase 9+ enhancement in RESEARCH.md.

---

## Verification

- [ ] CrepeStabilizer: low confidence returns last stable; median rejects single-frame spikes; hysteresis prevents sub-20-cent flicker.
- [ ] Worklet writes stabilized pitch and confidence to SAB; usePitchTracker and useITMPitchStore read smooth values.
- [ ] frequencyToNote returns note name and cents deviation; ±10 cents triggers "perfect intonation" where wired.
- [ ] Instrument presets clamp frequency when selected; tests pass.
- [ ] No regression: existing ITM scoring and heatmap still work with stabilized pitch.
