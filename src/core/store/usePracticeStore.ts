import { create } from 'zustand';
import * as Tone from 'tone';
import { ConceptAnalyzer } from '../theory/ConceptAnalyzer';
import { GuideToneCalculator } from '../theory/GuideToneCalculator';
import type { AnalysisResult, Concept } from '../theory/AnalysisTypes';
import type { GuideTone } from '../theory/GuideToneTypes';

interface PracticeExercise {
    type: string;
    startIndex: number;
    chords: string[];
    practiceScale?: string;
    practiceArpeggio?: string;
}

interface JazzStandard {
    title: string;
    chords: string[];
    key: string;
    bars?: number;
}

interface PracticeState {
    // --- Core State ---
    currentSong: JazzStandard | null;
    isPlaying: boolean;
    bpm: number;

    // --- Teaching Machine State ---
    detectedPatterns: Concept[];
    practiceExercises: PracticeExercise[];
    activeFocusIndex: number | null;
    userLatency: number;
    performanceHeatmap: Record<number, number>;

    // --- Guide Tones ---
    guideTones: Map<number, GuideTone>;
    showGuideTones: boolean;
    showAnalysis: boolean;

    // --- Actions ---
    loadSong: (song: JazzStandard) => void;
    togglePlayback: () => Promise<void>;
    setBpm: (newBpm: number) => void;
    calibrateLatency: (measuredDelta: number) => void;
    focusOnPattern: (patternIndex: number) => void;
    clearFocus: () => void;
    updateHeatmap: (measureIndex: number, successScore: number) => void;
    incrementBpm: (step?: number) => void;
    toggleGuideTones: () => void;
    toggleAnalysis: () => void;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
    // --- Core State ---
    currentSong: null,
    isPlaying: false,
    bpm: 120,

    // --- Teaching Machine State ---
    detectedPatterns: [],
    practiceExercises: [],
    activeFocusIndex: null,
    userLatency: 0,
    performanceHeatmap: {},
    guideTones: new Map(),
    showGuideTones: false,
    showAnalysis: false,

    // --- Actions ---
    loadSong: (song: JazzStandard) => {
        console.log('🎵 Loading song:', song.title);

        // Analyze patterns
        const analysisResult = ConceptAnalyzer.analyze(song.chords, song.key);
        const exercises = ConceptAnalyzer.generateExercises(analysisResult, song.chords);

        // Calculate guide tones
        const guideTones = new Map<number, GuideTone>();
        song.chords.forEach((chord, index) => {
            if (chord && chord !== '') {
                const gt = GuideToneCalculator.calculate(chord);
                if (gt) guideTones.set(index, gt);
            }
        });

        console.log(`✨ Detected ${analysisResult.concepts.length} patterns`);
        console.log(`🎯 Calculated ${guideTones.size} guide tones`);

        set({
            currentSong: song,
            detectedPatterns: analysisResult.concepts,
            practiceExercises: exercises,
            activeFocusIndex: null,
            performanceHeatmap: {},
            guideTones,
        });
    },

    togglePlayback: async () => {
        // Ensure audio context is running
        if (Tone.context.state !== 'running') {
            await Tone.start();
            console.log('🔊 Audio context started');
        }

        const { isPlaying } = get();

        if (isPlaying) {
            Tone.Transport.stop();
            console.log('⏸️ Playback stopped');
        } else {
            Tone.Transport.start();
            console.log('▶️ Playback started');
        }

        set({ isPlaying: !isPlaying });
    },

    setBpm: (newBpm: number) => {
        const clampedBpm = Math.max(40, Math.min(300, newBpm));
        Tone.Transport.bpm.value = clampedBpm;
        set({ bpm: clampedBpm });
        console.log(`🎚️ BPM set to ${clampedBpm}`);
    },

    // --- Latency Calibration ---
    calibrateLatency: (measuredDelta: number) => {
        set({ userLatency: measuredDelta });
        console.log(`⏱️ Latency calibrated: ${measuredDelta}ms`);
    },

    // --- Practice Drill Logic ---
    focusOnPattern: (patternIndex: number) => {
        const { detectedPatterns, currentSong } = get();

        if (!currentSong) {
            console.warn('No song loaded');
            return;
        }

        const pattern = detectedPatterns[patternIndex];

        if (pattern) {
            // Calculate loop boundaries
            // Assuming 1 chord = 1 measure (typical for jazz standards)
            const startMeasure = pattern.startIndex;
            const endMeasure = pattern.endIndex + 1; // +1 to include the last chord

            // Set Tone.Transport loop
            Tone.Transport.loop = true;
            Tone.Transport.loopStart = `${startMeasure}:0:0`;
            Tone.Transport.loopEnd = `${endMeasure}:0:0`;

            set({ activeFocusIndex: patternIndex });

            console.log(`🎯 Focusing on pattern ${patternIndex + 1}: ${pattern.type}`);
            console.log(`🔁 Loop set: measures ${startMeasure} - ${endMeasure}`);
        }
    },

    clearFocus: () => {
        Tone.Transport.loop = false;
        set({ activeFocusIndex: null });
        console.log('🔓 Focus cleared, loop disabled');
    },

    updateHeatmap: (measureIndex: number, successScore: number) => {
        set((state) => {
            const currentScore = state.performanceHeatmap[measureIndex] || 0;
            const newScore = currentScore + successScore;

            return {
                performanceHeatmap: {
                    ...state.performanceHeatmap,
                    [measureIndex]: newScore,
                }
            };
        });

        console.log(`📊 Updated heatmap for measure ${measureIndex}: +${successScore}`);
    },

    incrementBpm: (step: number = 5) => {
        const { bpm } = get();
        const newBpm = Math.min(bpm + step, 300);
        get().setBpm(newBpm);
        console.log(`⬆️ BPM increased to ${newBpm}`);
    },

    toggleGuideTones: () => {
        set((state) => ({ showGuideTones: !state.showGuideTones }));
        console.log(`🎯 Guide tones ${get().showGuideTones ? 'ON' : 'OFF'}`);
    },

    toggleAnalysis: () => {
        set((state) => ({ showAnalysis: !state.showAnalysis }));
        console.log(`📊 Analysis ${get().showAnalysis ? 'ON' : 'OFF'}`);
    },
}));
