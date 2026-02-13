# Innovative Exercises – Correct-Answer Logic Analysis

This document analyses how each Innovative Exercise defines “correct”, where it gets input from, and why most don’t react (or appear not to react) to the correct answer.

---

## 1. Input and pitch pipeline

- **ITM pitch store** (`useITMPitchStore`): singleton; filled only when **`useHighPerformancePitch(stream)`** is run with a non-null `stream`.
- **`useMicrophone()`**: app-wide; provides `stream` when mic is on (sidebar or any consumer that calls `start()`).
- **`ExerciseInputAdapter`**: when source is `'mic'` and `active` is true, it calls `startMic()` and runs **`useHighPerformancePitch(stream)`**, so it **initializes the ITM store**. It also exposes `getCurrentNote()` (from store for mic, from MIDI context for MIDI).

**Critical point:** If no component ever mounts with `useHighPerformancePitch(stream)` or `useExerciseInputAdapter(…, true)` while `stream` is set, the ITM store is never initialized and `getLatestPitch()` stays empty.

---

## 2. Exercise-by-exercise

### Ghost Note Match

| Aspect | Detail |
|--------|--------|
| **Correct answer** | Play the target note (ghost slot) within 10¢ during the short “ghost” window. |
| **Input** | Mic: `useITMPitchStore.getState().getLatestPitch()` in a 50 ms poll when `status === 'ghost_listening'`. MIDI: `getCurrentNote()` from adapter. |
| **Reaction** | On match: `setStatus('matched')`, play replacement note, UI shows “Perfect!”. |
| **Pipeline** | Uses `useExerciseInputAdapter(inputSource, adapterActive)` with `adapterActive = true` when mic ⇒ store is initialized when panel is open with Mic. |
| **Why it might not react** | (1) Ghost window is one 8th-note (~0.25 s) then auto-advances to `done`; easy to miss. (2) `MIN_CLARITY = 0.7` and 10¢ threshold may be strict. (3) Poll only runs when `status === 'ghost_listening'`; if state is stale or timing is off, match can be missed. |

So Ghost Note Match **does** react to the correct answer when the match logic runs in time; the main risks are timing and thresholds.

---

### Intonation Heatmap

| Aspect | Detail |
|--------|--------|
| **Correct answer** | N/A – passive. You play scale degrees; each is classified ET / just / out and shown in the heatmap. |
| **Input** | Only **`useITMPitchStore.getState().getLatestPitch()`** in a 80 ms interval when `droneActive`. |
| **Reaction** | No discrete “correct” moment; heatmap cells update as you play. |
| **Pipeline** | **Does not use `useHighPerformancePitch` or `useExerciseInputAdapter`.** It only reads the store. So the store is **never initialized by this panel**. If the user opens Intonation Heatmap first (or never opens another panel that initializes pitch), the store is empty ⇒ **no heatmap updates.** |

So “don’t react to correct answer” here is really “don’t react at all” when the pitch pipeline was never started – **bug: missing pitch initialization in Intonation Heatmap**.

---

### Voice Leading Maze

| Aspect | Detail |
|--------|--------|
| **Correct answer** | Play a guide tone (3rd or 7th of current chord). |
| **Input** | `useExerciseInputAdapter(inputSource, true)` ⇒ MIDI: `getCurrentNote()`; Mic: same store via **`useITMPitchStore.getState().getLatestPitch()`** in a 60 ms poll. |
| **Reaction** | On allowed pitch: `setIsMuted(false)`, `setCurrentChordIndex(i => i + 1)` ⇒ unmute and advance chord. |
| **Pipeline** | Adapter is always active when panel is mounted ⇒ store is initialized when Mic is selected. |
| **Why it might not react** | (1) `lastPitchClassRef` prevents re-firing on the same pitch class (by design). (2) Wrong chord index used in `checkNote` (e.g. `playbackChordIndexProp` vs `currentChordIndex`) could make “allowed” set wrong. (3) If user expects “correct!” feedback, there is none – only unmute + next chord. |

So Voice Leading Maze **does** react (unmute + advance); the issue can be wrong chord logic or expectation of an explicit “correct!” message.

---

### Swing Pocket

| Aspect | Detail |
|--------|--------|
| **Correct answer** | No single “correct” – you record 4 bars of 8th notes; result is swing ratio + offset. |
| **Input** | `useHighPerformancePitch(stream ?? null)` for **onset**; mic from `useMicrophone()`. MIDI uses `useMidi().lastNote` for onset timestamps. |
| **Reaction** | **Post-hoc only:** after “Stop recording”, `result` and `feedbackText` are set (e.g. “Right in the pocket!”). No real-time “correct” moment. |
| **Pipeline** | Uses `useHighPerformancePitch(stream)` ⇒ initializes store when stream is present. |

