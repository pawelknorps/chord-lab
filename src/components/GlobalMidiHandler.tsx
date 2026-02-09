import React, { useEffect, useRef } from 'react';
import { useMidi } from '../context/MidiContext';
import { triggerAttack, triggerRelease, isAudioReady } from '../core/audio/globalAudio';

export const GlobalMidiHandler: React.FC = () => {
    const { lastNote } = useMidi();
    const processedNoteRef = useRef<number | null>(null);
    const processedTimeRef = useRef<number>(0);

    useEffect(() => {
        // Ensure we don't process the same message twice and audio is ready
        if (!lastNote || !isAudioReady() || (processedNoteRef.current === lastNote.note && processedTimeRef.current === lastNote.timestamp)) return;

        processedNoteRef.current = lastNote.note;
        processedTimeRef.current = lastNote.timestamp;

        if (lastNote.type === 'noteon') {
            triggerAttack(lastNote.note, lastNote.velocity / 127);
        } else {
            triggerRelease(lastNote.note);
        }
    }, [lastNote]);

    return null; // Headless component
};

