import { create } from 'zustand';

export type RhythmLevel = 'Subdivision' | 'Syncopation' | 'Polyrhythm' | 'Displacement' | 'Arena' | 'Methodology';
export type RhythmDifficulty = 'Novice' | 'Intermediate' | 'Advanced' | 'Pro' | 'Virtuoso';

const DEFAULT_BPM_BY_DIFFICULTY: Record<RhythmDifficulty, number> = {
    Novice: 50,
    Intermediate: 60,
    Advanced: 75,
    Pro: 90,
    Virtuoso: 100,
};

interface RhythmState {
    level: RhythmLevel;
    difficulty: RhythmDifficulty;
    score: number;
    streak: number;
    bpm: number;
    isPlaying: boolean;
    metronomeEnabled: boolean;

    // Actions
    setLevel: (level: RhythmLevel) => void;
    setDifficulty: (difficulty: RhythmDifficulty) => void;
    addScore: (points: number) => void;
    setCurrentBpm: (bpm: number) => void;
    setPlaying: (isPlaying: boolean) => void;
    setMetronomeEnabled: (enabled: boolean) => void;
    resetScore: () => void;
}

export const useRhythmStore = create<RhythmState>((set) => ({
    level: 'Subdivision',
    difficulty: 'Novice',
    score: 0,
    streak: 0,
    bpm: DEFAULT_BPM_BY_DIFFICULTY.Novice,
    isPlaying: false,
    metronomeEnabled: true, // Default to true as per user request for "underlining metronome"

    setLevel: (level) => set({ level }),
    setDifficulty: (difficulty) => set({ difficulty, bpm: DEFAULT_BPM_BY_DIFFICULTY[difficulty] }),
    addScore: (points) => set((state) => ({
        score: state.score + points,
        streak: points > 0 ? state.streak + 1 : 0
    })),
    setCurrentBpm: (bpm) => set({ bpm }),
    setPlaying: (isPlaying) => set({ isPlaying }),
    setMetronomeEnabled: (metronomeEnabled) => set({ metronomeEnabled }),
    resetScore: () => set({ score: 0, streak: 0 })
}));
