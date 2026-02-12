# Phase 19: Soloist-Responsive Playback — Summary

## Completed (2026-02-12)

Phase 19 implemented the **Soloist-Responsive Playback** (Call-and-Response) feature: an experimental toggle so the playback engine listens to the soloist via SwiftF0 and **steers** the band in real time—more space when the user plays more/faster, more backing when the user plays less. **Existing band rules stay intact**; additive only.

### Wave 1: Toggle and Soloist Activity Derivation (REQ-SRP-01..03)

- **soloistResponsiveEnabledSignal** and **soloistActivitySignal** added in `jazzSignals.ts` (default off; 0–1).
- **soloistActivityFromPitch.ts**: Rolling “has pitch” duty cycle over ~1.6 s (sample every 100 ms, bounded buffer). Returns 0–1; high when user plays, low when silent. Null pitch (no mic) → 0.
- **useSoloistActivity.ts**: Polls `useITMPitchStore.getLatestPitch()` every 100 ms, feeds into sampler, updates `soloistActivitySignal`. Mounted in JazzKillerModule so when user turns toggle on, activity is already available.
- No mic / store not ready → soloist activity 0; band fills (no throw).

### Wave 2: Band Loop Integration (REQ-SRP-04..06)

- **useJazzBand.ts**: Imports `soloistResponsiveEnabledSignal` and `soloistActivitySignal`. After computing `effectiveActivity = activityLevelSignal.value * (0.3 + 0.7 * tuneIntensity)`, when toggle on: `activity = effectiveActivity * (1 - 0.65 * soloistActivitySignal.value)`. When toggle off: `activity = effectiveActivity` (unchanged).
- Same engines (ReactiveCompingEngine, RhythmEngine, DrumEngine, BassRhythmVariator) receive the same `activity` variable; no engine API or logic changes. Place-in-cycle, song-style, trio context unchanged.
- Toggle off → no code path reads soloist activity; behaviour identical to Phase 18.

### Wave 3: UI and Verification (REQ-SRP-07..08)

- **Mixer.tsx**: New section “Soloist-Responsive” with “Call-and-Response” button (Mic icon). Bound to `soloistResponsiveEnabledSignal`. When on, shows “X% soloist” from `soloistActivitySignal`.
- STATE.md and VERIFICATION.md updated (milestone and phase). Manual test steps documented.

## Files Modified

- `src/modules/JazzKiller/state/jazzSignals.ts` — signals
- `src/modules/JazzKiller/hooks/useJazzBand.ts` — steering
- `src/modules/JazzKiller/components/Mixer.tsx` — toggle UI
- `src/modules/JazzKiller/JazzKillerModule.tsx` — useSoloistActivity()

## Files Created

- `src/modules/JazzKiller/utils/soloistActivityFromPitch.ts`
- `src/modules/JazzKiller/hooks/useSoloistActivity.ts`

## Verification

See `.planning/phases/19-soloist-responsive-playback/VERIFICATION.md` for manual test steps. REQ-SRP-01..08 satisfied; no regression when toggle off.
