import React, { useEffect } from 'react';
import { useMidi } from '../context/MidiContext';
import { triggerAttack, triggerRelease } from '../core/audio/globalAudio';

export const GlobalMidiHandler: React.FC = () => {
    const { lastNote } = useMidi();

    useEffect(() => {
        if (!lastNote) return;

        if (lastNote.type === 'noteon') {
            triggerAttack(lastNote.note, lastNote.velocity / 127);
        } else {
            triggerRelease(lastNote.note);
        }
    }, [lastNote]);

    return null; // Headless component
};
