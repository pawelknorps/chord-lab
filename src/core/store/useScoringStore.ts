import { create } from 'zustand';
import { parseChord, CHORD_INTERVALS, noteNameToMidi } from '../theory';

/**
 * Scoring engine for the "Incredible Teaching Machine" (REQ-FB-02).
 * Compares real-time frequency to current chord tones and calculates a Grade.
 */

interface ScoringState {
    score: number;
    totalNotesProcessed: number;
    matchingNotesCount: number;
    perfectNotesCount: number; // For 3rds/7ths on downbeats (Mastery)
    grade: string;
    heatmap: Record<number, number>; // measureIndex -> sum of correctness points
    measureTicks: Record<number, number>; // measureIndex -> total processed samples
    notesByMeasure: Record<number, { frequency: number; clarity: number; cents: number; timestamp: number }[]>;
    currentSessionId: string | null;
    isActive: boolean;

    // Actions
    startScoring: () => void;
    stopScoring: () => void;
    resetScore: () => void;
    /**
   * Processes a single MIDI note sample against the current musical context.
   * Gives bonuses for "Target Notes" (3rds and 7ths).
   */
    processNote: (midi: number, frequency: number, clarity: number, cents: number, currentChordSymbol: string, measureIndex: number) => void;
}

const calculateGrade = (score: number): string => {
    if (score >= 95) return 'S+';
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'F';
};

export const useScoringStore = create<ScoringState>((set, get) => ({
    score: 0,
    totalNotesProcessed: 0,
    matchingNotesCount: 0,
    perfectNotesCount: 0,
    grade: 'F',
    heatmap: {},
    measureTicks: {},
    notesByMeasure: {},
    currentSessionId: null,
    isActive: false,

    startScoring: () => set({
        isActive: true,
        currentSessionId: `session-${Date.now()}`
    }),
    stopScoring: () => set({ isActive: false }),
    resetScore: () => set({
        score: 0,
        totalNotesProcessed: 0,
        matchingNotesCount: 0,
        perfectNotesCount: 0,
        grade: 'F',
        heatmap: {},
        measureTicks: {},
        notesByMeasure: {},
        currentSessionId: null
    }),

    processNote: (midi, frequency, clarity, cents, currentChordSymbol, measureIndex) => {
        const { isActive } = get();
        if (!isActive || midi === null || !currentChordSymbol) return;

        // 1. Resolve Pitch Class
        const pc = midi % 12;

        // 2. Resolve Chord Tones
        const { root, quality } = parseChord(currentChordSymbol);
        const rootMidi = noteNameToMidi(root + '0') % 12;
        const intervals = CHORD_INTERVALS[quality] || [0, 4, 7]; // Fallback to major triad
        const chordPcs = intervals.map(i => (rootMidi + i) % 12);

        // 3. Identification Logic
        const isMatch = chordPcs.includes(pc);

        // Target Notes: 3rd and 7th
        const thirdPc = (rootMidi + intervals[1]) % 12;
        const isThird = pc === thirdPc;

        let isSeventh = false;
        if (intervals.length >= 4) {
            const seventhPc = (rootMidi + intervals[3]) % 12;
            isSeventh = pc === seventhPc;
        }

        const isPerfect = isMatch && (isThird || isSeventh);

        // Scoring weights
        let points = isMatch ? 1 : 0;
        if (isPerfect) {
            points += 0.5; // Mastery Bonus for target notes
        }

        set(state => {
            const newTotal = state.totalNotesProcessed + 1;
            const newMatching = state.matchingNotesCount + (isMatch ? 1 : 0);
            const newPerfect = state.perfectNotesCount + (isPerfect ? 1 : 0);

            const basePerformance = (newMatching / newTotal) * 100;
            const masteryFactor = (newPerfect / Math.max(1, newMatching)) * 20;
            const newScore = Math.min(100, Math.round(basePerformance + masteryFactor));

            const newHeatmap = { ...state.heatmap };
            const newMeasureTicks = { ...state.measureTicks };
            const newNotesByMeasure = { ...state.notesByMeasure };

            newHeatmap[measureIndex] = (newHeatmap[measureIndex] || 0) + points;
            newMeasureTicks[measureIndex] = (newMeasureTicks[measureIndex] || 0) + 1;

            // Store note (sample)
            if (!newNotesByMeasure[measureIndex]) newNotesByMeasure[measureIndex] = [];
            // Cap notes per measure to avoid memory bloat during long sessions (e.g. 50 samples max)
            if (newNotesByMeasure[measureIndex].length < 50) {
                newNotesByMeasure[measureIndex].push({ frequency, clarity, cents, timestamp: Date.now() });
            }

            return {
                totalNotesProcessed: newTotal,
                matchingNotesCount: newMatching,
                perfectNotesCount: newPerfect,
                score: newScore,
                grade: calculateGrade(newScore),
                heatmap: newHeatmap,
                measureTicks: newMeasureTicks,
                notesByMeasure: newNotesByMeasure
            };
        });
    }
}));
