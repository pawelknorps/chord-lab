import React, { createContext, useContext, useRef, useState } from 'react';
import * as Tone from 'tone';
import { initAudio as initGlobalAudio } from '../core/audio/globalAudio';

interface AudioContextType {
    isReady: boolean;
    startAudio: () => Promise<void>;
    masterVolume: Tone.Volume;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error('useAudio must be used within an AudioProvider');
    return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const masterVolume = useRef<Tone.Volume>(new Tone.Volume(0).toDestination());

    const startAudio = async () => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        await initGlobalAudio(); // Initialize core audio engine
        setIsReady(true);
        console.log('Audio Engine Started');
    };

    return (
        <AudioContext.Provider value={{ isReady, startAudio, masterVolume: masterVolume.current }}>
            {children}
        </AudioContext.Provider>
    );
};
