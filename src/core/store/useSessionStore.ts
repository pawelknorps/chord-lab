import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProgressionData, ChordData } from '../../components/shared/types';

interface PracticeGoal {
    id: string;
    type: 'identify' | 'construct' | 'play';
    description: string;
    target?: string; // e.g. "C Major 7"
    completed: boolean;
}

interface SessionState {
    isActive: boolean;
    activeProgression: ProgressionData | null;
    activeChord: ChordData | null;
    goals: PracticeGoal[];
    startTime: number | null;
}

interface SessionActions {
    startSession: (data?: { progression?: ProgressionData; chord?: ChordData }) => void;
    endSession: () => void;
    addGoal: (goal: Omit<PracticeGoal, 'id' | 'completed'>) => void;
    toggleGoal: (id: string) => void;
    clearGoals: () => void;
    setProgression: (progression: ProgressionData | null) => void;
    setChord: (chord: ChordData | null) => void;
}

export const useSessionStore = create<SessionState & SessionActions>()(
    persist(
        (set) => ({
            isActive: false,
            activeProgression: null,
            activeChord: null,
            goals: [],
            startTime: null,

            startSession: (data) => set({
                isActive: true,
                startTime: Date.now(),
                activeProgression: data?.progression || null,
                activeChord: data?.chord || null
            }),

            endSession: () => set({
                isActive: false,
                startTime: null,
                activeProgression: null,
                activeChord: null,
                goals: []
            }),

            addGoal: (goal) => set((state) => ({
                goals: [...state.goals, { ...goal, id: Math.random().toString(36).substr(2, 9), completed: false }]
            })),

            toggleGoal: (id) => set((state) => ({
                goals: state.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
            })),

            clearGoals: () => set({ goals: [] }),

            setProgression: (activeProgression) => set({ activeProgression }),
            setChord: (activeChord) => set({ activeChord }),
        }),
        {
            name: 'chordlab-session',
        }
    )
);
