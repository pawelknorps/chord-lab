/**
 * Solo transcription recording (Phase 15, REQ-SBE-07).
 * Captures timestamped notes (mic or MIDI) for written transcription.
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import * as Note from '@tonaljs/note';
import { currentMeasureIndexSignal, currentBeatSignal } from '../state/jazzSignals';
import { useExerciseInputAdapter, type ExerciseInputSource } from '../core/ExerciseInputAdapter';
import * as Tone from 'tone';

export interface TranscriptionEvent {
    midi: number;
    onsetSeconds: number;
    measureIndex: number;
    beat: number;
}

export interface UseSoloTranscriptionOptions {
    inputSource: ExerciseInputSource;
    /** When true, adapter is active (mic or MIDI). */
    active: boolean;
}

export interface UseSoloTranscriptionResult {
    isRecording: boolean;
    startRecording: () => void;
    stopRecording: () => void;
    /** Current list of recorded events (cleared on startRecording). */
    getTranscription: () => TranscriptionEvent[];
    /** Note list string e.g. "C4, E4, G4" (Tonal names from MIDI). */
    getNoteListString: () => string;
    isReady: boolean;
}

export function useSoloTranscription(options: UseSoloTranscriptionOptions): UseSoloTranscriptionResult {
    const { inputSource, active } = options;
    useSignals();

    const { getCurrentNote, isReady } = useExerciseInputAdapter(inputSource, active);
    const [isRecording, setIsRecording] = useState(false);
    const eventsRef = useRef<TranscriptionEvent[]>([]);
    const lastMidiRef = useRef<number | null>(null);

    const startRecording = useCallback(() => {
        eventsRef.current = [];
        lastMidiRef.current = null;
        setIsRecording(true);
    }, []);

    const stopRecording = useCallback(() => {
        setIsRecording(false);
        lastMidiRef.current = null;
    }, []);

    useEffect(() => {
        if (!active || !isRecording) return;

        let rafId: number;
        const loop = () => {
            const note = getCurrentNote();
            if (note !== null && note !== lastMidiRef.current) {
                lastMidiRef.current = note;
                const measureIndex = currentMeasureIndexSignal.value ?? -1;
                const beat = currentBeatSignal.value ?? -1;
                eventsRef.current.push({
                    midi: note,
                    onsetSeconds: Tone.Transport.seconds,
                    measureIndex,
                    beat
                });
            }
            if (note === null) {
                lastMidiRef.current = null;
            }
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [active, isRecording, getCurrentNote]);

    const getTranscription = useCallback((): TranscriptionEvent[] => {
        return [...eventsRef.current];
    }, []);

    const getNoteListString = useCallback((): string => {
        const events = eventsRef.current;
        if (events.length === 0) return '';
        return events.map((e) => Note.fromMidi(e.midi) ?? `?${e.midi}`).join(', ');
    }, []);

    return {
        isRecording,
        startRecording,
        stopRecording,
        getTranscription,
        getNoteListString,
        isReady
    };
}
