# Phase 9 Research: Mic Algorithm Upgrade (Stabilization & CREPE-Ready)

## Sources & state of the art (2026)

- **CREPE**: Kwon et al., “CREPE: A Convolutional Representation for Pitch Estimation,” 2018. Frame-level pitch from raw waveform; 360 pitch bins; often used via ONNX/WASM in browser.
- **CREPE-WASM**: Community ports (e.g. ml-crepe, crepe-wasm) run the model in Web Workers or Audio Worklet; output is typically a single pitch + optional confidence per frame. No built-in temporal smoothing.
- **Viterbi decoding**: Hidden Markov Model over discrete pitch states (e.g. 360 bins). Transition costs penalize large pitch jumps; observation costs come from CREPE’s activation. Produces the most likely pitch *path* over time, not just per-frame argmax. Best for eliminating octave jumps when full activation matrix is available.
- **Median filter**: Standard DSP for rejecting outliers without smoothing step edges; window 3–5 is a good tradeoff for ~10 ms frames.
- **Hysteresis**: Require a minimum change (e.g. 15–20 cents) before updating the reported pitch; prevents flicker between adjacent semitones due to vibrato or noise.

## Why stabilization is needed

1. **Octave jumps**: Autocorrelation and neural pitch estimators often lock onto a harmonic (e.g. 2× fundamental). Center-of-gravity (weighted mean over top bins) or Viterbi with transition costs reduces this.
2. **Flicker**: Per-frame argmax is unstable; median + hysteresis gives a “hardware tuner” feel.
3. **Low confidence**: Silent or noisy frames should not update the display; hold last stable pitch when confidence &lt; threshold.

## Architecture choices

| Approach | Pros | Cons |
|----------|------|------|
| Stabilize in Worklet | Zero main-thread cost; single source of truth | Worklet is JS only; no TS/Node deps |
| Stabilize in Hook | Can use shared TS (CrepeStabilizer); easier tests | Same SAB read; duplicate state if worklet also stabilizes |
| Viterbi in Worklet | Best path quality; no octave jumps | Needs full activation matrix from CREPE; more CPU |

**Decision**: Implement median + confidence + hysteresis in the worklet (inline or small JS). Expose same algorithm in TS (CrepeStabilizer) for tests and optional hook-side fallback. Viterbi deferred until CREPE-WASM is integrated and we have 360-bin output.

## CREPE-WASM integration (future)

- When swapping MPM for CREPE-WASM in `pitch-processor.js`, keep the same SAB layout (Float32 frequency, Float32 confidence).
- CREPE may expose confidence as max activation or entropy; map to [0, 1] for the same confidence gate (e.g. &lt; 0.85 → hold).
- If CREPE provides full activation vector, add optional “center-of-gravity” pitch = sum(prob_i * freq_i) / sum(prob_i), then feed into the same stabilizer.

## Instrument presets

- Double Bass: 30–400 Hz  
- Trumpet: 160–1100 Hz  
- Saxophone: 100–900 Hz  
- Guitar: 80–1000 Hz  
- Voice: 80–1200 Hz  

Clamping outside these ranges rejects room noise and valve/key artifacts.

## Tonal.js and quantization

- Use `Note.freq()` / frequency-to-note APIs for pitch class and cents deviation from equal temperament.
- ±10 cents: “Perfect intonation” for UI.
- ±15 cents sharp/flat over time: possible Gemini hint (“adjust mouthpiece/bridge”).

## Performance

- **SharedArrayBuffer**: One writer (worklet), one reader (main); no Atomics needed for Float32 (single-threaded writer/reader).
- **WASM SIMD**: When CREPE or median is implemented in WASM, SIMD can speed up median of 5 floats and activation dot products; document when we add WASM.
