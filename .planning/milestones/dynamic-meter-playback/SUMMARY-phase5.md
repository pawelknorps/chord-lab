# Phase 5: Lead Sheet Visuals – Summary

## Done

### Bar width by meter (DMP-09)

- LeadSheet layout changed from `grid grid-cols-4` to **flex rows of 4 measures**.
- For each row, `rowWeight = sum(divisionsPerBar)` over measures in row; each measure `width = (divisionsPerBar / rowWeight) * 100%`.
- `divisionsPerBar` from `getParsedMeterAtBar(index, song.meterChanges, defaultMeter)`. When no meterChanges, default 4/4 → equal 25% width (non-destructive).

### Meter marker at change bars (DMP-10)

- For each measure, `isMeterChangeBar = song.meterChanges?.some(c => c.bar === index + 1)`.
- When true, show a small label (e.g. "3/4") at top-right of the measure via `getMeterAtBar(index, song.meterChanges, defaultMeter)`.

### Current beat highlight by current bar meter (DMP-11)

- Playhead position was `left: (curBeat / 4) * 100%` (fixed 4 beats).
- Now `left: (curBeat / parsed.divisionsPerBar) * 100%` where `parsed = getParsedMeterAtBar(curMeasure, song.meterChanges, defaultMeter)` for the **active** measure. So 3/4 bars get 3 pulses.

### Non-destructive

- When `song.meterChanges` is absent or empty, `getMeterAtBar`/`getParsedMeterAtBar` use defaultMeter (4/4), so widths stay 25% each, no meter markers, playhead still uses 4 divisions when default is 4/4.

## Requirements

- DMP-09: Bar width by meter ✅
- DMP-10: Meter marker at change bars ✅
- DMP-11: Beat highlight uses meter for current bar ✅

## Files

- `src/modules/JazzKiller/components/LeadSheet.tsx`: imports getMeterAtBar, getParsedMeterAtBar; rows with variable width; meter label; playhead by divisionsPerBar.
