# State: Audio Glitch Diagnosis

## Status: In progress

## Completed

- [x] Test plan and milestone docs (PROJECT.md, REQUIREMENTS.md)
- [x] REQ-GLITCH-01: Unit test — playback and pitch use different AudioContexts (`sharedAudioContext.test.ts`)
- [x] REQ-GLITCH-02: Unit test — createPitchPipeline uses getPitchAudioContext (`audioGlitchDiagnosis.test.ts`)
- [x] REQ-GLITCH-03: Integration-style test — simulated RAF load does not prevent scheduled callback (`audioGlitchDiagnosis.test.ts`)
- [x] REQ-GLITCH-04: Document multiple contexts and RAF loops (PROJECT.md)

## Test results (last run)

- `src/core/audio/sharedAudioContext.test.ts`: 2 passed
- `src/core/audio/audioGlitchDiagnosis.test.ts`: 2 passed

## Findings so far

- **Context isolation**: Design is correct — pitch uses dedicated context; unit tests confirm.
- **Main-thread**: Simulated 2ms busy work per frame still allows a 3-frame delayed callback to fire; heavier real-world load (multiple RAF loops + worklet + React) could still starve Tone — worth measuring in browser with real mic + playback.
- **Multiple contexts**: useMicSpectrum creates a third AudioContext when mic is on; combined with multiple RAF loops this is a plausible contributor to glitches.

## Next steps

- Run manual/E2E: start JazzKiller playback, turn on mic, observe glitches; disable useMicSpectrum or consolidate onto pitch context and re-test.
- Optionally add a test that starts Tone.Transport and pitch pipeline together and asserts no errors over N seconds (requires real or fully mocked Tone).
