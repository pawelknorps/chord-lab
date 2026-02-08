import { useCallback } from 'react';
import { playSplitBrain, setDissonance as setGlobalDissonance, stop as stopGlobal } from '../../../core/audio/globalAudio';

export interface SplitBrainAudio {
    playShell: (notes: string[], duration?: string) => void;
    playUpperStructure: (notes: string[], duration?: string) => void;
    setDissonance: (amount: number) => void; // 0 to 1
    stopAll: () => void;
}

export const useSplitBrainAudio = (): SplitBrainAudio => {
    const playShell = useCallback((notes: string[], duration = '2n') => {
        playSplitBrain(notes, [], duration);
    }, []);

    const playUpperStructure = useCallback((notes: string[], duration = '2n') => {
        playSplitBrain([], notes, duration);
    }, []);

    const setDissonance = useCallback((amount: number) => {
        setGlobalDissonance(amount);
    }, []);

    const stopAll = useCallback(() => {
        stopGlobal();
    }, []);

    return {
        playShell,
        playUpperStructure,
        setDissonance,
        stopAll
    };
};
