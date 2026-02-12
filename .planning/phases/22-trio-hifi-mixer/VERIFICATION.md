# Phase 22: Trio Hi-Fi Mixer – Verification

## Phase Goal (from PLAN.md)

Make JazzKiller trio playback **consistent and hi-fi** via parallel (NY) bus, soft-knee compressor, RMS-matching makeup gain, and drums Air band.

## Success Criteria

| Criterion | Status | Notes |
|-----------|--------|--------|
| **Parallel bus** (REQ-HIFI-01, REQ-HIFI-02) | ✅ | trioSum → dry Gain(0.4) + wet (compressor/worklet) → parallelSumGain → makeupGain → masterBus. Pro Mix off: dry gain 0. |
| **Soft-knee compressor** (REQ-HIFI-03, REQ-HIFI-04) | ✅ | `jazz-compressor-processor.js` worklet; ratio 4, knee 30 dB, attack 5 ms, release 150 ms. Fallback: Tone.Compressor. |
| **Trio connected to parallel mixer** (REQ-HIFI-05) | ✅ | pianoVol, bassVol, drumsVol → trioSum; trioSum feeds dry and wet. |
| **RMS measurement** (REQ-HIFI-06) | ✅ | inputMeter on trio sum, outputMeter on parallel sum; Tone.Meter normalRange. |
| **Automatic makeup gain** (REQ-HIFI-07) | ✅ | makeupGain = inputRms/outputRms, clamp 0.25–4; update every 100 ms when Pro Mix on. |
| **Pro Mix toggle** (REQ-HIFI-08) | ✅ | Mixer UI "Pro Mix" / "Mastering"; proMixEnabledSignal; when off, dry=0 and makeup=1. |
| **Drums Air band** (REQ-HIFI-09) | ✅ | drumsAirBand: Tone.Filter highshelf +3 dB @ 12 kHz; drumsVol → drumsAirBand → trioSum. |

## Regression Checks

- **Mute/solo/volume**: Unchanged; pianoVol, bassVol, drumsVol still drive getOutputVolume and connect to trio sum (and piano reverb).
- **Reverb**: pianoReverb and reverb still connect to masterLimiter.
- **Pro Mix off**: Dry gain 0; wet path only; makeup gain 1; behaviour matches pre–Phase-22 single compressor path (with trio sum feeding compressor).

## Manual Verification

1. **Pro Mix off**: Play trio; toggle Pro Mix on → fuller tone, similar perceived level (makeup active). Toggle off → no jump.
2. **Pro Mix on**: A/B dry/wet balance (attack + body); drums ride has more definition (Air band).
3. **Worklet**: If worklet loads (no console errors), wet path uses soft-knee; otherwise Tone.Compressor remains.

## Files Touched

- `src/core/audio/globalAudio.ts`: parallel bus, worklet swap, makeup gain, meters, drums Air band.
- `src/modules/JazzKiller/state/jazzSignals.ts`: proMixEnabledSignal.
- `src/modules/JazzKiller/components/Mixer.tsx`: Pro Mix toggle.
- `public/worklets/jazz-compressor-processor.js`: soft-knee compressor worklet.
