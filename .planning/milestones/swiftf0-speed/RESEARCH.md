# SwiftF0 Speed Optimization – Research & Optimization Guide

To maximize the speed of note recognition using SwiftF0 in a React environment, optimize three areas: **Audio Preprocessing**, **Inference Configuration**, and **Thread Management**.

---

## 1. Optimized Audio Pipeline

SwiftF0 achieves its 42× speedup primarily through a **74% reduction in spectral bins**. Preprocessing must not become a bottleneck.

| Aspect | Recommendation | Rationale |
|--------|-----------------|-----------|
| **Sample rate** | Use exactly **16,000 Hz**. If your AudioContext is 44.1k or 48k, use an OfflineAudioContext or a fast linear resampler to downsample **before** the STFT. | SwiftF0 is trained at 16 kHz; matching input avoids extra work and preserves speed. |
| **Buffer strategy** | Use a **circular buffer** in an AudioWorkletProcessor. SwiftF0 requires a **frame size of 1024 samples** (\(N\)) with a **hop size of 256 samples** (\(H\)). This provides a **16 ms update rate**. | Overlap and frame size match model; circular buffer avoids allocations. |
| **STFT optimization** | Use a specialized library like **fft.js**. Do **not** calculate the full FFT; SwiftF0 only needs **bins 3 to 134** (46.875 Hz – 2093.75 Hz). Discard the rest immediately to save memory bandwidth. | Bins 3–134 cover the “Goldilocks” pitch range; computing only these reduces work. |

---

## 2. ONNX Runtime Web (ORT) Tuning

Configure the inference session to leverage hardware acceleration and parallelization.

| Feature | Setting | Impact |
|---------|---------|--------|
| **Execution provider** | `['wasm']` | Uses WebAssembly for near-native CPU speed. |
| **WASM threads** | `numThreads: 4` | Parallelizes convolutional layers (set via session options). |
| **SIMD** | Enabled | Ensure the build uses the SIMD version of ORT for vector instructions. |
| **Proxy execution** | `true` | Prevents the main thread from lagging during inference. |

**Session initialization (reference):**

```javascript
const session = await ort.InferenceSession.create('/models/swiftf0.onnx', {
  executionProviders: ['wasm'],
  graphOptimizationLevel: 'all',
  enableCpuMemArena: true,
  extra: {
    session: {
      numThreads: 4, // Optimization: matches average mobile/laptop core counts
    }
  }
});
```

---

## 3. Architecture for Minimum Latency

To prevent UI “jank” and achieve real-time note recognition, move the entire logic into a **Web Worker**.

| Component | Role |
|-----------|------|
| **AudioWorklet** | Captures raw 16 kHz audio and handles Hann windowing. |
| **SharedArrayBuffer** | Pass audio data from the Worklet to the Worker with **zero-copy** overhead. |
| **Worker** | Performs the STFT, runs `session.run()`, and calculates pitch. |
| **Note logic** | Implement a **“Note Filter”** inside the worker: |

**Note filter (inside worker):**

- **Thresholding**: Use a `confidence_threshold` (e.g. 0.9) to ignore noise.
- **Note stability**: Only emit a **“Note On”** event if the pitch remains within **50 cents** for **3 consecutive frames** (~48 ms).

---

## 4. Efficient Note Recognition Calculation

SwiftF0 outputs a \(1 \times 200\) tensor of log-spaced pitch bins. Do **not** use a simple argmax. For maximum precision without extra layers, use the **Local Expected Value**:

\[
f_{\text{Hz}} = f_{\min} \cdot 2^{\frac{\Delta \cdot \sum (i \cdot p_i)}{\sum p_i}}
\]

Where \(p_i\) are the probabilities in the bins around the peak. This gives **cents-level** precision while keeping the model’s bin count low (200 bins).

- **Implementation**: Sum over a small window around the argmax (e.g. peak ± 2 bins); use the formula above with the model’s \(f_{\min}\) and \(\Delta\) (log bin step).
- **Fallback**: If the model exposes a regression head, combine bin index with regression offset for sub-cent refinement (as in Phase 14.1).

---

## 5. Automatic Source Recognition & Adaptive Adjustment

