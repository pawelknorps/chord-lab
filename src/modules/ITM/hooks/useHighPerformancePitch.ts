import { useEffect } from 'react';
import { useITMPitchStore } from '../state/useITMPitchStore';

/**
 * Hook to consume the High-Performance Pitch Engine (2026 Pattern).
 * Automatically initializes/cleans up the singleton store based on the stream.
 */
export function useHighPerformancePitch(stream: MediaStream | null) {
    const { isReady, initialize, cleanup, getLatestPitch } = useITMPitchStore();

    useEffect(() => {
        if (stream) {
            void initialize(stream);
        } else {
            cleanup();
        }
    }, [stream, initialize, cleanup]);

    return {
        isReady,
        getLatestPitch
    };
}
