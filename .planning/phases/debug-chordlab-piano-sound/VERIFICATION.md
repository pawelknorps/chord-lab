# Verification: Debug ChordLab Piano Sound

- **Status**: Task 1 done (instrumentation in place). Ready for Task 2 (reproduce + capture logs).
- **Last run**: —
- **Log evidence**: (paste or attach after Task 2)
- **Root cause chosen**: CONFIRMED — `audioManager.initialize()` never resolves (play was gated on `.then()` which never ran). Hypothesis A.
- **Fix applied**: Task 4 — Play no longer gated on `initialize()`. We call `audioManager.initialize()` (fire-and-forget) and `audioManager.playNote()` / `playChord()` immediately. AudioManager uses fallback synth when not initialized and real piano when initialized; init runs in background so later clicks can use real piano.
- **User confirmed sound**: Yes — works with fallback synth (Task 5 complete). Instrumentation removed.

## Task 1 instrumentation (added)

- `AudioManager.initialize()`: `[debug] AudioManager.initialize:start` + `toneContextState`; after Tone.start() `initialize:afterToneStart` + state; before `initialized = true` → `initialize:success`; in catch → `initialize:error` + message.
- `ChordLab.handleNoteToggle`: `ChordLab:beforeInitialize`; in `.then()` → `ChordLab:initializeResolved, calling playNote`; in `.catch()` → `ChordLab:initializeRejected`.
- `AudioManager.playNote()`: `usingRealInstrument` + hasInst, or `usingFallback` + hasFallback, or `catch` + error.
- All via `console.log('[debug] ...')` for reliable reproduction.