So it **does** react with feedback after recording; it’s by design not real-time.

---

### Call and Response

| Aspect | Detail |
|--------|--------|
| **Correct answer** | No single “correct” – you play the rhythm back; alignment is shown per attack (early / late / on time). |
| **Input** | `useHighPerformancePitch(stream ?? null)` for **onset**; mic from `useMicrophone()`. No MIDI path in the hook. |
| **Reaction** | **Post-hoc only:** after “Stop”, `pairs` are computed and listed (per-attack delta). No “you got it right” or “next phrase” moment. |
| **Pipeline** | Uses `useHighPerformancePitch(stream)` ⇒ store initialized when stream is set. |

So it shows feedback after recording but has no discrete “correct answer” reaction – by design.

---

### Ghost Rhythm

| Aspect | Detail |
|--------|--------|
| **Correct answer** | 3-over-4 on one note (G), in tune within 5¢, 80%+ rhythm accuracy over 4 bars. |
| **Input** | `useHighPerformancePitch(stream)` for **onset**; `useITMPitchStore(s => s.getLatestPitch)` for pitch at each onset. |
| **Reaction** | **Post-hoc only:** after “Stop recording”, `rhythmScore`, `pitchStable`, `win` are set; UI shows “You win!” when `win` is true. |
| **Pipeline** | Uses `useHighPerformancePitch(stream)` ⇒ store initialized. |

So it **does** react to “correct” with “You win!” after the run – again post-hoc.

---

## 3. Summary: why “most don’t react to the correct answer”

| Exercise | Real-time “correct” reaction? | Post-hoc feedback? | Main issue |
|----------|-------------------------------|--------------------|------------|
| Ghost Note Match | Yes (“Perfect!” + replacement note) | — | Timing/thresholds; possible missed window. |
| Intonation Heatmap | N/A (continuous heatmap) | — | **Bug: pitch pipeline never initialized by this panel** ⇒ no updates. |
| Voice Leading Maze | Yes (unmute + advance chord) | — | Possible chord-index bug; no explicit “correct!” text. |
| Swing Pocket | No | Yes (after stop) | By design post-hoc only. |
| Call and Response | No | Yes (pairs list) | By design; no “correct!” moment. |
| Ghost Rhythm | No | Yes (“You win!”) | By design post-hoc only. |

So:

1. **Intonation Heatmap** can fail to react at all because it never starts the pitch pipeline.
2. **Ghost Note Match** and **Voice Leading Maze** do react when conditions are met; issues are likely timing, thresholds, or chord logic.
3. **Swing Pocket**, **Call and Response**, and **Ghost Rhythm** only “react” after you stop; they don’t have a real-time “correct answer” moment by design.

---

## 4. Recommended fixes

1. **Intonation Heatmap – ensure pitch is available**  
   When the heatmap is active and drone is on, the panel (or its hook) must ensure the ITM pitch pipeline is running. For example:
   - In `useIntonationHeatmap`: when `droneActive` is true, use `useMicrophone()` and `useHighPerformancePitch(stream ?? null)` in that hook so the store is initialized and updated while the user is on that panel.
   - Alternatively, ensure the parent Innovative Exercises screen initializes the pitch pipeline once when “Mic On” is used (e.g. one place that calls `useHighPerformancePitch(stream)` when the module’s mic is on), so any panel that only reads the store still gets data.

2. **Ghost Note Match**  
   - Consider slightly longer ghost window or configurable duration.  
   - Optionally relax `MIN_CLARITY` or 10¢ threshold for testing, or surface “close” feedback.

3. **Voice Leading Maze**  
   - Add an explicit “Correct!” or “Guide tone!” feedback when an allowed pitch is detected.  
   - Double-check `effectiveChordIndex` / `currentChordIndex` / `playbackChordIndexProp` in `checkNote` so the allowed set always matches the chord the user hears.

4. **Post-hoc exercises (Swing Pocket, Call and Response, Ghost Rhythm)**  
   - If you want a “correct” reaction: e.g. show a clear “In the pocket!” / “Rhythm matched!” when criteria are met (some already do), or add a single “Overall: good / improve timing” line so the user sees a direct reaction to “correct” performance.

Implementing (1) is necessary for Intonation Heatmap to react at all; (2)–(4) improve clarity and perceived “reaction to correct answer” across the module.
