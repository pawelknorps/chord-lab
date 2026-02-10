# Research: ChordLab Piano Click — No Sound

## What We Need to Know to Debug This Well

### Current Architecture (from codebase)

1. **Click path**
   - `UnifiedPiano` → `handleKeyClick(note)` → `Tone.start()` then `onNoteClick(note)`.
   - `ChordLabDashboard` passes `onNoteToggle` as `onNoteClick` to `UnifiedPiano` and `UnifiedFretboard`.
   - `ChordLab` defines `handleNoteToggle` and passes it as `onNoteToggle`.

2. **Current ChordLab handler (as of last change)**
   - `handleNoteToggle`: calls `audioManager.initialize().then(() => audioManager.playNote(note, '8n', 0.6))` and `.catch(() => audioManager.playNote(...))`.
   - So play only happens **after** `audioManager.initialize()` resolves.

3. **AudioManager.initialize()**
   - If `Tone.context.state !== 'running'`, awaits `Tone.start()`.
   - Awaits loading piano/epiano/synth via `instrumentService.getInstrument('piano-salamander')` etc. (network).
   - Sets `initialized = true` on success; on catch sets `initPromise = null` (never sets `initialized`).

4. **AudioManager.playNote()**
   - If `initialized`: uses `instruments.get('piano')` (real piano).
   - If not initialized: uses fallback `Tone.PolySynth(Tone.Synth)` and calls `ensureInitialized()` in background.

5. **Context / startAudio()**
   - `AudioContext.tsx`: `startAudio()` does `Tone.start()` → `initGlobalAudio()` → `audioManager.initialize()`.
   - `initGlobalAudio()` (globalAudio.ts) does `await reverb.generate()` etc. — can be slow.
   - **Observed in logs**: When play was gated on `startAudio().then(...)`, the `.then()` callback **never ran** (no H3 log), so `startAudio()` was not resolving in time or at all.

### Known Evidence from Past Debug Session

- **H1, H2 present**: Piano key click reaches `handleKeyClick` and `handleNoteToggle` (note, disabled: false, mode: "input", hasOnNoteClick: true).
- **H3 absent**: `startAudio().then(...)` callback never ran.
- **H4 (playNote)**: When we switched to “play immediately” (no await), logs showed `initialized: false`, `branch: "fallback"` — so fallback synth played; real piano never used because `initialize()` had not completed (or never completed) before the next click.
- **H5**: Progression slot click reaches `handleSlotClick` with `hasChord: true`.

### Hypotheses to Test

| Id | Hypothesis | How to confirm/reject |
|----|------------|------------------------|
| A | `audioManager.initialize()` never resolves (hangs on `Tone.start()` or sample load) | Log at start and end of `initialize()`; log when `.then()` of `initialize()` runs in ChordLab. |
| B | `audioManager.initialize()` rejects (e.g. network/CORS for salamander samples) | Log in AudioManager `catch`; log in ChordLab `.catch()`; check console for CORS/network errors. |
| C | Tone context never reaches "running" when `initialize()` runs (user gesture expired) | Log `Tone.context.state` at entry of `initialize()` and after `Tone.start()`. |
| D | InstrumentService returns fallback for piano (load fails), so “piano” is actually a synth | Log in InstrumentService or AudioManager whether loaded instrument is sampler vs synth; or log after `getInstrument('piano-salamander')`. |
| E | Play path not reached (e.g. wrong branch or exception before `triggerAttackRelease`) | Log inside `playNote()` when using real instrument (branch + hasInst); log any throw. |

### Files Involved

- `src/modules/ChordLab/ChordLab.tsx` — handleNoteToggle, handleSlotClick, handleAddBuiltChord
- `src/components/shared/UnifiedPiano.tsx` — handleKeyClick, Tone.start()
- `src/context/AudioContext.tsx` — startAudio()
- `src/core/services/AudioManager.ts` — initialize(), playNote(), playChord(), getFallbackSynth()
- `src/core/services/InstrumentService.ts` — getInstrument(), loadInstrument()
- `src/core/audio/globalAudio.ts` — initAudio() (reverb etc.)

### Success Criteria for “Fixed”

- Clicking a piano key in ChordLab produces audible sound (real piano samples preferred; fallback acceptable if init fails with clear reason).
- Clicking a chord slot in the progression builder produces audible chord (real piano).
- No regression: other ChordLab behavior (building chords, progression, visuals) unchanged.