SwiftF0 is general-purpose; it does not require retraining for different instruments. Maximize performance for **voice vs guitar vs saxophone vs trumpet** by dynamically adjusting thresholds and smoothing based on signal characteristics. Implement a **lightweight Signal Pre-Processor** before (or alongside) ONNX inference.

### 5.1 Dynamic Confidence Thresholding

Different sources have different harmonic structures and noise floors.

| Source | Confidence threshold | Rationale |
|--------|----------------------|-----------|
| **Voice** | Higher (e.g. **0.85**) | Avoid tracking breathiness and unvoiced consonants (sibilance). |
| **Guitar / Saxophone** | Lower (e.g. **0.70**) | Strong fundamental; faster attack detection. |

### 5.2 Frequency Range Masking (Post-Processing)

Filter the model output by the expected range of the source. Pitches outside the physical range are likely octave errors or noise.

| Source | Min Freq (Hz) | Max Freq (Hz) | Action |
|--------|---------------|---------------|--------|
| **Voice** | 80 | 1100 | Ignore bins &gt; 1100 Hz. |
| **Guitar** | 82 | 1000 | Ignore bins &lt; 80 Hz. |
| **Sax / Trumpet** | 140 | 1500 | Shift window higher. |

### 5.3 Automatic Source Profile (RMS / Spectral Flux / ZCR)

Identify the source type automatically **before** calling the model using simple signal metrics:

| Signal | Interpretation | Action |
|--------|----------------|--------|
| **High ZCR + Low RMS** | Percussive / noise | Disable SwiftF0 (or skip inference) to save CPU. |
| **Low ZCR + Stable RMS** | Wind instrument / sax | Apply **heavy temporal smoothing**. |
| **High Spectral Flux** | Guitar / plucked | **Reduce smoothing** to capture fast transients. |

**Implementation**: Add a **Profile Controller** in the Web Worker that updates a smoothing factor (and optionally confidence threshold and frequency mask) from RMS and ZCR (and optionally Spectral Flux) computed on the current frame or a short window.

```javascript
// Example: Adaptive smoothing logic (reference)
let smoothingFactor = 0.2; // Default

function updateProfile(rms, zcr) {
  if (zcr > 0.1) {
    // Likely voice (sibilance) or noise
    smoothingFactor = 0.5;
  } else if (rms > 0.05) {
    // Likely instrument (stronger signal)
    smoothingFactor = 0.1; // Fast tracking for clean notes
  }
}

// Apply EMA to the output frequency
finalFreq = (newFreq * (1 - smoothingFactor)) + (lastFreq * smoothingFactor);
```

### 5.4 Summary of Automated Adjustments

| Step | What to do |
|------|------------|
| **Detect energy** | Use **RMS** to decide whether to run the model (skip when very low to save CPU). |
| **Detect stability** | If input is stable (low **Spectral Flux**), increase confidence threshold for “Note On” events. |
| **Adaptive filtering** | Use a **median filter** with window size \(W\) that scales with signal type: **Wind** \(W=5\) (stable, long notes); **Guitar** \(W=3\) (fast attack, responsiveness). |

*Optional*: Add a JavaScript helper to compute **Spectral Flux** (rate of change in the spectrum) for this auto-detection.

---

## Summary: Checklist for This Phase

- [ ] **Preprocessing**: 16 kHz input; circular buffer; frame 1024, hop 256; STFT limited to bins 3–134 (or equivalent).
- [ ] **ORT**: `wasm` EP; `numThreads: 4`; SIMD build; proxy execution where applicable.
- [ ] **Architecture**: AudioWorklet → SharedArrayBuffer → Worker (STFT + inference + note filter); confidence threshold; 50¢ / 3-frame stability for Note On.
- [ ] **Pitch calculation**: Local expected value (or regression head) for cents-level precision; no plain argmax.
- [ ] **Automatic source adjustment** (v2): Profile Controller in worker; dynamic confidence (voice ≈ 0.85, guitar/sax ≈ 0.70); frequency range masking per source; RMS/ZCR/Spectral Flux → smoothing and median window (wind \(W=5\), guitar \(W=3\)); skip inference when high ZCR + low RMS.

This document feeds into `.planning/milestones/swiftf0-speed/` REQUIREMENTS and ROADMAP (e.g. REQ-SF0-S03 preprocessing, REQ-SF0-S04 scheduling, Note Filter, Local Expected Value, and automatic source profile as v2).
