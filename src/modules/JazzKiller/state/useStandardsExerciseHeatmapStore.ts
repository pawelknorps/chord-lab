/**
 * Store for Standards Exercise heatmap data so LeadSheet can show error heatmap
 * when Exercises panel is open (Phase 15, REQ-SBE-06). Panel syncs stats here.
 */
import { create } from 'zustand';

export type ExerciseTypeForHeatmap = 'scale' | 'guideTones' | 'arpeggio';

interface StandardsExerciseHeatmapState {
    statsByMeasure: Record<number, { hits: number; misses: number }>;
    exerciseType: ExerciseTypeForHeatmap | null;
    setHeatmap: (statsByMeasure: Record<number, { hits: number; misses: number }>, exerciseType: ExerciseTypeForHeatmap) => void;
    clear: () => void;
}

export const useStandardsExerciseHeatmapStore = create<StandardsExerciseHeatmapState>((set) => ({
    statsByMeasure: {},
    exerciseType: null,
    setHeatmap: (statsByMeasure, exerciseType) => set({ statsByMeasure, exerciseType }),
    clear: () => set({ statsByMeasure: {}, exerciseType: null })
}));
