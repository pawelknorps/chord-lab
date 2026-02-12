# Dynamic Meter Playback – State

## Milestone Status

| Phase | Status | Notes |
|-------|--------|--------|
| 1. Time Map & Meter-for-Bar | Not started | |
| 2. Transport Scheduler | Not started | |
| 3. Playback Loop Uses Meter-for-Bar | Not started | |
| 4. Bass & Drums Adaptation | Not started | |
| 5. Lead Sheet Visuals | Not started | |

## Current Focus

- **Next**: Phase 1 – define `meterChanges` and `getMeterAtBar`, ensure default behavior when absent.

## Done

- Milestone created; PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md in place.
- Existing codebase: `meterTranslator.ts` and playback hooks support multiple meters (user-selectable); they will be extended to resolve meter per bar from a time map.

## Blockers

- None.
