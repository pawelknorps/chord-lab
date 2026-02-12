# Requirements: Audio Glitch Diagnosis

## REQ-GLITCH-01: Context isolation (pitch vs playback)

- **Requirement**: Pitch pipeline and playback must use different AudioContexts. Playback uses Tone's context; pitch uses the dedicated pitch context from `getPitchAudioContext()`.
- **Test**: Unit test that after setup, `getSharedAudioContext().context` and `getPitchAudioContext().context` are not the same object.
- **Rationale**: If both used the same context, worklet + analyser load on the same thread as Tone would cause glitches.

## REQ-GLITCH-02: Pitch pipeline uses dedicated context only

- **Requirement**: `createPitchPipeline(stream)` must use `getPitchAudioContext()` and must not use Tone's context.
- **Test**: Unit test that when creating the pitch pipeline, `getPitchAudioContext` is used (spy) and Tone's context is not used for the MediaStream source.
- **Rationale**: Ensures no accidental use of playback context for mic input.

## REQ-GLITCH-03: Main-thread load does not starve Tone scheduling

- **Requirement**: Heavy main-thread work (simulating multiple RAF loops and pitch reads) should not delay Tone-scheduled callbacks beyond a reasonable threshold (e.g. 2–3 frames).
- **Test**: Integration-style test: run a simulated busy loop for a short time while Tone schedules a one-shot; measure callback time; assert it fires within threshold (or document failure as evidence of main-thread contention).
- **Rationale**: If pitch + scoring RAF loops block the main thread, Tone's scheduling can be delayed and cause buffer underruns/glitches.

## REQ-GLITCH-04: Document multiple contexts and RAF loops

- **Requirement**: Document all code paths that create an AudioContext or run a requestAnimationFrame loop when mic + playback are active.
- **Deliverable**: Summary in PROJECT.md or REQUIREMENTS.md (e.g. Tone, pitch, useMicSpectrum = 3 contexts; list of RAF loops).
- **Rationale**: Helps prioritize fixes (e.g. consolidate useMicSpectrum onto pitch context or reduce RAF work).
