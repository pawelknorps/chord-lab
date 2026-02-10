import { create } from 'zustand';
import type { IIVIPattern, IIVIDrillState } from './IIVIPatternTypes';

interface IIVIDrillStore extends IIVIDrillState {
    setDrillMode: (mode: IIVIDrillState['currentDrillMode']) => void;
    setDrillSequence: (patterns: IIVIPattern[]) => void;
    nextPattern: () => void;
    prevPattern: () => void;
    reset: () => void;
}

export const useIIVIDrillStore = create<IIVIDrillStore>((set, get) => ({
    patterns: [],
    currentDrillMode: null,
    currentPatternIndex: 0,
    drillSequence: [],

    setDrillMode: (mode) => set({ currentDrillMode: mode, currentPatternIndex: 0 }),

    setDrillSequence: (patterns) => set({ drillSequence: patterns, currentPatternIndex: 0 }),

    nextPattern: () => {
        const { currentPatternIndex, drillSequence } = get();
        if (currentPatternIndex < drillSequence.length - 1) {
            set({ currentPatternIndex: currentPatternIndex + 1 });
        }
    },

    prevPattern: () => {
        const { currentPatternIndex } = get();
        if (currentPatternIndex > 0) {
            set({ currentPatternIndex: currentPatternIndex - 1 });
        }
    },

    reset: () => set({ currentDrillMode: null, currentPatternIndex: 0, drillSequence: [] }),
}));
