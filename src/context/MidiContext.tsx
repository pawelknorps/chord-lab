import React, { createContext, useContext, useEffect, useState } from 'react';

interface MidiContextType {
    inputs: WebMidi.MIDIInput[];
    outputs: WebMidi.MIDIOutput[];
    selectedInput: string | null;
    selectInput: (id: string) => void;
    lastNote: { note: number; velocity: number; type: 'noteon' | 'noteoff' } | null;
}

const MidiContext = createContext<MidiContextType | null>(null);

export const useMidi = () => {
    const context = useContext(MidiContext);
    if (!context) throw new Error('useMidi must be used within a MidiProvider');
    return context;
};

export const MidiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [inputs, setInputs] = useState<WebMidi.MIDIInput[]>([]);
    const [outputs, setOutputs] = useState<WebMidi.MIDIOutput[]>([]);
    const [selectedInput, setSelectedInput] = useState<string | null>(null);
    const [lastNote, setLastNote] = useState<MidiContextType['lastNote']>(null);

    useEffect(() => {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        } else {
            console.warn('Web MIDI API not supported in this browser.');
        }
    }, []);

    const onMIDISuccess = (midiAccess: WebMidi.MIDIAccess) => {
        const updateDevices = () => {
            setInputs(Array.from(midiAccess.inputs.values()));
            setOutputs(Array.from(midiAccess.outputs.values()));
        };

        midiAccess.onstatechange = updateDevices;
        updateDevices();

        // Auto-select first input
        if (midiAccess.inputs.size > 0 && !selectedInput) {
            const firstInput = midiAccess.inputs.values().next().value;
            if (firstInput) setSelectedInput(firstInput.id);
        }
    };

    const onMIDIFailure = () => {
        console.error('Could not access your MIDI devices.');
    };

    useEffect(() => {
        if (!selectedInput) return;

        const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
            const [command, note, velocity] = event.data;
            const type = (command & 0xf0) === 0x90 ? 'noteon' : (command & 0xf0) === 0x80 ? 'noteoff' : null;

            if (type && velocity > 0) { // Some devices send noteon with velocity 0 for noteoff
                setLastNote({ note, velocity, type: 'noteon' });
            } else if (type === 'noteoff' || (type === 'noteon' && velocity === 0)) {
                setLastNote({ note, velocity, type: 'noteoff' });
            }
        };

        // We need to re-bind the listener when selectedInput changes
        // This is a simplified version; a real implementation would manage event listeners more carefully
        // to avoid leaks or multiple listeners if inputs change frequently.
        // ideally accessible via navigator.requestMIDIAccess().inputs.get(selectedInput)

        navigator.requestMIDIAccess().then((access) => {
            const input = access.inputs.get(selectedInput);
            if (input) {
                input.onmidimessage = handleMidiMessage;
            }
        });

        return () => {
            navigator.requestMIDIAccess().then((access) => {
                const input = access.inputs.get(selectedInput);
                if (input) {
                    input.onmidimessage = null;
                }
            });
        };
    }, [selectedInput]);


    return (
        <MidiContext.Provider value={{ inputs, outputs, selectedInput, selectInput: setSelectedInput, lastNote }}>
            {children}
        </MidiContext.Provider>
    );
};
