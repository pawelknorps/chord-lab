import { useEffect } from 'react';
import { useITMPitchStore } from '../state/useITMPitchStore';
import type { PitchStoreOptions } from '../state/useITMPitchStore';
import { frequencyToNote, NoteInfo } from '../../../core/audio/frequencyToNote';

/**
 * Hook to consume the High-Performance Pitch Engine (2026 Pattern).
 * Automatically initializes/cleans up the singleton store based on the stream.
 * Pass options.hopBlocks: 2 or 3 for "low CPU" mode (fewer inferences per second).
 */
export function useHighPerformancePitch(
    stream: MediaStream | null,
    instrumentId: string = 'auto',
    options?: PitchStoreOptions
) {
    const { isReady, initialize, cleanup, getLatestPitch, startLatencyMeasurement, stopLatencyMeasurement, lastLatencyMs } = useITMPitchStore();

    useEffect(() => {
        if (stream) {
            void initialize(stream, instrumentId, { ...options, useSwiftF0: true });
        } else {
            cleanup();
        }
    }, [stream, initialize, cleanup, instrumentId, options?.hopBlocks, options?.useSwiftF0]);

    return {
        isReady,
        getLatestPitch,
        getLatestNoteInfo: (): NoteInfo | null => {
            const pitch = getLatestPitch();
            if (!pitch || pitch.frequency <= 0) return null;
            return frequencyToNote(pitch.frequency);
        },
        startLatencyMeasurement,
        stopLatencyMeasurement,
        lastLatencyMs,
    };
}
