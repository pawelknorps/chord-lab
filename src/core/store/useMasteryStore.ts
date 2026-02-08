import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModuleId = 'FET' | 'Rhythm' | 'ChordLab' | 'CircleChords';

export interface MasteryPoints {
    points: number;
    level: number;
    streak: number;
}

interface MasteryState {
    modules: Record<ModuleId, MasteryPoints>;
    globalLevel: number;
    globalExperience: number;

    // Actions
    addExperience: (moduleId: ModuleId, amount: number) => void;
    updateStreak: (moduleId: ModuleId, streak: number) => void;
    getLevelProgress: (moduleId: ModuleId) => number;
}

const XP_PER_LEVEL = 1000;

export const useMasteryStore = create<MasteryState>()(
    persist(
        (set, get) => ({
            modules: {
                FET: { points: 0, level: 1, streak: 0 },
                Rhythm: { points: 0, level: 1, streak: 0 },
                ChordLab: { points: 0, level: 1, streak: 0 },
                CircleChords: { points: 0, level: 1, streak: 0 },
            },
            globalLevel: 1,
            globalExperience: 0,

            addExperience: (moduleId, amount) => {
                set((state) => {
                    const moduleData = state.modules[moduleId];
                    const newModulePoints = moduleData.points + amount;
                    const newModuleLevel = Math.floor(newModulePoints / XP_PER_LEVEL) + 1;

                    const newGlobalXP = state.globalExperience + amount;
                    const newGlobalLevel = Math.floor(newGlobalXP / (XP_PER_LEVEL * 2)) + 1;

                    return {
                        modules: {
                            ...state.modules,
                            [moduleId]: {
                                ...moduleData,
                                points: newModulePoints,
                                level: newModuleLevel,
                            },
                        },
                        globalExperience: newGlobalXP,
                        globalLevel: newGlobalLevel,
                    };
                });
            },

            updateStreak: (moduleId, streak) => {
                set((state) => ({
                    modules: {
                        ...state.modules,
                        [moduleId]: {
                            ...state.modules[moduleId],
                            streak,
                        },
                    },
                }));
            },

            getLevelProgress: (moduleId) => {
                const points = get().modules[moduleId].points;
                return (points % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
            },
        }),
        {
            name: 'chord-lab-mastery',
        }
    )
);
