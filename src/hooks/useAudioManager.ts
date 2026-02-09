import { useEffect, useContext } from 'react';
import { AudioContext } from '../context/AudioContext';
import { audioManager } from '../core/services';

export function useAudioManager() {
    const context = useContext(AudioContext);
    return context?.audioManager || audioManager;
}

export function useAudioCleanup(moduleId: string) {
    const manager = useAudioManager();

    useEffect(() => {
        manager.registerModule(moduleId);

        return () => {
            manager.unregisterModule(moduleId);
        };
    }, [manager, moduleId]);
}
