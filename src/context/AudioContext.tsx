import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { initAudio as initGlobalAudio } from '../core/audio/globalAudio';
import { audioManager } from '../core/services';
import { useSettingsStore } from '../core/store/useSettingsStore';

interface AudioContextType {
    isReady: boolean;
    startAudio: () => Promise<void>;
    masterVolume: Tone.Volume;
    audioManager: typeof audioManager;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error('useAudio must be used within an AudioProvider');
    return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const masterVolumeValue = useSettingsStore(state => state.masterVolume);
    const masterVolume = useRef<Tone.Volume>(new Tone.Volume(0).toDestination());

    // Sync store volume to Tone master volume
    useEffect(() => {
        // Convert 0-1 range to decibels (-Infinity to 0 or similar)
        // Using a logarithmic scale for better perception
        const db = masterVolumeValue === 0 ? -100 : 20 * Math.log10(masterVolumeValue);
        masterVolume.current.volume.rampTo(db, 0.1);
    }, [masterVolumeValue]);

    const startAudio = useCallback(async () => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        await initGlobalAudio();
        await audioManager.initialize();
        setIsReady(true);
        console.log('Audio Engine Started/Resumed');
    }, []);

    // SILENT SENTRY: Prime audio engine on first interaction
    useEffect(() => {
        if (isReady) return;

        const handleInteraction = () => {
            console.log('Interaction detected, priming audio engine...');
            startAudio();
            // Remove listeners immediately
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        return () => {
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, [isReady, startAudio]);

    useEffect(() => {
        return () => {
            audioManager.cleanup();
        };
    }, []);

    return (
        <AudioContext.Provider value={{ isReady, startAudio, masterVolume: masterVolume.current, audioManager }}>
            {children}
        </AudioContext.Provider>
    );
};

export { AudioContext };
