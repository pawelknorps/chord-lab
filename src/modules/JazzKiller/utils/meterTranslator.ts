/**
 * Meter translator: single source of truth for converting Transport position + meter
 * into playback state. Used by both the visual playhead and the playback engines
 * so they stay in sync across 2/4, 3/4, 4/4, 5/4, 6/4, 6/8, 9/8, 12/8, 7/8.
 * Supports optional meter changes mid-song via a time map (meterChanges).
 */
import * as Tone from 'tone';

const DEFAULT_METER = '4/4';

/** One meter change: from this bar (1-based) onward, use top/bottom. */
export interface MeterChange {
  /** Bar number (1-based) where this signature takes effect. */
  bar: number;
  top: number;
  bottom: number;
}

/** Parsed time signature and derived values. */
export interface ParsedMeter {
  meter: string;
  numerator: number;
  denominator: number;
  divisionsPerBar: number;
  beatNote: string;
}

/** Playback state derived from Transport position + meter. Use this in loop callbacks and UI. */
export interface PlaybackState {
  bar: number;
  quarter: number;
  sixteenth: number;
  beat: number;
  divisionsPerBar: number;
  midBarBeat: number;
  lastBeat: number;
  shouldRun: boolean;
  parsed: ParsedMeter;
}

/**
 * Parse a meter string (e.g. "4/4", "3/4", "6/8") into a stable object.
 * Divisions per bar: 2/4→2, 3/4→3, 4/4→4, 5/4→5, 6/4→6, 6/8→6, 9/8→9, 12/8→12, 7/8→4 (quarter grid).
 */
export function parseMeter(meter: string): ParsedMeter {
  const normalized = (meter || DEFAULT_METER).trim();
  const parts = normalized.split('/').map((s) => parseInt(s, 10));
  const numerator = Number.isFinite(parts[0]) ? Math.max(1, parts[0]) : 4;
  const denominator = Number.isFinite(parts[1]) ? Math.max(1, parts[1]) : 4;

  // Simple (2/4, 3/4, 4/4, 5/4, 6/4): divisions = numerator. Compound (6/8, 9/8, 12/8, 7/8): divisions = numerator (eighth-note grid).
  const divisionsPerBar = numerator;
  const beatNote = denominator >= 4 ? '4n' : '8n';

  return {
    meter: normalized,
    numerator,
    denominator,
    divisionsPerBar,
    beatNote,
  };
}

/**
 * Apply meter to Tone.Transport so position (bar:quarter:sixteenth) matches the time signature.
 * Call when meter changes (e.g. in an effect) and optionally before reading position in callbacks.
 */
export function applyMeterToTransport(meter: string): void {
  const parsed = parseMeter(meter);
  if (parsed.denominator === 8 && parsed.numerator !== 4 && parsed.numerator !== 8) {
    Tone.getTransport().timeSignature = [parsed.numerator, parsed.denominator];
  } else {
    const quartersPerBar =
      parsed.denominator === 8 ? (parsed.numerator / 8) * 4 : parsed.numerator;
    Tone.getTransport().timeSignature = quartersPerBar;
  }
}

/**
 * Convert Transport position string + parsed meter into a single playback state.
 * Use this in the loop callback: pass position and the current meter (from a ref updated by React).
 * Returns shouldRun: false when the fixed "8n" loop fires on an off-grid tick (e.g. skip upbeats in 4/4).
 */
export function positionToPlaybackState(
  positionString: string,
  parsed: ParsedMeter
): PlaybackState {
  const parts = positionString.split(':');
  const bar = parseInt(parts[0], 10) || 0;
  const quarter = parseInt(parts[1], 10) || 0;
  const sixteenth = parseInt(parts[2], 10) || 0;

  const divisionsPerBar = parsed.divisionsPerBar;
  const midBarBeat = Math.floor(divisionsPerBar / 2);
  const lastBeat = divisionsPerBar - 1;

  // For simple meters (2/4, 3/4, 4/4, 5/4, 6/4): run only on quarter downbeats (sixteenth 0) so we get N runs per bar.
  // For compound (6/8, 9/8, 12/8): run every eighth (every tick).
  const shouldRun =
    parsed.denominator === 8 ? true : sixteenth === 0;

  let beat: number;
  if (parsed.denominator === 8) {
    beat = Math.min(lastBeat, Math.max(0, quarter * 2 + (sixteenth >= 2 ? 1 : 0)));
  } else {
    beat = Math.min(lastBeat, Math.max(0, quarter));
  }

  return {
    bar,
    quarter,
    sixteenth,
    beat,
    divisionsPerBar,
    midBarBeat,
    lastBeat,
    shouldRun,
    parsed,
  };
}

/**
 * Loop interval used by playback. Fixed "8n" so we get a tick every eighth;
 * positionToPlaybackState decides whether to run (shouldRun) and which beat (0..N-1).
 */
export const PLAYBACK_LOOP_INTERVAL = '8n' as const;

/**
 * Resolve the effective time signature for a given bar from a time map.
 * Bars are 0-based (bar 0 = first bar). When meterChanges is absent or empty, returns defaultMeter (non-destructive: existing single-meter behavior).
 * When present, returns the meter for the latest change where change.bar <= barIndex + 1 (since change.bar is 1-based).
 */
export function getMeterAtBar(
  barIndex: number,
  meterChanges: MeterChange[] | undefined | null,
  defaultMeter: string
): string {
  if (!meterChanges || meterChanges.length === 0) return defaultMeter;
  const oneBased = barIndex + 1;
  const sorted = [...meterChanges].sort((a, b) => a.bar - b.bar);
  let chosen = sorted[0];
  for (const c of sorted) {
    if (c.bar <= oneBased) chosen = c;
    else break;
  }
  return `${chosen.top}/${chosen.bottom}`;
}

/**
 * Same as getMeterAtBar but returns ParsedMeter (for use with positionToPlaybackState).
 */
export function getParsedMeterAtBar(
  barIndex: number,
  meterChanges: MeterChange[] | undefined | null,
  defaultMeter: string
): ParsedMeter {
  return parseMeter(getMeterAtBar(barIndex, meterChanges, defaultMeter));
}

/**
 * Schedule Transport time-signature changes at the start of each bar where a meter change is defined.
 * Call only when song.meterChanges?.length (non-destructive: no-op when no meter changes). Returns event IDs to clear on unload/stop.
 * DMP-04, DMP-05: each change is scheduled at "${bar-1}:0:0"; callback sets Transport.timeSignature and optionally updates UI state.
 */
export function scheduleMeterChanges(
  meterChanges: MeterChange[],
  defaultMeter: string,
  onMeterChange?: (meter: string) => void
): number[] {
  if (!meterChanges.length) return [];
  const transport = Tone.getTransport();
  const ids: number[] = [];
  const sorted = [...meterChanges].sort((a, b) => a.bar - b.bar);
  for (const change of sorted) {
    const time = `${change.bar - 1}:0:0`;
    const meter = `${change.top}/${change.bottom}`;
    const id = transport.schedule((_time) => {
      applyMeterToTransport(meter);
      if (onMeterChange) {
        Tone.Draw.schedule(() => onMeterChange(meter), _time);
      }
    }, time);
    ids.push(id);
  }
  return ids;
}

/**
 * Clear previously scheduled meter-change events. Call on song unload or playback stop (DMP-05).
 */
export function clearMeterChangeSchedules(ids: number[]): void {
  const transport = Tone.getTransport();
  for (const id of ids) {
    transport.clear(id);
  }
}
