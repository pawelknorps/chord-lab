import { create } from 'zustand';

export type FETLevel = 'Tendency' | 'Modulation' | 'Bass' | 'Interference' | 'Progressions' | 'MelodySteps' | 'ChordQualities' | 'JazzStandards' | 'Intervals' | 'Fretboard' | 'ChordTones' | 'Positions' | 'SecondaryDominants' | 'ModalInterchange' | 'UST';
export type FETDifficulty = 'Novice' | 'Advanced' | 'Pro';

interface FETState {
    level: FETLevel;
    difficulty: FETDifficulty;
    score: number;
    streak: number;
    currentKey: string;
    isPlaying: boolean;

    // Actions
    setLevel: (level: FETLevel) => void;
    setDifficulty: (difficulty: FETDifficulty) => void;
    addScore: (points: number) => void;
    resetScore: () => void;
    setKey: (key: string) => void;
    setPlaying: (playing: boolean) => void;
}

export const useFunctionalEarTrainingStore = create<FETState>((set) => ({
    level: 'Tendency',
    difficulty: 'Novice',
    score: 0,
    streak: 0,
    currentKey: 'C',
    isPlaying: false,

    setLevel: (level) => set({ level }),
    setDifficulty: (difficulty) => set({ difficulty }),
    addScore: (points) => set((state) => ({
        score: state.score + points,
        streak: points > 0 ? state.streak + 1 : 0
    })),
    resetScore: () => set({ score: 0, streak: 0 }),
    setKey: (key) => set({ currentKey: key }),
    setPlaying: (playing) => set({ isPlaying: playing }),
}));
