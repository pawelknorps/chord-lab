# Phase 14.3: SwiftF0 SOTA Precision – Research

## 1. Local Expected Value (LEV) Formula

**Spec**: \(f_{final} = 2^{\sum_{i=b-4}^{b+4} p'_i \cdot \log_2(f_i)}\) where \(p'_i\) are normalized probabilities in the 9-bin window.

**Current implementation** (`swiftF0Inference.classificationToPitch`):
- Uses raw probabilities \(p_i\) (not normalized) in the same formula: `sumLogFreq += p * Math.log2(fI)`, `totalWeight += p`, then `preciseFreq = 2^(sumLogFreq / totalWeight)`.
- Equivalence: \(\sum p_i \log_2(f_i) / \sum p_i = \sum (p_i/\sum p_j) \log_2(f_i) = \sum p'_i \log_2(f_i)\). So **current code is equivalent** to the spec (normalization is implicit in the ratio). No change required for LEV correctness.

**Bin layout**: SwiftF0 uses bins 3–134; \(f_i = 46.8 \cdot 2^{(i-3)/20}\) Hz. Regression head adds sub-cent offset per bin. LEV already uses regression-refined \(f_i\) when present.

## 2. Median Filter and Hysteresis

**Median**: CrepeStabilizer uses a circular buffer and in-place insertion sort; window size from profile (windowSize 5 or 7). Single-frame spikes and octave jumps are suppressed. **Already compliant** with REQ-SF0-P02.

**Hysteresis**: Note change only when (1) distance in semitones > hysteresisCents/100, and (2) stable for stabilityThreshold consecutive frames. Current values:
- **general**: hysteresisCents 55, stabilityThreshold 5.
- **voice**: hysteresisCents 60, stabilityThreshold 5.

**Spec**: 60¢ threshold, 3-frame stability. **Gap**: Spec asks for 3-frame stability for snappier note change; current profiles use 5. Option: add or adjust a profile (e.g. general) to use stabilityThreshold 3 to match spec, or document 5 as acceptable (more stable, slightly slower note change).

## 3. Chromatic Note and Cents

**Formula**: n = 12·log2(f/440)+69 (MIDI note 69 = A4). Note number = round(n); cents = (n − round(n))×100.

**frequencyToNote**: Uses `Note.fromMidi(midi)` (Tonal.js) which returns chromatic names (e.g. C#, Eb). centsDeviation = (n − round(n))*100. **Already compliant** with REQ-SF0-P04.

## 4. Tuner Bar UX

- **Purpose**: Show cents offset so small variation reads as vibrato, not flicker.
- **Range**: Typically ±50 cents (or ±30) is enough; beyond that display can clip or show "flat/sharp."
- **Placement**: Any screen that shows live pitch (ITM, JazzKiller, Innovative Exercises). A shared component (e.g. `TunerBar` or `CentsGauge`) fed by frequency or NoteInfo allows reuse.
- **Data**: useITMPitchStore (or equivalent) already provides frequency; main thread can call frequencyToNote(frequency) and pass centsDeviation to the tuner component.

## 5. Summary

| Area | Status | Action |
|------|--------|--------|
| LEV | Implemented correctly | Verify in Wave 1; add test or comment. |
| Median | Implemented | Confirm windowSize honored. |
| Hysteresis | 60¢ in voice; 5-frame everywhere | Optionally set stabilityThreshold 3 for general/voice. |
| Chromatic + cents | frequencyToNote correct | Audit consumers; expose cents. |
| Tuner bar | Not yet | Implement component; wire to one+ screen. |
