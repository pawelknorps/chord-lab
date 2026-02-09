import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

interface MidiNote {
    note: number;
    velocity: number;
    type: 'noteon' | 'noteoff';
    timestamp: number;
}

interface MidiContextType {
    inputs: WebMidi.MIDIInput[];
    outputs: WebMidi.MIDIOutput[];
    selectedInput: string | null;
    selectInput: (id: string) => void;
    lastNote: MidiNote | null;
    activeNotes: Set<number>;
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
    const [selectedInput, setSelectedInput] = useState<string | null>(() => {
        return localStorage.getItem('selectedMidiInput');
    });
    const [lastNote, setLastNote] = useState<MidiNote | null>(null);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const midiAccessRef = useRef<WebMidi.MIDIAccess | null>(null);

    const handleMidiMessage = useCallback((event: WebMidi.MIDIMessageEvent) => {
        const [command, note, velocity] = event.data;
        const typeBit = command & 0xf0;

        let type: 'noteon' | 'noteoff' | null = null;
        if (typeBit === 0x90 && velocity > 0) {
            type = 'noteon';
        } else if (typeBit === 0x80 || (typeBit === 0x90 && velocity === 0)) {
            type = 'noteoff';
        }

        if (type) {
            const midiNote: MidiNote = {
                note,
                velocity,
                type,
                timestamp: performance.now()
            };

            setLastNote(midiNote);

            setActiveNotes(prev => {
                const next = new Set(prev);
                if (type === 'noteon') {
                    next.add(note);
                } else {
                    next.delete(note);
                }
                return next;
            });
        }
    }, []);

    const updateDevices = useCallback(() => {
        if (!midiAccessRef.current) return;
        const access = midiAccessRef.current;
        const newInputs = Array.from(access.inputs.values());
        const newOutputs = Array.from(access.outputs.values());

        setInputs(newInputs);
        setOutputs(newOutputs);

        // Auto-select if nothing selected
        if (newInputs.length > 0 && !selectedInput) {
            setSelectedInput(newInputs[0].id);
        }
    }, [selectedInput]);

    useEffect(() => {
        if (selectedInput) {
            localStorage.setItem('selectedMidiInput', selectedInput);
        }
    }, [selectedInput]);

    useEffect(() => {
        let mounted = true;

        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then((access) => {
                if (!mounted) return;
                midiAccessRef.current = access;
                access.onstatechange = updateDevices;
                updateDevices();
            }).catch(err => {
                console.error('MIDI Access Denied:', err);
            });
        }

        return () => {
            mounted = false;
        };
    }, [updateDevices]);

    // Bind listeners to selected input (or ALL inputs if desired, but let's stick to selected for now)
    useEffect(() => {
        const access = midiAccessRef.current;
        if (!access) return;

        const inputsToListen = selectedInput
            ? [access.inputs.get(selectedInput)].filter(Boolean) as WebMidi.MIDIInput[]
            : Array.from(access.inputs.values());

        inputsToListen.forEach(input => {
            input.onmidimessage = handleMidiMessage;
        });

        return () => {
            inputsToListen.forEach(input => {
                input.onmidimessage = null;
            });
        };
    }, [selectedInput, inputs, handleMidiMessage]);

    const selectInput = useCallback((id: string) => {
        setSelectedInput(id);
    }, []);

    return (
        <MidiContext.Provider value={{
            inputs,
            outputs,
            selectedInput,
            selectInput,
            lastNote,
            activeNotes
        }}>
            {children}
        </MidiContext.Provider>
    );
};

