import { create } from 'zustand';
import * as Tone from 'tone';
import { ConceptAnalyzer } from '../theory/ConceptAnalyzer';
import { GuideToneCalculator } from '../theory/GuideToneCalculator';
import type { Concept } from '../theory/AnalysisTypes';
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
    measures: string[][];
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
    guideTones: Map<number, GuideTone[]>;
    showGuideTones: boolean;
    /** Guide Tone Spotlight: mic listens; when student hits 3rd of chord, bar lights green */
    guideToneSpotlightMode: boolean;
    /** Measure indices where student hit the 3rd (for green bar) */
    guideToneBarsHit: Record<number, boolean>;
    showAnalysis: boolean;
    showRomanNumerals: boolean;
    hotspots: number[];

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
    setGuideToneSpotlightMode: (on: boolean) => void;
    addGuideToneBarHit: (measureIndex: number) => void;
    resetGuideToneBarsHit: () => void;
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
    guideToneSpotlightMode: false,
    guideToneBarsHit: {},
    showAnalysis: false,
    showRomanNumerals: false,
    hotspots: [],

    // --- Actions ---
    loadSong: async (song: JazzStandard) => {
        console.log('🎵 Loading song:', song.title);

        const flattenedChords = song.measures.flat();

        // Create mapping from chord index to measure index
        const chordToMeasureMap: number[] = [];
        song.measures.forEach((measureChords, mIndex) => {
            measureChords.forEach(() => {
                chordToMeasureMap.push(mIndex);
            });
        });

        // Analyze patterns and remap indices
        // We analyze the flattened chords first to find the progressions
        const analysisResult = ConceptAnalyzer.analyze(flattenedChords, song.key);

        // Then we remap the indices back to measure numbers
        // This logic assumes we have a mapping array where index = flattenedChordIndex and value = measureIndex
        const chordIndexToMeasureIndex: number[] = [];
        let currentChordIndex = 0;
        song.measures.forEach((measureChords, measureIndex) => {
            measureChords.forEach(() => {
                chordIndexToMeasureIndex[currentChordIndex] = measureIndex;
                currentChordIndex++;
            });
        });

        const mappedConcepts = analysisResult.concepts.map(c => ({
            ...c,
            // Map the chord index (linear) to the measure index (musical)
            startIndex: chordIndexToMeasureIndex[c.startIndex] ?? c.startIndex,
            // For endIndex, we want the measure where the LAST chord of the pattern resides
            endIndex: chordIndexToMeasureIndex[c.endIndex] ?? c.endIndex
        }));

        // Use original concepts (chord indices) for exercise chord slice; overlay/loop use mappedConcepts (measure indices)
        const exercises = ConceptAnalyzer.generateExercises({ ...analysisResult, concepts: analysisResult.concepts }, flattenedChords);

        // Calculate guide tones per measure
        const guideTones = new Map<number, GuideTone[]>();
        song.measures.forEach((measureChords, index) => {
            const gts = measureChords
                .map(chord => chord && chord !== '' ? GuideToneCalculator.calculate(chord) : null)
                .filter((gt): gt is GuideTone => gt !== null);

            if (gts.length > 0) guideTones.set(index, gts);
        });

        // Detect hotspots
        const { RomanNumeralAnalyzer } = await import('../theory/RomanNumeralAnalyzer');
        const hotspotData = RomanNumeralAnalyzer.detectHotspots(flattenedChords, song.key);
        const hotspots = hotspotData.filter((h: any) => h.isHotspot).map((h: any) => h.measureIndex);

        console.log(`✨ Detected ${analysisResult.concepts.length} patterns`);
        console.log(`🎯 Calculated guide tones for ${guideTones.size} measures`);
        console.log(`🔥 Found ${hotspots.length} hotspots`);

        set({

            currentSong: song,
            detectedPatterns: mappedConcepts,
            practiceExercises: exercises,
            activeFocusIndex: null,
            performanceHeatmap: {},
            guideTones,
            hotspots,
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

    setGuideToneSpotlightMode: (on: boolean) => {
        set({ guideToneSpotlightMode: on });
        if (!on) set({ guideToneBarsHit: {} });
    },
    addGuideToneBarHit: (measureIndex: number) => {
        set((state) => ({ guideToneBarsHit: { ...state.guideToneBarsHit, [measureIndex]: true } }));
    },
    resetGuideToneBarsHit: () => set({ guideToneBarsHit: {} }),

    toggleAnalysis: () => {
        set((state) => ({ showAnalysis: !state.showAnalysis }));
        console.log(`📊 Analysis ${get().showAnalysis ? 'ON' : 'OFF'}`);
    },
}));
