# Studio Polish – Research

## Purpose

Answer: *What do I need to know to PLAN this phase well?* — so implementation of parallel compression, Air band, LUFS limiter, and 60fps Note Waterfall is grounded in the existing codebase and Web Audio constraints.

---

## 1. Current Audio Topology (globalAudio.ts)

- **Trio sum**: `pianoVol`, `bassVol`, `drumsVol` feed `trioSum` (Gain). Piano also goes to `pianoReverb`; drums go through `drumsAirBand` (high-shelf 12 kHz, **gain: 3**) into `trioSum`.
- **Parallel bus**: Already present (Phase 22). `trioSum` → **dry**: `parallelDryGain` (Gain) → `parallelSumGain`; **wet**: `compressor` or `wetPathWorklet` → `parallelSumGain`. When `proMixEnabledSignal` is true, dry gain is `PARALLEL_DRY_GAIN` (0.4); otherwise dry is 0. **Wet path has no gain node** — compressor output is at full level.
- **Worklet**: `jazz-compressor-processor.js` — accepts `processorOptions`: threshold, ratio, knee, attack, release. Currently ratio **4**, attack **0.005**. Tone fallback: ratio 4, attack 0.03.
- **Master**: `parallelSumGain` → `makeupGain` → `backingBus` → `masterBus` → `masterEQ` → `masterLimiter` (-0.5 dB ceiling) → destination.

**Gaps for Studio Polish**:
- Dry/wet is 0.4 dry / 1.0 wet when Pro Mix on; REQ wants **70/30** (0.7 dry, 0.3 wet). Need explicit dry and wet gain values and optionally a dedicated “Studio Polish” preset that sets 70/30 and 8:1.
- Compressor ratio is 4:1; REQ wants **8:1** with fast attack (≤5 ms). Worklet already has 0.005 s attack; ratio must be 8 in both worklet and Tone.Compressor.
- Drums Air is +3 dB; REQ-STUDIO-04 specifies **+2 dB** — align to 2 dB or keep 3 and document (PROJECT says +2 dB; we align to REQ).
- Master is peak limiter only; REQ wants **-14 LUFS** — see §3.

---

## 2. Note Waterfall Time Base (NoteWaterfall.tsx)

- **Animation**: `requestAnimationFrame(animate)` — so frame rate is display-refresh (typically 60fps). Good.
- **Time base**: `now = Tone.Transport.seconds` and note `startTime` set from `Tone.Transport.seconds` when the note is pushed. Scroll position is `y = age * scrollSpeed` with `age = now - note.startTime`. So **scroll position is tied to Transport time**. If Transport ticks in bursts (e.g. under load or when the main thread is busy), `Transport.seconds` can jump and the waterfall will stutter.
- **Decoupling (REQ-STUDIO-06)**: Use a **wall-clock** time for the **scroll axis** (e.g. `performance.now() / 1000` or the rAF timestamp), and keep **note list** from the same source (onNoteEvent). Notes get a `startTime` in **wall-clock seconds** when pushed; in `animate`, `now` = wall-clock; `age = now - note.startTime`. So scrolling is smooth even if Transport hiccups. Optionally keep a mapping from Transport time to wall time at note push if we need to sync to song position later; for “smooth 60fps” the requirement is that **animation time** is independent of Transport.

---

## 3. LUFS and Master Limiter (REQ-STUDIO-05)

- **Web Audio / Tone.js**: No built-in LUFS meter or “target LUFS” limiter. Tone.Limiter is a peak limiter (ceiling in dB).
- **Options**:
  - **A. Peak limiter + fixed gain**: Set input gain so that “typical” program (trio + user) hits about -14 LUFS when measured externally (e.g. browser extension or DAW). Limiter ceiling -0.5 or -1 dB to avoid clipping. No real-time LUFS in app.
  - **B. Short-term LUFS in Worklet**: Implement or reuse a simple loudness meter (e.g. K-weighting + short-term window) in an Audio Worklet; run a gain node before the limiter and adjust gain every N ms to push integrated/short-term LUFS toward -14. More work; true “auto-leveling.”
  - **C. Block-wise or integrated LUFS**: Same as B but with longer window for integrated LUFS (e.g. 400 ms or 3 s). Smoother but slower to react.

**Recommendation for Phase**: Implement **A** for v1: calibrate master gain (or limiter threshold) so that at “normal” playback level the output is approximately -14 LUFS when measured with an external meter; document the target. Optionally add a simple short-term meter (B) in a follow-up if time allows. PLAN should call out “Master limiter and gain staging so that typical program measures ~-14 LUFS (or within ~1 dB); verify with external meter or internal block-LUFS if implemented.”

---

## 4. Dependencies and File Map

| Area | Likely files | Dependencies |
|------|--------------|--------------|
| Parallel bus (70/30, 8:1) | `src/core/audio/globalAudio.ts`, `public/worklets/jazz-compressor-processor.js` | jazzSignals (proMixEnabledSignal) |
| Air band +2 dB | `src/core/audio/globalAudio.ts` | None |
| LUFS / Master | `src/core/audio/globalAudio.ts` | Optional: new worklet for loudness |
| Note Waterfall 60fps | `src/modules/JazzKiller/components/NoteWaterfall.tsx` | Tone (for layout only); band onNoteEvent |

- **Phase 22 / Trio Hi-Fi**: Studio Polish builds on the existing parallel bus and drums Air band. Changing dry/wet to 70/30 and ratio to 8:1 is additive; aligning Air to +2 dB is a parameter change. No need to block on Phase 22 completion.

---

## 5. Verification Hooks

- **Parallel**: Listen with Pro Mix (or Studio Polish) on; confirm punch (transients) and body; A/B with mix off.
- **Air**: Solo drums; confirm +2 dB @ 12 kHz (brighter ride).
- **LUFS**: Play typical trio + user; measure master output with external LUFS meter or internal block meter; target ~-14 LUFS (±1 dB).
- **Waterfall**: Run JazzKiller with waterfall; stress (e.g. many tabs, or simulated Transport jitter); confirm 60fps and no visible hitches (e.g. via FPS counter or visual inspection).

---

## Summary

- **Parallel**: Set dry gain 0.7, add wet gain 0.3; set compressor (worklet + Tone) ratio 8, attack ≤5 ms.
- **Air**: Set drums high-shelf gain to 2 dB @ 12 kHz.
- **LUFS**: Master limiter + gain staging targeting ~-14 LUFS; verify by measurement (v1: external or documented calibration).
- **Waterfall**: Drive scroll with wall-clock time (`performance.now()` / rAF); keep note list from onNoteEvent; no dependency of animation frame on `Tone.Transport.seconds`.
