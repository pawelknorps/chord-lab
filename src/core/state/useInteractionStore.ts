import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InteractionMode = 'Mouse' | 'Mic';

interface InteractionState {
    mode: InteractionMode;
    setMode: (mode: InteractionMode) => void;
    isListening: boolean;
    setIsListening: (listening: boolean) => void;
}

export const useInteractionStore = create<InteractionState>()(
    persist(
        (set) => ({
            mode: 'Mouse',
            setMode: (mode) => set({ mode }),
            isListening: false,
            setIsListening: (isListening) => set({ isListening }),
        }),
        {
            name: 'itm-interaction-storage',
        }
    )
);
