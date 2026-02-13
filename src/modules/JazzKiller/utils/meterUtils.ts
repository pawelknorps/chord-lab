/**
 * Re-exports and compatibility layer for meter translation.
 * The single source of truth is meterTranslator.ts; use it directly in new code.
 */
import {
  parseMeter as parseMeterImpl,
  applyMeterToTransport,
  positionToPlaybackState,
  type ParsedMeter as ParsedMeterFromTranslator,
  type PlaybackState,
} from './meterTranslator';

export type { PlaybackState };

/** Parsed meter with optional applyToTransport for backward compatibility. */
export interface ParsedMeter extends ParsedMeterFromTranslator {
  applyToTransport?: () => void;
}

export function parseMeter(meter: string): ParsedMeter {
  const p = parseMeterImpl(meter);
  return {
    ...p,
    applyToTransport: () => applyMeterToTransport(meter),
  };
}

export function getDivisionFromPosition(
  _bar: number,
  quarter: number,
  sixteenth: number,
  parsed: ParsedMeterFromTranslator
): number {
  const pos = `0:${quarter}:${sixteenth}`;
  return positionToPlaybackState(pos, parsed).beat;
}

export function shouldRunBeatForPosition(
  sixteenth: number,
  parsed: ParsedMeterFromTranslator
): boolean {
  const pos = `0:0:${sixteenth}`;
  return positionToPlaybackState(pos, parsed).shouldRun;
}

export { applyMeterToTransport, positionToPlaybackState } from './meterTranslator';
