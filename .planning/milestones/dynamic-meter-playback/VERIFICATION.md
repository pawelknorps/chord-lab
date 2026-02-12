# Dynamic Meter Playback – Verification

## Phase 1: Time Map & Meter-for-Bar ✅

| Requirement | Verification |
|-------------|--------------|
| DMP-01 | `MeterChange` type and optional `meterChanges` on JazzStandard and on getSongAsIRealFormat return value. |
| DMP-02 | `getMeterAtBar(barIndex, undefined, defaultMeter)` and `getMeterAtBar(barIndex, [], defaultMeter)` return defaultMeter. |
| DMP-03 | `getMeterAtBar(16, [{ bar: 1, top: 4, bottom: 4 }, { bar: 17, top: 3, bottom: 4 }], '4/4')` returns `'3/4'`. |
| DMP-13 | No change to playback when song has no meterChanges; existing meterSignal/TimeSignature path unchanged. |

**Tests**: `src/modules/JazzKiller/utils/meterTranslator.test.ts` – 6 tests passing (default, empty, first bar, boundary, unsorted, getParsedMeterAtBar).

## Phase 2–5

Not yet executed.
