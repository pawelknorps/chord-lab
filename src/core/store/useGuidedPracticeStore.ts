import { create } from 'zustand';
import { useScoringStore } from './useScoringStore';

export type RoutineStage = 'scaling' | 'guidetones' | 'soloing' | 'cooldown';

interface StageConfig {
    id: RoutineStage;
    label: string;
    durationSeconds: number;
    description: string;
}

export const ROUTINE_CONFIG: StageConfig[] = [
    {
        id: 'scaling',
        label: 'Foundation: Scales',
        durationSeconds: 300, // 5 mins
        description: 'Focus on hitting all scale tones in time. Build your map of the keyboard/fretboard.'
    },
    {
        id: 'guidetones',
        label: 'Internalization: 3rds & 7ths',
        durationSeconds: 300, // 5 mins
        description: 'Prioritize hitting the 3rd and 7th of every chord on the downbeats.'
    },
    {
        id: 'soloing',
        label: 'Expression: Improv',
        durationSeconds: 300, // 5 mins
        description: 'Full improvisation. Aim for accuracy and natural jazz phrasing.'
    },
];

interface GuidedPracticeState {
    currentStageIndex: number;
    timeRemaining: number;
    isActive: boolean;
    isPaused: boolean;
    isFinished: boolean;
    sessionHistory: Array<{ stage: RoutineStage, score: number }>;

    // Actions
    startRoutine: () => void;
    pauseRoutine: () => void;
    resumeRoutine: () => void;
    stopRoutine: () => void;
    nextStage: () => void;
    updateTimer: () => void;
    resetRoutine: () => void;
}

export const useGuidedPracticeStore = create<GuidedPracticeState>((set, get) => ({
    currentStageIndex: 0,
    timeRemaining: ROUTINE_CONFIG[0].durationSeconds,
    isActive: false,
    isPaused: false,
    isFinished: false,
    sessionHistory: [],

    startRoutine: () => {
        const { startScoring, resetScore } = useScoringStore.getState();
        resetScore();
        startScoring();
        set({
            isActive: true,
            isPaused: false,
            isFinished: false,
            currentStageIndex: 0,
            timeRemaining: ROUTINE_CONFIG[0].durationSeconds,
            sessionHistory: []
        });
    },

    pauseRoutine: () => set({ isPaused: true }),
    resumeRoutine: () => set({ isPaused: false }),

    stopRoutine: () => {
        const { stopScoring } = useScoringStore.getState();
        stopScoring();
        set({ isActive: false, isPaused: false });
    },

    resetRoutine: () => {
        set({ isFinished: false, isActive: false, isPaused: false });
    },

    nextStage: () => {
        const { currentStageIndex, sessionHistory } = get();
        const { score } = useScoringStore.getState();

        const currentStage = ROUTINE_CONFIG[currentStageIndex];
        const newHistory = [...sessionHistory, { stage: currentStage.id, score }];

        const nextIndex = currentStageIndex + 1;
        if (nextIndex < ROUTINE_CONFIG.length) {
            set({
                currentStageIndex: nextIndex,
                timeRemaining: ROUTINE_CONFIG[nextIndex].durationSeconds,
                sessionHistory: newHistory
            });
            // Reset score for the next stage to track it independently?
            // Or keep it cumulative? Let's keep it cumulative for the session
            // but we can snapshot it here.
        } else {
            // End of routine
            get().stopRoutine();
            set({ sessionHistory: newHistory, isFinished: true });
        }
    },

    updateTimer: () => {
        const { isActive, isPaused, timeRemaining } = get();
        if (!isActive || isPaused) return;

        if (timeRemaining > 0) {
            set({ timeRemaining: timeRemaining - 1 });
        } else {
            get().nextStage();
        }
    }
}));
