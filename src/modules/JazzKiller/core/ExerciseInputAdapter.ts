/**
 * Unified input adapter for Standards-Based Exercises (Phase 13).
 * Exposes getCurrentNote() from either mic (pitch pipeline) or MIDI so the
 * exercise engine does not branch on input source.
 */
import { useRef, useEffect, useCallback } from 'react';
import * as Note from '@tonaljs/note';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { useHighPerformancePitch } from '../../ITM/hooks/useHighPerformancePitch';
import { useMidi } from '../../../context/MidiContext';

export type ExerciseInputSource = 'mic' | 'midi';

export interface UseExerciseInputAdapterResult {
    /** Current note as MIDI number (0–127), or null if none. */
    getCurrentNote: () => number | null;
    /** Whether the adapter is ready (mic: stream + worklet ready; midi: always true). */
    isReady: boolean;
}

/**
 * Hook that provides a single getCurrentNote() API for either mic or MIDI input.
 * When source is 'mic' and active is true, starts the microphone and polls pitch.
 * When source is 'midi', reads lastNote from MidiContext.
 */
export function useExerciseInputAdapter(
    source: ExerciseInputSource,
    active: boolean
): UseExerciseInputAdapterResult {
    const { start: startMic, stop: stopMic, stream, isActive: isMicActive } = useMicrophone();
    const { isReady: isPitchReady, getLatestPitch } = useHighPerformancePitch(stream);
    const { lastNote } = useMidi();

    const latestMidiRef = useRef<number | null>(null);

    // Start/stop mic when exercises are active and source is mic
    useEffect(() => {
        if (source !== 'mic') return;
        if (active && !isMicActive) {
            void startMic();
        } else if (!active && isMicActive) {
            stopMic();
            latestMidiRef.current = null;
        }
    }, [source, active, isMicActive, startMic, stopMic]);

    // Mic path: poll getLatestPitch and convert to MIDI
    useEffect(() => {
        if (source !== 'mic' || !active || !isPitchReady) return;

        let rafId: number;
        const loop = () => {
            const result = getLatestPitch();
            if (result && result.clarity > 0.85 && result.frequency > 0) {
                const midi = Note.midi(Note.fromFreq(result.frequency));
                latestMidiRef.current = midi ?? null;
            } else {
                latestMidiRef.current = null;
            }
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [source, active, isPitchReady, getLatestPitch]);

    const getCurrentNote = useCallback((): number | null => {
        if (!active) return null;
        if (source === 'midi') {
            return lastNote?.type === 'noteon' ? lastNote.note : null;
        }
        return latestMidiRef.current;
    }, [source, active, lastNote]);

    const isReady = source === 'midi' || (source === 'mic' && isPitchReady);

    return { getCurrentNote, isReady };
}
