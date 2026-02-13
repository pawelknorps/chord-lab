/**
 * Phase 21 Wave 5: Live Harmonic Grounding overlay wiring.
 * Polls pitch store and current chart chord; returns getLiveOverrides for the overlay.
 */
import { useEffect, useRef, useState } from 'react';
import { useITMPitchStore } from '../../ITM/state/useITMPitchStore';
import { currentChordSymbolSignal } from '../state/jazzSignals';
import { getLiveOverrides, type LiveOverrides, type PitchBufferEntry } from '../../../core/theory/liveHarmonicGrounding';

const POLL_MS = 150;
const BUFFER_MAX = 60; // ~2s at 30 samples/s

export function useLiveHarmonicOverrides(enabled: boolean): LiveOverrides | null {
    const [overrides, setOverrides] = useState<LiveOverrides | null>(null);
    const bufferRef = useRef<PitchBufferEntry[]>([]);

    useEffect(() => {
        if (!enabled) {
            setOverrides(null);
            bufferRef.current = [];
            return;
        }

        const intervalId = setInterval(() => {
            const store = useITMPitchStore.getState();
            const reading = store.getLatestPitch();
            const chartChord = currentChordSymbolSignal.value ?? '';

            if (reading?.frequency && reading.frequency > 0) {
                bufferRef.current.push({ frequency: reading.frequency });
                if (bufferRef.current.length > BUFFER_MAX) bufferRef.current.shift();
            }

            const result = getLiveOverrides(chartChord, bufferRef.current);
            const hasAny =
                result.romanNumeral != null || result.pedal != null || result.chordTone != null;
            setOverrides(hasAny ? result : null);
        }, POLL_MS);

        return () => clearInterval(intervalId);
    }, [enabled]);

    return overrides;
}
