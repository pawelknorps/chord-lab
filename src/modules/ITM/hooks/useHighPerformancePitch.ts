import { useEffect } from 'react';
import { useITMPitchStore } from '../state/useITMPitchStore';
import { frequencyToNote, NoteInfo } from '../../../core/audio/frequencyToNote';

/**
 * Hook to consume the High-Performance Pitch Engine (2026 Pattern).
 * Automatically initializes/cleans up the singleton store based on the stream.
 */
export function useHighPerformancePitch(stream: MediaStream | null, instrumentId: string = 'auto') {
    const { isReady, initialize, cleanup, getLatestPitch } = useITMPitchStore();

    useEffect(() => {
        if (stream) {
            void initialize(stream, instrumentId);
        } else {
            cleanup();
        }
    }, [stream, initialize, cleanup, instrumentId]);

    return {
        isReady,
        getLatestPitch,
        getLatestNoteInfo: (): NoteInfo | null => {
            const pitch = getLatestPitch();
            if (!pitch || pitch.frequency <= 0) return null;
            return frequencyToNote(pitch.frequency);
        }
    };
}
